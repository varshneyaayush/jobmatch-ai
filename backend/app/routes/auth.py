import os
import json
import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.skill import Skill
from app.models.resume import Resume
from app.models.otp import OTPVerification
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    DemoLoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
)
from app.schemas.user import CandidateProfileUpdate, CandidateProfileResponse
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.smtp import send_otp_email
from app.nlp.resume_parser import ResumeParser
from app.nlp.scoring import calculate_resume_score
from app.routes.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-otp")
def send_otp(data: SendOTPRequest, db: Session = Depends(get_db)):
    """
    Step 1 & 3 of onboarding: Validates registration payload, checks duplicate emails,
    generates 6-digit OTP code, saves temporary pending state, and sends REAL SMTP email.
    """
    clean_email = data.email.strip().lower()

    # 1. Check if email already registered
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    # 2. Validate role
    role = data.role.lower()
    if role not in [UserRole.JOB_SEEKER.value, UserRole.RECRUITER.value, UserRole.ADMIN.value]:
        role = UserRole.JOB_SEEKER.value

    # 3. Generate 6-digit secure OTP code
    otp_code = str(secrets.randbelow(900000) + 100000)
    now = datetime.datetime.utcnow()
    expires_at = now + datetime.timedelta(minutes=10)
    resend_cooldown = now + datetime.timedelta(seconds=60)

    # 4. Construct pending registration data
    pending_payload = {
        "name": data.name.strip(),
        "email": clean_email,
        "password_hash": get_password_hash(data.password),
        "role": role,
        "company_name": data.company_name.strip() if data.company_name else None,
        "phone": data.phone.strip() if data.phone else None,
    }

    # 5. Check existing OTP record or create new
    otp_rec = db.query(OTPVerification).filter(OTPVerification.email == clean_email).first()
    if otp_rec:
        # Check cooldown
        if otp_rec.resend_cooldown_until and now < otp_rec.resend_cooldown_until:
            remaining = int((otp_rec.resend_cooldown_until - now).total_seconds())
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting another verification code."
            )
        otp_rec.otp_code = otp_code
        otp_rec.expires_at = expires_at
        otp_rec.attempts = 0
        otp_rec.resend_cooldown_until = resend_cooldown
        otp_rec.is_verified = False
        otp_rec.pending_data_json = json.dumps(pending_payload)
        if data.temp_resume_path:
            otp_rec.temp_resume_path = data.temp_resume_path
            otp_rec.temp_resume_name = data.temp_resume_name or "uploaded_resume.pdf"
    else:
        otp_rec = OTPVerification(
            email=clean_email,
            otp_code=otp_code,
            expires_at=expires_at,
            attempts=0,
            resend_cooldown_until=resend_cooldown,
            is_verified=False,
            pending_data_json=json.dumps(pending_payload),
            temp_resume_path=data.temp_resume_path,
            temp_resume_name=data.temp_resume_name or "uploaded_resume.pdf" if data.temp_resume_path else None
        )
        db.add(otp_rec)

    db.commit()

    # 6. Send Email via REAL SMTP
    try:
        send_otp_email(clean_email, otp_code, data.name.strip())
    except ValueError as ve:
        # Missing server configuration
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deliver OTP email via SMTP: {str(e)}"
        )

    return {
        "success": True,
        "message": f"Verification code sent to {clean_email}.",
        "cooldown_seconds": 60
    }


