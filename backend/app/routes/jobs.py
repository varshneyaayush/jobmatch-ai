from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, List
from app.database.session import get_db
from app.models.job import Job
from app.models.skill import Skill
from app.models.user import User, UserRole
from app.models.resume import Resume
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from app.routes.deps import get_current_user, get_optional_current_user, require_role
from app.ml.matching_engine import AIMatchingEngine

router = APIRouter(prefix="/jobs", tags=["Job Portal"])

def enrich_job_with_match(job: Job, candidate_user: Optional[User], db: Session) -> dict:
    job_skills_list = [s.name for s in job.skills]
    base_data = {
        "id": job.id,
        "recruiter_id": job.recruiter_id,
        "title": job.title,
        "company": job.company,
        "company_logo": job.company_logo,
        "description": job.description,
        "requirements": job.requirements,
        "responsibilities": job.responsibilities,
        "location": job.location,
        "location_type": job.location_type,
        "job_type": job.job_type,
        "experience_level": job.experience_level,
        "experience_years_required": job.experience_years_required,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "salary_currency": job.salary_currency,
        "salary_period": job.salary_period,
        "salary_text": job.salary_text,
        "is_active": job.is_active,
        "featured": job.featured,
        "created_at": job.created_at,
        "skills": [{"id": s.id, "name": s.name, "category": s.category} for s in job.skills],
        "recruiter": {
            "id": job.recruiter.id,
            "name": job.recruiter.name,
            "email": job.recruiter.email,
            "role": job.recruiter.role,
            "company_name": job.recruiter.company_name,
            "company_logo": job.recruiter.company_logo,
            "avatar_url": job.recruiter.avatar_url,
            "created_at": job.recruiter.created_at
        } if job.recruiter else None,
        "match_score": None,
        "compatibility_level": None,
        "matched_skills": [],
        "missing_skills": job_skills_list
    }

    if candidate_user and candidate_user.role == UserRole.JOB_SEEKER.value:
        profile = candidate_user.candidate_profile
        primary_resume = db.query(Resume).filter(Resume.user_id == candidate_user.id).order_by(Resume.is_primary.desc(), Resume.id.desc()).first()

        cand_skills = [s.name for s in profile.skills] if profile else []
        cand_exp = profile.experience_years if profile else 1.0
        cand_edu = profile.education if profile else "Bachelor's Degree"
        resume_text = primary_resume.extracted_text if primary_resume else " ".join(cand_skills)

        match_res = AIMatchingEngine.match_resume_to_job(
            resume_text=resume_text,
            candidate_skills=cand_skills,
            candidate_experience_years=cand_exp,
            candidate_education=cand_edu,
            job_title=job.title,
            job_description=job.description,
            job_requirements=job.requirements,
            job_skills=job_skills_list,
            job_experience_required=job.experience_years_required
        )
        base_data["match_score"] = match_res["match_percentage"]
        base_data["compatibility_level"] = match_res["compatibility_level"]
        base_data["matched_skills"] = match_res["matched_skills"]
        base_data["missing_skills"] = match_res["missing_skills"]

    return base_data

@router.get("", response_model=JobListResponse)
def get_jobs(
    q: Optional[str] = Query(None, description="Search term in title, company, description"),
    skill: Optional[str] = Query(None, description="Filter by required skill"),
    location: Optional[str] = Query(None, description="Filter by location"),
    location_type: Optional[str] = Query(None, description="Remote, Hybrid, On-site"),
    job_type: Optional[str] = Query(None, description="Full-time, Part-time, Contract, Internship"),
    experience_level: Optional[str] = Query(None, description="Entry, Mid-Level, Senior, Lead"),
    sort_by: Optional[str] = Query("newest", description="newest, match, salary_high"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_active == 1)

    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_pattern),
                Job.company.ilike(search_pattern),
                Job.description.ilike(search_pattern),
                Job.location.ilike(search_pattern)
            )
        )

    if location:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if location_type and location_type.lower() != "all":
        query = query.filter(Job.location_type.ilike(location_type))

    if job_type and job_type.lower() != "all":
        query = query.filter(Job.job_type.ilike(job_type))

    if experience_level and experience_level.lower() != "all":
        query = query.filter(Job.experience_level.ilike(experience_level))

    if skill:
        query = query.join(Job.skills).filter(Skill.name.ilike(skill))

    jobs = query.all()

    # Enrich with dynamic match scores if candidate is browsing
    enriched = [enrich_job_with_match(j, current_user, db) for j in jobs]

    # Sort results
    if sort_by == "match" and current_user and current_user.role == UserRole.JOB_SEEKER.value:
        enriched.sort(key=lambda x: (x["match_score"] or 0), reverse=True)
    elif sort_by == "salary_high":
        enriched.sort(key=lambda x: (x["salary_max"] or x["salary_min"] or 0), reverse=True)
    else:
        enriched.sort(key=lambda x: (x["featured"] * 10, x["created_at"]), reverse=True)

    return {
        "items": enriched,
        "total": len(enriched)
    }

