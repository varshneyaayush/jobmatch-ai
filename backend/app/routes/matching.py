from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.database.session import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User, UserRole
from app.routes.deps import get_current_user, get_optional_current_user
from app.ml.matching_engine import AIMatchingEngine

router = APIRouter(prefix="/matching", tags=["AI Matching"])

class VisualDemoRequest(BaseModel):
    resume_skills: List[str]
    job_skills: List[str]
    job_title: Optional[str] = "AI Engineer"
    candidate_exp: Optional[float] = 3.5
    required_exp: Optional[float] = 3.0

@router.post("/resume-job")
def match_resume_to_job(
    job_id: int,
    resume_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job_skills = [s.name for s in job.skills]

    # Get resume
    resume = None
    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
    elif current_user:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.is_primary.desc(), Resume.id.desc()).first()

    cand_skills = []
    cand_exp = 2.0
    cand_edu = "Bachelor's Degree"
    resume_text = ""

    if resume:
        resume_text = resume.extracted_text
        if current_user and current_user.candidate_profile:
            cand_skills = [s.name for s in current_user.candidate_profile.skills]
            cand_exp = current_user.candidate_profile.experience_years
            cand_edu = current_user.candidate_profile.education or "Bachelor's Degree"
        else:
            # Extract on the fly
            cand_skills = job_skills[:3]
    elif current_user and current_user.candidate_profile:
        cand_skills = [s.name for s in current_user.candidate_profile.skills]
        cand_exp = current_user.candidate_profile.experience_years
        cand_edu = current_user.candidate_profile.education or "Bachelor's Degree"
        resume_text = " ".join(cand_skills)
    else:
        # Default fallback for unauthenticated preview
        cand_skills = ["Python", "Machine Learning", "SQL", "Pandas", "FastAPI"]
        resume_text = "Experienced software engineer specializing in Python, Machine Learning, and API systems."

    match_result = AIMatchingEngine.match_resume_to_job(
        resume_text=resume_text,
        candidate_skills=cand_skills,
        candidate_experience_years=cand_exp,
        candidate_education=cand_edu,
        job_title=job.title,
        job_description=job.description,
        job_requirements=job.requirements,
        job_skills=job_skills,
        job_experience_required=job.experience_years_required
    )

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        **match_result
    }

@router.get("/recommendations")
def get_recommendations(
    limit: int = 8,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.candidate_profile
    primary_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.is_primary.desc(), Resume.id.desc()).first()

    cand_skills = [s.name for s in profile.skills] if profile else []
    cand_exp = profile.experience_years if profile else 1.0
    cand_edu = profile.education if profile else "Bachelor's Degree"
    resume_text = primary_resume.extracted_text if primary_resume else " ".join(cand_skills)

    jobs = db.query(Job).filter(Job.is_active == 1).all()
    recommendations = []

    for job in jobs:
        job_skills = [s.name for s in job.skills]
        match_res = AIMatchingEngine.match_resume_to_job(
            resume_text=resume_text,
            candidate_skills=cand_skills,
            candidate_experience_years=cand_exp,
            candidate_education=cand_edu,
            job_title=job.title,
            job_description=job.description,
            job_requirements=job.requirements,
            job_skills=job_skills,
            job_experience_required=job.experience_years_required
        )
        recommendations.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "company_logo": job.company_logo,
            "location": job.location,
            "location_type": job.location_type,
            "job_type": job.job_type,
            "experience_level": job.experience_level,
            "salary_text": job.salary_text,
            "skills": [{"id": s.id, "name": s.name} for s in job.skills],
            "match_score": match_res["match_percentage"],
            "compatibility_level": match_res["compatibility_level"],
            "matched_skills": match_res["matched_skills"],
            "missing_skills": match_res["missing_skills"]
        })

    # Sort strictly by match score descending
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations[:limit]

@router.post("/visual-demo")
def visual_demo_matching(data: VisualDemoRequest):
    """Provides instant calculations for interactive landing page demo."""
    dummy_text = f"Professional candidate with expertise in {', '.join(data.resume_skills)} with {data.candidate_exp} years experience."
    job_desc = f"Looking for {data.job_title} with strong background in {', '.join(data.job_skills)}."

    match_res = AIMatchingEngine.match_resume_to_job(
        resume_text=dummy_text,
        candidate_skills=data.resume_skills,
        candidate_experience_years=data.candidate_exp or 3.0,
        candidate_education="B.S. in Computer Science",
        job_title=data.job_title or "Engineer",
        job_description=job_desc,
        job_requirements=job_desc,
        job_skills=data.job_skills,
        job_experience_required=data.required_exp or 2.0
    )

    return match_res
