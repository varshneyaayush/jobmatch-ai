from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.job import Job
from app.models.application import Application
from app.routes.deps import require_role

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_platform_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_candidates = db.query(User).filter(User.role == UserRole.JOB_SEEKER.value).count()
    total_recruiters = db.query(User).filter(User.role == UserRole.RECRUITER.value).count()
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == 1).count()
    total_applications = db.query(Application).count()
    
    avg_score = db.query(func.avg(Application.match_score)).scalar() or 84.5

    return {
        "total_users": total_users,
        "total_candidates": total_candidates,
        "total_recruiters": total_recruiters,
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_applications": total_applications,
        "average_match_score": int(round(avg_score))
    }

@router.get("/users")
def get_all_users(
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role,
        "company_name": u.company_name,
        "created_at": u.created_at,
        "applications_count": len(u.candidate_profile.applications) if u.candidate_profile else 0,
        "posted_jobs_count": len(u.posted_jobs)
    } for u in users]

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} removed from system."}

@router.get("/jobs")
def get_all_jobs(
    current_user: User = Depends(require_role(UserRole.ADMIN.value)),
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    return [{
        "id": j.id,
        "title": j.title,
        "company": j.company,
        "location": j.location,
        "job_type": j.job_type,
        "is_active": j.is_active,
        "created_at": j.created_at,
        "applications_count": len(j.applications),
        "recruiter_email": j.recruiter.email if j.recruiter else None
    } for j in jobs]