@router.get("/recruiter/my-jobs")
def get_recruiter_jobs(
    current_user: User = Depends(require_role(UserRole.RECRUITER.value)),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).filter(Job.recruiter_id == current_user.id).order_by(Job.created_at.desc()).all()
    results = []
    for j in jobs:
        app_count = len(j.applications)
        top_score = max([a.match_score for a in j.applications], default=0.0) if app_count > 0 else 0.0
        results.append({
            "id": j.id,
            "title": j.title,
            "company": j.company,
            "location": j.location,
            "location_type": j.location_type,
            "job_type": j.job_type,
            "experience_level": j.experience_level,
            "salary_text": j.salary_text,
            "is_active": j.is_active,
            "created_at": j.created_at,
            "applications_count": app_count,
            "top_match_score": int(round(top_score)),
            "skills": [{"id": s.id, "name": s.name} for s in j.skills]
        })
    return results

@router.get("/{job_id}")
def get_job(
    job_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    enriched = enrich_job_with_match(job, current_user, db)

    # Detailed breakdown if candidate is logged in
    breakdown_data = None
    if current_user and current_user.role == UserRole.JOB_SEEKER.value:
        profile = current_user.candidate_profile
        primary_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.is_primary.desc()).first()
        cand_skills = [s.name for s in profile.skills] if profile else []
        cand_exp = profile.experience_years if profile else 1.0
        cand_edu = profile.education if profile else "Bachelor's Degree"
        resume_text = primary_resume.extracted_text if primary_resume else " ".join(cand_skills)

        breakdown_data = AIMatchingEngine.match_resume_to_job(
            resume_text=resume_text,
            candidate_skills=cand_skills,
            candidate_experience_years=cand_exp,
            candidate_education=cand_edu,
            job_title=job.title,
            job_description=job.description,
            job_requirements=job.requirements,
            job_skills=[s.name for s in job.skills],
            job_experience_required=job.experience_years_required
        )

    return {
        **enriched,
        "match_details": breakdown_data
    }

@router.post("", response_model=JobResponse)
def create_job(
    data: JobCreate,
    current_user: User = Depends(require_role(UserRole.RECRUITER.value)),
    db: Session = Depends(get_db)
):
    job = Job(
        recruiter_id=current_user.id,
        title=data.title.strip(),
        company=data.company.strip() or current_user.company_name or "Tech Innovator",
        company_logo=data.company_logo or current_user.company_logo,
        description=data.description.strip(),
        requirements=data.requirements.strip() if data.requirements else None,
        responsibilities=data.responsibilities.strip() if data.responsibilities else None,
        location=data.location.strip(),
        location_type=data.location_type,
        job_type=data.job_type,
        experience_level=data.experience_level,
        experience_years_required=data.experience_years_required,
        salary_min=data.salary_min,
        salary_max=data.salary_max,
        salary_currency=data.salary_currency,
        salary_period=data.salary_period,
        salary_text=data.salary_text,
        is_active=1
    )

    skill_objs = []
    for s_name in data.skills:
        clean = s_name.strip()
        if not clean: continue
        skill = db.query(Skill).filter(Skill.name.ilike(clean)).first()
        if not skill:
            skill = Skill(name=clean)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        skill_objs.append(skill)
    job.skills = skill_objs

    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this job posting.")

    for field, val in data.model_dump(exclude_unset=True).items():
        if field == "skills" and val is not None:
            skill_objs = []
            for s_name in val:
                clean = s_name.strip()
                if not clean: continue
                skill = db.query(Skill).filter(Skill.name.ilike(clean)).first()
                if not skill:
                    skill = Skill(name=clean)
                    db.add(skill)
                    db.commit()
                    db.refresh(skill)
                skill_objs.append(skill)
            job.skills = skill_objs
        elif field != "skills":
            setattr(job, field, val)

    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Permission denied.")

    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully"}
