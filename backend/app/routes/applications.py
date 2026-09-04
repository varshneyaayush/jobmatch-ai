import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.application import Application, ApplicationStatus
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.routes.deps import get_current_user, require_role
from app.ml.matching_engine import AIMatchingEngine

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("", status_code=status.HTTP_201_CREATED)
def apply_to_job(
    data: ApplicationCreate,
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER.value)),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")

    profile = current_user.candidate_profile
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Check already applied
    existing = db.query(Application).filter(
        Application.job_id == job.id,
        Application.candidate_id == profile.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this position.")

    # Calculate real-time match score
    primary_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.is_primary.desc(), Resume.id.desc()).first()

    cand_skills = [s.name for s in profile.skills]
    cand_exp = profile.experience_years
    cand_edu = profile.education or "Bachelor's Degree"
    resume_text = primary_resume.extracted_text if primary_resume else " ".join(cand_skills)

    match_res = AIMatchingEngine.match_resume_to_job(
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

    app_record = Application(
        job_id=job.id,
        candidate_id=profile.id,
        resume_id=primary_resume.id if primary_resume else None,
        match_score=float(match_res["match_percentage"]),
        match_breakdown_json=json.dumps(match_res),
        cover_note=data.cover_note,
        status=ApplicationStatus.APPLIED
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return {
        "success": True,
        "application_id": app_record.id,
        "match_score": app_record.match_score,
        "status": app_record.status,
        "message": "Application submitted successfully with AI match analysis."
    }

@router.get("/my-applications")
def get_my_applications(
    current_user: User = Depends(require_role(UserRole.JOB_SEEKER.value)),
    db: Session = Depends(get_db)
):
    profile = current_user.candidate_profile
    if not profile:
        return []

    apps = db.query(Application).filter(Application.candidate_id == profile.id).order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        job = a.job
        breakdown = {}
        if a.match_breakdown_json:
            try:
                breakdown = json.loads(a.match_breakdown_json)
            except Exception:
                pass
        
        results.append({
            "id": a.id,
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "location": job.location,
            "location_type": job.location_type,
            "salary_text": job.salary_text,
            "match_score": int(round(a.match_score)),
            "status": a.status,
            "applied_at": a.applied_at,
            "updated_at": a.updated_at,
            "match_breakdown": breakdown
        })
    return results

@router.get("/job/{job_id}/candidates")
def get_job_candidates(
    job_id: int,
    current_user: User = Depends(require_role(UserRole.RECRUITER.value)),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Permission denied")

    apps = db.query(Application).filter(Application.job_id == job.id).all()
    results = []
    for a in apps:
        cand = a.candidate
        user = cand.user if cand else None
        breakdown = {}
        if a.match_breakdown_json:
            try:
                breakdown = json.loads(a.match_breakdown_json)
            except Exception:
                pass

        results.append({
            "application_id": a.id,
            "candidate_id": cand.id if cand else 0,
            "candidate_name": user.name if user else "Candidate",
            "candidate_email": user.email if user else "",
            "headline": cand.headline if cand else "",
            "location": cand.location if cand else "",
            "experience_years": cand.experience_years if cand else 0.0,
            "education": cand.education if cand else "",
            "skills": [s.name for s in cand.skills] if cand else [],
            "match_score": int(round(a.match_score)),
            "compatibility_level": breakdown.get("compatibility_level", "Good Fit"),
            "matched_skills": breakdown.get("matched_skills", []),
            "missing_skills": breakdown.get("missing_skills", []),
            "experience_match": breakdown.get("experience_match", "Strong"),
            "education_match": breakdown.get("education_match", "Strong"),
            "status": a.status,
            "cover_note": a.cover_note,
            "notes": a.notes,
            "applied_at": a.applied_at,
            "resume_id": a.resume_id
        })

    # Sort candidates strictly by AI match score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results

@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(UserRole.RECRUITER.value)),
    db: Session = Depends(get_db)
):
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    job = app_record.job
    if job.recruiter_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Permission denied")

    app_record.status = data.status
    if data.notes is not None:
        app_record.notes = data.notes

    db.commit()
    return {"success": True, "status": app_record.status, "message": f"Candidate status updated to {app_record.status}"}
