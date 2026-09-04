from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.skill import Skill
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, DemoLoginRequest
from app.schemas.user import UserResponse, CandidateProfileUpdate, CandidateProfileResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.routes.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(User).filter(User.email.ilike(data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Validate role
    role = data.role.lower()
    if role not in [UserRole.JOB_SEEKER.value, UserRole.RECRUITER.value, UserRole.ADMIN.value]:
        role = UserRole.JOB_SEEKER.value

    user = User(
        name=data.name.strip(),
        email=data.email.strip().lower(),
        password_hash=get_password_hash(data.password),
        role=role,
        company_name=data.company_name.strip() if data.company_name else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If job seeker, initialize empty CandidateProfile
    if user.role == UserRole.JOB_SEEKER.value:
        profile = CandidateProfile(
            user_id=user.id,
            headline="Aspiring Tech Professional",
            bio="Seeking exciting opportunities to make an impact.",
            experience_years=1.0,
            education="Bachelor's Degree",
            profile_score=40
        )
        db.add(profile)
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_name": user.company_name
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email.ilike(data.email)).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_name": user.company_name
        }
    }

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(data: DemoLoginRequest, db: Session = Depends(get_db)):
    role = data.role.lower()
    # Find matching demo user in db
    demo_email = {
        "job_seeker": "alex.mercer@jobmatch.ai",
        "recruiter": "sarah.recruiter@techpulse.ai",
        "admin": "admin@jobmatch.ai"
    }.get(role, "alex.mercer@jobmatch.ai")

    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        # Fallback to any user with this role
        user = db.query(User).filter(User.role == role).first()
        if not user:
            raise HTTPException(status_code=404, detail="Demo account not found")

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "company_name": user.company_name
        }
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile_data = None
    if current_user.candidate_profile:
        cp = current_user.candidate_profile
        profile_data = {
            "id": cp.id,
            "headline": cp.headline,
            "bio": cp.bio,
            "location": cp.location,
            "experience_years": cp.experience_years,
            "education": cp.education,
            "phone": cp.phone,
            "linkedin_url": cp.linkedin_url,
            "github_url": cp.github_url,
            "portfolio_url": cp.portfolio_url,
            "profile_score": cp.profile_score,
            "skills": [{"id": s.id, "name": s.name, "category": s.category} for s in cp.skills]
        }

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "company_name": current_user.company_name,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at,
        "candidate_profile": profile_data
    }

@router.put("/profile", response_model=CandidateProfileResponse)
def update_profile(data: CandidateProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.candidate_profile
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    if data.headline is not None: profile.headline = data.headline
    if data.bio is not None: profile.bio = data.bio
    if data.location is not None: profile.location = data.location
    if data.experience_years is not None: profile.experience_years = data.experience_years
    if data.education is not None: profile.education = data.education
    if data.phone is not None: profile.phone = data.phone
    if data.linkedin_url is not None: profile.linkedin_url = data.linkedin_url
    if data.github_url is not None: profile.github_url = data.github_url
    if data.portfolio_url is not None: profile.portfolio_url = data.portfolio_url

    if data.skills is not None:
        skill_objs = []
        for s_name in data.skills:
            clean_name = s_name.strip()
            if not clean_name: continue
            skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
            if not skill:
                skill = Skill(name=clean_name)
                db.add(skill)
                db.commit()
                db.refresh(skill)
            skill_objs.append(skill)
        profile.skills = skill_objs

    db.commit()
    db.refresh(profile)
    return profile