@router.post("/resend-otp")
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    """
    Resends OTP code with a 60-second cooldown enforcement.
    """
    clean_email = data.email.strip().lower()
    now = datetime.datetime.utcnow()

    otp_rec = db.query(OTPVerification).filter(OTPVerification.email == clean_email).first()
    if not otp_rec or not otp_rec.pending_data_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending registration found for this email address."
        )

    if otp_rec.resend_cooldown_until and now < otp_rec.resend_cooldown_until:
        remaining = int((otp_rec.resend_cooldown_until - now).total_seconds())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting a new OTP."
        )

    new_code = str(secrets.randbelow(900000) + 100000)
    otp_rec.otp_code = new_code
    otp_rec.expires_at = now + datetime.timedelta(minutes=10)
    otp_rec.attempts = 0
    otp_rec.resend_cooldown_until = now + datetime.timedelta(seconds=60)
    db.commit()

    pending_data = json.loads(otp_rec.pending_data_json)
    recipient_name = pending_data.get("name", "User")

    try:
        send_otp_email(clean_email, new_code, recipient_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deliver OTP email via SMTP: {str(e)}"
        )

    return {
        "success": True,
        "message": f"A new verification code has been sent to {clean_email}.",
        "cooldown_seconds": 60
    }


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Final step of account creation: Verifies 6-digit OTP code, creates permanent User,
    CandidateProfile, processes & links Resume, and returns JWT session token.
    """
    clean_email = data.email.strip().lower()
    submitted_code = data.otp_code.strip()
    now = datetime.datetime.utcnow()

    otp_rec = db.query(OTPVerification).filter(OTPVerification.email == clean_email).first()
    if not otp_rec or not otp_rec.pending_data_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending registration found for this email address. Please start registration again."
        )

    if otp_rec.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email has already been verified. Please log in with your email and password."
        )

    if now > otp_rec.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please click 'Resend OTP' to get a new code."
        )

    if otp_rec.attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Please click 'Resend OTP' for a new code."
        )

    if submitted_code != otp_rec.otp_code:
        otp_rec.attempts += 1
        db.commit()
        remaining = 5 - otp_rec.attempts
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining."
        )

    # OTP matches! Mark as verified
    otp_rec.is_verified = True
    db.commit()

    # Retrieve pending user registration details
    pending = json.loads(otp_rec.pending_data_json)

    # Double-check duplicate email
    existing_user = db.query(User).filter(User.email.ilike(clean_email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

    # 1. Create Permanent User
    user = User(
        name=pending["name"],
        email=clean_email,
        password_hash=pending["password_hash"],
        role=pending["role"],
        company_name=pending.get("company_name")
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Create Candidate Profile if job seeker
    if user.role == UserRole.JOB_SEEKER.value:
        profile = CandidateProfile(
            user_id=user.id,
            headline="Aspiring Tech Professional",
            bio="Seeking exciting opportunities to make an impact.",
            experience_years=1.0,
            education="Bachelor's Degree",
            phone=pending.get("phone"),
            profile_score=40
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # 3. Process & attach staged resume if uploaded during registration
        temp_resume_path = otp_rec.temp_resume_path
        temp_resume_name = otp_rec.temp_resume_name or "Resume.pdf"
        if temp_resume_path and os.path.exists(temp_resume_path):
            try:
                parsed = ResumeParser.parse_full_resume(temp_resume_path)
                scoring_result = calculate_resume_score(parsed)
                overall_score = scoring_result["overall_score"]
                parsed_payload = {**parsed, "scoring": scoring_result}

                file_ext = os.path.splitext(temp_resume_name)[1].replace(".", "").lower() or "pdf"

                resume = Resume(
                    user_id=user.id,
                    file_name=temp_resume_name,
                    file_path=temp_resume_path,
                    file_type=file_ext,
                    extracted_text=parsed.get("raw_text", ""),
                    resume_score=overall_score,
                    parsed_data_json=json.dumps(parsed_payload),
                    is_primary=1
                )
                db.add(resume)

                # Update candidate profile fields with parsed metadata
                profile.profile_score = overall_score
                if parsed.get("experience_years"):
                    profile.experience_years = parsed["experience_years"]
                if parsed.get("education"):
                    profile.education = parsed["education"]
                if parsed.get("phone") and not profile.phone:
                    profile.phone = parsed["phone"]

                # Link extracted skills to candidate profile
                skill_objects = []
                for s_name in parsed.get("skills", []):
                    skill = db.query(Skill).filter(Skill.name.ilike(s_name)).first()
                    if not skill:
                        skill = Skill(name=s_name)
                        db.add(skill)
                        db.commit()
                        db.refresh(skill)
                    skill_objects.append(skill)
                profile.skills = skill_objects
                db.commit()
            except Exception as e:
                print(f"Warning: Failed to process temp resume on account activation: {e}")

    # Generate JWT Token
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


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Direct registration endpoint for backward compatibility.
    """
    existing = db.query(User).filter(User.email.ilike(data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please log in."
        )

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
    """
    RETURNING USER LOGIN: Email + Password authentication.
    Does NOT require OTP. Loads user profile & session JWT.
    """
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
    demo_email = {
        "job_seeker": "alex.mercer@jobmatch.ai",
        "recruiter": "sarah.recruiter@techpulse.ai",
        "admin": "admin@jobmatch.ai"
    }.get(role, "alex.mercer@jobmatch.ai")

    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
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
