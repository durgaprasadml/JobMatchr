from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict
from datetime import datetime

# Auth schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_premium: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Resume parsing schemas
class ResumeData(BaseModel):
    full_name: str
    skills: List[str]
    technical_skills: List[str]
    soft_skills: List[str]
    education: List[str]
    certifications: List[str]
    projects: List[str]
    experience_level: str
    years_of_experience: float
    suggested_roles: List[str]
    ats_score: int
    missing_skills: List[str]
    strong_areas: List[str]
    resume_summary: str

class ResumeUploadResponse(BaseModel):
    success: bool
    session_id: str
    data: ResumeData

# Job schemas
class JobBase(BaseModel):
    title: str
    company_name: str
    company_logo: Optional[str] = None
    location: str
    salary: Optional[str] = None
    job_type: str
    workplace_type: str
    experience_level: str
    role_category: str
    company_type: Optional[str] = None
    required_skills: str
    description: str
    apply_url: str

class JobResponse(JobBase):
    id: int
    created_at: datetime
    
    # Matching fields (populated dynamically when matched against user resume)
    match_percentage: Optional[int] = 0
    why_matched: Optional[str] = None
    missing_skills: Optional[List[str]] = []
    is_locked: Optional[bool] = False

    class Config:
        from_attributes = True

class SavedJobResponse(BaseModel):
    id: int
    job: JobResponse

    class Config:
        from_attributes = True

# Live JSearch job schemas (not from DB — no id/created_at)
class LiveJobResponse(BaseModel):
    title: str
    company_name: str
    company_logo: Optional[str] = None
    location: str
    salary: Optional[str] = None
    job_type: str
    workplace_type: str
    experience_level: str
    role_category: str
    company_type: Optional[str] = None
    required_skills: str
    description: str
    apply_url: str

    # Matching fields
    match_percentage: Optional[int] = 0
    why_matched: Optional[str] = None
    missing_skills: Optional[List[str]] = []
    is_locked: Optional[bool] = False

class MatchJobsResponse(BaseModel):
    success: bool
    total_jobs: int
    query_used: Optional[List[str]] = []
    jobs: List[LiveJobResponse]
    cached: Optional[bool] = False
