"""
Local AI Matching Engine — Computes match scores between resume and jobs.

All matching happens locally. Gemini is ONLY called once (during resume upload).
After that, skill overlap + role similarity scoring runs entirely on the backend.
"""

import re
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("uvicorn")


def compute_match_score(
    resume_skills: List[str],
    resume_roles: List[str],
    job_skills: List[str],
    job_title: str,
    resume_experience_level: str = "",
    job_experience_level: str = "",
) -> Tuple[int, str, List[str]]:
    """
    Compute match score between resume and a single job.

    Returns: (match_percentage, why_matched, missing_skills)
    """
    # Normalize to lowercase sets for comparison
    resume_set = {s.lower().strip() for s in resume_skills if s.strip()}
    job_set = {s.lower().strip() for s in job_skills if s.strip()}
    role_set = {r.lower().strip() for r in resume_roles if r.strip()}

    if not job_set:
        # No skills to compare against — give a baseline score
        return 40, "General role match based on your profile.", []

    # ── 1. Skill overlap score (0–100) ──────────────────────────────────────
    matched = resume_set & job_set
    skill_score = (len(matched) / len(job_set)) * 100

    # ── 2. Role/title similarity bonus (0–20) ──────────────────────────────
    title_lower = job_title.lower()
    role_bonus = 0
    matched_role = None

    for role in role_set:
        if role in title_lower or title_lower in role:
            role_bonus = 20
            matched_role = role
            break

    if not role_bonus:
        # Partial keyword overlap check
        for role in role_set:
            role_words = set(role.split())
            title_words = set(title_lower.split())
            overlap = role_words & title_words
            if overlap:
                role_bonus = min(15, len(overlap) * 7)
                break

    # ── 3. Experience level fit bonus (0–5) ─────────────────────────────────
    exp_bonus = 0
    if resume_experience_level and job_experience_level:
        if resume_experience_level.lower() == job_experience_level.lower():
            exp_bonus = 5

    # ── 4. Final composite score ────────────────────────────────────────────
    # Weighted: 70% skills, 20% role fit, 10% experience
    raw_score = (skill_score * 0.70) + (role_bonus * 1.0) + (exp_bonus * 1.0)
    match_pct = max(10, min(99, int(raw_score)))

    # ── 5. Generate explanation ─────────────────────────────────────────────
    matched_display = [s.title() if len(s) > 3 else s.upper() for s in list(matched)[:4]]

    if len(matched_display) >= 3:
        why = f"Strong match — your expertise in {', '.join(matched_display[:3])} aligns well with this role."
    elif len(matched_display) == 2:
        why = f"Matched due to your proficiency in {matched_display[0]} and {matched_display[1]}."
    elif len(matched_display) == 1:
        why = f"Matched because of your experience with {matched_display[0]}."
    else:
        if matched_role:
            why = f"Role similarity — your target role '{matched_role.title()}' closely matches this position."
        else:
            why = "General profile alignment with this position."

    # ── 6. Missing skills ───────────────────────────────────────────────────
    missing = job_set - resume_set
    missing_display = [s.title() if len(s) > 3 else s.upper() for s in list(missing)[:6]]

    return match_pct, why, missing_display


def match_jobs_to_resume(
    resume_data: Dict[str, Any],
    jobs: List[Dict[str, Any]],
    is_premium: bool = False,
) -> List[Dict[str, Any]]:
    """
    Match a list of jobs against resume data. Returns jobs sorted by match
    percentage descending, with freemium lock logic applied.
    """
    # Extract resume attributes
    resume_skills = (
        resume_data.get("skills", [])
        + resume_data.get("technical_skills", [])
    )
    # Deduplicate
    seen = set()
    unique_skills = []
    for s in resume_skills:
        sl = s.lower().strip()
        if sl and sl not in seen:
            seen.add(sl)
            unique_skills.append(s)
    resume_skills = unique_skills

    resume_roles = resume_data.get("suggested_roles", [])
    resume_exp = resume_data.get("experience_level", "")

    results = []

    for job in jobs:
        # Get job skills — from extracted_skills field or parse required_skills string
        job_skills = job.get("extracted_skills", [])
        if not job_skills:
            raw = job.get("required_skills", "")
            job_skills = [s.strip() for s in raw.split(",") if s.strip()]

        job_title = job.get("title", "")
        job_exp = job.get("experience_level", "")

        match_pct, why_matched, missing_skills = compute_match_score(
            resume_skills=resume_skills,
            resume_roles=resume_roles,
            job_skills=job_skills,
            job_title=job_title,
            resume_experience_level=resume_exp,
            job_experience_level=job_exp,
        )

        results.append({
            **job,
            "match_percentage": match_pct,
            "why_matched": why_matched,
            "missing_skills": missing_skills,
            "is_locked": False,
        })

    # Sort by match descending
    results.sort(key=lambda x: x["match_percentage"], reverse=True)

    # Apply freemium lock
    if not is_premium:
        for idx in range(len(results)):
            if idx >= 5:
                results[idx]["is_locked"] = True
                results[idx]["description"] = "Upgrade to Premium to view full details."
                results[idx]["apply_url"] = "#"
                results[idx]["salary"] = "🔒 Premium"
                results[idx]["missing_skills"] = ["🔒 Locked"]

    return results
