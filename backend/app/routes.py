import hashlib
import logging
import os
import tempfile
import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.config import settings
from app.models import User, Job, SavedJob
from app.schemas import (
    UserCreate, UserResponse, Token, ResumeUploadResponse, ResumeData,
    JobResponse, SavedJobResponse, LiveJobResponse, MatchJobsResponse
)
from app.services.session_service import session_service
from app.services.gemini_service import gemini_service
from app.services.jsearch_service import jsearch_service
from app.services.matcher import match_jobs_to_resume
from resume_parser import parse_resume_file

logger = logging.getLogger("uvicorn")

router = APIRouter()

# Simple Helper for password hashing (no bcrypt dependency needed)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_current_user_optional(authorization: Optional[str] = Query(None)) -> Optional[User]:
    # Support client passing email directly in header/query for testing ease, or standard authorization
    # For robust demo purposes, we will return a default user or mock user if none passed
    # Let's make it super user-friendly
    return None

@router.post("/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user_in.password)
    user = User(email=user_in.email, hashed_password=hashed, is_premium=False)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/auth/login")
def login(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if not db_user or db_user.hashed_password != hash_password(user_in.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Return simple token (just the email for simplicity)
    return {"access_token": db_user.email, "token_type": "bearer", "is_premium": db_user.is_premium}

@router.get("/auth/me", response_model=UserResponse)
def get_me(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/user/premium", response_model=UserResponse)
def upgrade_premium(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_premium = True
    db.commit()
    db.refresh(user)
    return user

@router.post("/user/downgrade", response_model=UserResponse)
def downgrade_premium(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_premium = False
    db.commit()
    db.refresh(user)
    return user

@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    # Verify file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF or DOCX file."
        )
        
    temp_path = None
    try:
        # Create a temporary file securely
        t_save_start = time.time()
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        t_save_duration = time.time() - t_save_start
        logger.info(f"Temp file saved in {t_save_duration:.3f}s: {temp_path}")

        # Parse text using PyMuPDF / python-docx (includes validation & cleanup)
        t_extract_start = time.time()
        try:
            text = parse_resume_file(temp_path, file.filename)
        except ValueError as ve:
            raise HTTPException(
                status_code=400,
                detail=str(ve)
            )
        t_extract_duration = time.time() - t_extract_start
        logger.info(f"Text extracted and cleaned in {t_extract_duration:.3f}s. Char count: {len(text)}")
        
        # Parse text using Gemini API
        t_gemini_start = time.time()
        parsed_data = gemini_service.parse_resume(text, file.filename)
        t_gemini_duration = time.time() - t_gemini_start
        logger.info(f"Gemini parsed structured data in {t_gemini_duration:.3f}s")
        
        # Store in session (expires automatically in 30 mins)
        t_session_start = time.time()
        if not session_id:
            # Create new session UUID
            session_id = session_service.create_session(parsed_data)
        else:
            session_service.set_session(session_id, parsed_data)
        t_session_duration = time.time() - t_session_start
        logger.debug(f"Session stored in {t_session_duration:.3f}s")
        
        total_duration = time.time() - start_time
        logger.info(f"Total upload & processing pipeline completed in {total_duration:.3f}s (session_id={session_id})")
            
        return {
            "success": True,
            "session_id": session_id,
            "data": parsed_data
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume: {str(e)}")
    finally:
        # Secure cleanup: remove the temp file immediately
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.error(f"Error deleting temp file {temp_path}: {e}")

@router.post("/resume/rescan")
def rescan_resume(session_id: str = Query(...)):
    session_service.delete_session(session_id)
    return {"success": True, "message": "Resume session cleared."}


# ─── LIVE JOB MATCHING (JSearch API) ──────────────────────────────────────────

@router.post("/match-jobs", response_model=MatchJobsResponse)
def match_jobs(
    session_id: str = Query(...),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Main pipeline: Resume session → JSearch API → Local matching → Ranked results.
    Gemini is NOT called here — it was already called during resume upload.
    """
    start_time = time.time()
    # 1. Get resume data from session
    resume_data = session_service.get_session(session_id)
    if not resume_data:
        raise HTTPException(
            status_code=404,
            detail="Resume session expired or not found. Please upload your resume again."
        )

    # 2. Check premium status
    is_premium = False
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            is_premium = user.is_premium

    # 3. Fetch live jobs from JSearch (with caching)
    t_jsearch_start = time.time()
    is_fallback = False
    try:
        raw_jobs = jsearch_service.search_jobs_for_resume(resume_data)
    except Exception as e:
        logger.error(f"JSearch pipeline error: {e}")
        raw_jobs = []
    t_jsearch_duration = time.time() - t_jsearch_start
    logger.info(f"JSearch fetched jobs in {t_jsearch_duration:.3f}s. Count: {len(raw_jobs)}")

    if not raw_jobs:
        # Fall back to local database jobs if no live jobs returned or JSearch failed
        t_fallback_start = time.time()
        logger.info("JSearch returned no live jobs. Falling back to local database jobs...")
        db_jobs = db.query(Job).all()
        # Convert SQLAlchemy objects to dictionaries for match_jobs_to_resume
        raw_jobs = []
        for job in db_jobs:
            raw_jobs.append({
                "title": job.title,
                "company_name": job.company_name,
                "company_logo": job.company_logo,
                "location": job.location,
                "salary": job.salary,
                "job_type": job.job_type,
                "workplace_type": job.workplace_type,
                "experience_level": job.experience_level,
                "role_category": job.role_category,
                "company_type": job.company_type,
                "required_skills": job.required_skills,
                "description": job.description,
                "apply_url": job.apply_url,
            })
        is_fallback = True
        logger.info(f"Database jobs fallback retrieval completed in {time.time() - t_fallback_start:.3f}s. Count: {len(raw_jobs)}")

    # 4. Run local matching engine (no external AI calls)
    t_matching_start = time.time()
    matched_jobs = match_jobs_to_resume(resume_data, raw_jobs, is_premium)
    t_matching_duration = time.time() - t_matching_start
    logger.info(f"Local matching engine finished in {t_matching_duration:.3f}s")

    # 5. Build response
    queries_used = jsearch_service.build_search_queries(resume_data)
    live_responses = []
    for job in matched_jobs:
        live_responses.append(LiveJobResponse(
            title=job.get("title", ""),
            company_name=job.get("company_name", ""),
            company_logo=job.get("company_logo"),
            location=job.get("location", "India"),
            salary=job.get("salary"),
            job_type=job.get("job_type", "Full-time"),
            workplace_type=job.get("workplace_type", "On-site"),
            experience_level=job.get("experience_level", "Mid"),
            role_category=job.get("role_category", "Engineering"),
            company_type=job.get("company_type"),
            required_skills=job.get("required_skills", ""),
            description=job.get("description", ""),
            apply_url=job.get("apply_url", "#"),
            match_percentage=job.get("match_percentage", 0),
            why_matched=job.get("why_matched"),
            missing_skills=job.get("missing_skills", []),
            is_locked=job.get("is_locked", False),
        ))

    total_duration = time.time() - start_time
    logger.info(f"Total match-jobs duration: {total_duration:.3f}s. Fallback used: {is_fallback}")

    return MatchJobsResponse(
        success=True,
        total_jobs=len(live_responses),
        query_used=queries_used,
        jobs=live_responses,
        cached=is_fallback,
    )

@router.get("/jobs", response_model=List[JobResponse])
def get_jobs(
    session_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    workplace_type: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    role_category: Optional[str] = Query(None),
    company_type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    # Get user premium status
    is_premium = False
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            is_premium = user.is_premium

    # Query all jobs
    query = db.query(Job)
    
    # Apply basic text filters
    if q:
        query = query.filter(
            (Job.title.ilike(f"%{q}%")) | 
            (Job.company_name.ilike(f"%{q}%")) | 
            (Job.description.ilike(f"%{q}%")) |
            (Job.required_skills.ilike(f"%{q}%"))
        )
    if job_type:
        query = query.filter(Job.job_type == job_type)
    if workplace_type:
        query = query.filter(Job.workplace_type == workplace_type)
    if experience_level:
        query = query.filter(Job.experience_level == experience_level)
    if role_category:
        query = query.filter(Job.role_category == role_category)
    if company_type:
        query = query.filter(Job.company_type == company_type)
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
        
    jobs = query.all()
    
    # Retrieve resume data from session if session_id exists
    resume_data = None
    if session_id:
        resume_data = session_service.get_session(session_id)
        
    response_list = []
    
    if resume_data:
        # Match using engine
        matched_tuples = gemini_service.calculate_job_matches(resume_data, jobs)
        
        for idx, (job, match_pct, why, missing) in enumerate(matched_tuples):
            # Check if this job should be locked (beyond 5th match for non-premium user)
            is_locked = False
            if not is_premium and idx >= 5:
                is_locked = True
                
            job_resp = JobResponse(
                id=job.id,
                title=job.title,
                company_name=job.company_name,
                company_logo=job.company_logo,
                location=job.location,
                salary=job.salary if not is_locked else "$🔒,🔒🔒🔒 - $🔒,🔒🔒🔒",
                job_type=job.job_type,
                workplace_type=job.workplace_type,
                experience_level=job.experience_level,
                role_category=job.role_category,
                company_type=job.company_type,
                required_skills=job.required_skills,
                description=job.description if not is_locked else "Upgrade to Premium to view full details.",
                apply_url=job.apply_url if not is_locked else "#",
                created_at=job.created_at,
                match_percentage=match_pct,
                why_matched=why,
                missing_skills=missing if not is_locked else ["🔒 Locked"],
                is_locked=is_locked
            )
            response_list.append(job_resp)
    else:
        # No resume uploaded, return standard job list sorted by date, with 0 match
        for idx, job in enumerate(sorted(jobs, key=lambda x: x.created_at, reverse=True)):
            is_locked = False
            if not is_premium and idx >= 5:
                is_locked = True
                
            job_resp = JobResponse(
                id=job.id,
                title=job.title,
                company_name=job.company_name,
                company_logo=job.company_logo,
                location=job.location,
                salary=job.salary if not is_locked else "$🔒,🔒🔒🔒 - $🔒,🔒🔒🔒",
                job_type=job.job_type,
                workplace_type=job.workplace_type,
                experience_level=job.experience_level,
                role_category=job.role_category,
                company_type=job.company_type,
                required_skills=job.required_skills,
                description=job.description if not is_locked else "Upgrade to Premium to view full details.",
                apply_url=job.apply_url if not is_locked else "#",
                created_at=job.created_at,
                match_percentage=0,
                why_matched="Upload a resume to see AI matching analysis.",
                missing_skills=[],
                is_locked=is_locked
            )
            response_list.append(job_resp)
            
    return response_list

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: int,
    session_id: Optional[str] = Query(None),
    email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    is_premium = False
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            is_premium = user.is_premium
            
    # Check if job is premium-locked for this user
    # To determine position, we fetch the matched job sequence if session_id is active
    is_locked = False
    resume_data = None
    
    if session_id:
        resume_data = session_service.get_session(session_id)
        
    if not is_premium:
        # Determine position of job in lists
        all_jobs = db.query(Job).all()
        if resume_data:
            matched_tuples = gemini_service.calculate_job_matches(resume_data, all_jobs)
            for idx, (j, *_) in enumerate(matched_tuples):
                if j.id == job.id:
                    if idx >= 5:
                        is_locked = True
                    break
        else:
            # Date sorting
            sorted_jobs = sorted(all_jobs, key=lambda x: x.created_at, reverse=True)
            for idx, j in enumerate(sorted_jobs):
                if j.id == job.id:
                    if idx >= 5:
                        is_locked = True
                    break
                    
    if is_locked:
        raise HTTPException(
            status_code=403,
            detail="This job is locked. Upgrade to Premium to access details."
        )
        
    # Calculate match properties if resume is present
    match_pct = 0
    why = "Upload a resume to see AI matching analysis."
    missing = []
    
    if resume_data:
        matched_tuples = gemini_service.calculate_job_matches(resume_data, [job])
        if matched_tuples:
            _, match_pct, why, missing = matched_tuples[0]
            
    return JobResponse(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        company_logo=job.company_logo,
        location=job.location,
        salary=job.salary,
        job_type=job.job_type,
        workplace_type=job.workplace_type,
        experience_level=job.experience_level,
        role_category=job.role_category,
        company_type=job.company_type,
        required_skills=job.required_skills,
        description=job.description,
        apply_url=job.apply_url,
        created_at=job.created_at,
        match_percentage=match_pct,
        why_matched=why,
        missing_skills=missing,
        is_locked=False
    )

@router.post("/jobs/{job_id}/save", response_model=SavedJobResponse)
def save_job(job_id: int, email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    existing = db.query(SavedJob).filter(SavedJob.user_id == user.id, SavedJob.job_id == job_id).first()
    if existing:
        return {"id": existing.id, "job": job}
        
    saved = SavedJob(user_id=user.id, job_id=job_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    
    # Populate matching details dynamically (empty here since no session_id is tied)
    job_resp = JobResponse(
        id=job.id,
        title=job.title,
        company_name=job.company_name,
        company_logo=job.company_logo,
        location=job.location,
        salary=job.salary,
        job_type=job.job_type,
        workplace_type=job.workplace_type,
        experience_level=job.experience_level,
        role_category=job.role_category,
        company_type=job.company_type,
        required_skills=job.required_skills,
        description=job.description,
        apply_url=job.apply_url,
        created_at=job.created_at,
        match_percentage=0,
        why_matched="Saved job details.",
        missing_skills=[],
        is_locked=False
    )
    
    return {"id": saved.id, "job": job_resp}

@router.get("/saved-jobs", response_model=List[SavedJobResponse])
def get_saved_jobs(email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    saved = db.query(SavedJob).filter(SavedJob.user_id == user.id).all()
    results = []
    for s in saved:
        j = s.job
        job_resp = JobResponse(
            id=j.id,
            title=j.title,
            company_name=j.company_name,
            company_logo=j.company_logo,
            location=j.location,
            salary=j.salary,
            job_type=j.job_type,
            workplace_type=j.workplace_type,
            experience_level=j.experience_level,
            role_category=j.role_category,
            company_type=j.company_type,
            required_skills=j.required_skills,
            description=j.description,
            apply_url=j.apply_url,
            created_at=j.created_at,
            match_percentage=0,
            why_matched="Saved Job",
            missing_skills=[],
            is_locked=False
        )
        results.append({"id": s.id, "job": job_resp})
    return results

@router.delete("/saved-jobs/{saved_id}")
def delete_saved_job(saved_id: int, email: str = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    saved = db.query(SavedJob).filter(SavedJob.id == saved_id, SavedJob.user_id == user.id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved job not found")
        
    db.delete(saved)
    db.commit()
    return {"success": True}
