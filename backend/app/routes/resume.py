import os
import json
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database.session import get_db
from app.config import settings
from app.models.user import User
from app.models.profile import CandidateProfile
from app.models.resume import Resume
from app.models.skill import Skill
from app.nlp.resume_parser import ResumeParser
from app.nlp.scoring import calculate_resume_score
from app.routes.deps import get_current_user, get_optional_current_user
from app.utils.sample_resumes import SAMPLE_AI_ENGINEER_RESUME, SAMPLE_FULLSTACK_RESUME

router = APIRouter(prefix="/resume", tags=["Resume Processing"])


@router.post("/upload-temp")
async def upload_temp_resume(
    file: UploadFile = File(...)
):
    """
    Temporary resume upload for new user registration onboarding.
    Saves file to disk and returns parsed summary preview + temporary file reference.
    """
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Please upload a PDF or DOCX file."
        )

    unique_filename = f"temp_{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        await buffer.write(content)

    parsed = ResumeParser.parse_full_resume(file_path)
    if not parsed["raw_text"]:
        raise HTTPException(status_code=422, detail="Unable to extract text from resume. Please ensure it is not scanned/password-protected.")

    scoring_result = calculate_resume_score(parsed)
    overall_score = scoring_result["overall_score"]

    return {
        "success": True,
        "temp_resume_path": file_path,
        "file_name": file.filename,
        "score": overall_score,
        "extracted_name": parsed.get("name"),
        "extracted_email": parsed.get("email"),
        "extracted_phone": parsed.get("phone"),
        "education": parsed.get("education"),
        "experience_years": parsed.get("experience_years"),
        "skills": parsed.get("skills", []),
        "skills_by_category": parsed.get("skills_by_category", {}),
        "summary": parsed.get("summary"),
        "strengths": scoring_result.get("strengths", []),
        "improvements": scoring_result.get("improvements", []),
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported format. Please upload a PDF or DOCX file."
        )

    # Save to disk
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    async with aiofiles.open(file_path, "wb") as buffer:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        await buffer.write(content)

    # Run NLP Parser
    parsed = ResumeParser.parse_full_resume(file_path)
    if not parsed["raw_text"]:
        raise HTTPException(status_code=422, detail="Unable to extract text from resume. Please ensure it is not scanned/password-protected.")

    # Calculate Resume Score & Insights
    scoring_result = calculate_resume_score(parsed)
    overall_score = scoring_result["overall_score"]

    parsed_payload = {
        **parsed,
        "scoring": scoring_result
    }

    # If user is logged in, attach to user profile
    resume_id = 0
    if current_user:
        # Mark other resumes non-primary
        db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": 0})

        resume = Resume(
            user_id=current_user.id,
            file_name=file.filename,
            file_path=file_path,
            file_type=file_ext.replace(".", ""),
            extracted_text=parsed["raw_text"],
            resume_score=overall_score,
            parsed_data_json=json.dumps(parsed_payload),
            is_primary=1
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        resume_id = resume.id

        # Update candidate profile with detected skills & info
        profile = current_user.candidate_profile
        if not profile:
            profile = CandidateProfile(user_id=current_user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        profile.profile_score = overall_score
        if parsed.get("experience_years"):
            profile.experience_years = parsed["experience_years"]
        if parsed.get("education") and profile.education == "Bachelor's Degree":
            profile.education = parsed["education"]
        if parsed.get("phone") and not profile.phone:
            profile.phone = parsed["phone"]

        # Link skills
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

    return {
        "success": True,
        "resume_id": resume_id,
        "file_name": file.filename,
        "score": overall_score,
        "extracted_name": parsed.get("name"),
        "extracted_email": parsed.get("email"),
        "extracted_phone": parsed.get("phone"),
        "education": parsed.get("education"),
        "experience_years": parsed.get("experience_years"),
        "skills": parsed.get("skills", []),
        "skills_by_category": parsed.get("skills_by_category", {}),
        "summary": parsed.get("summary"),
        "strengths": scoring_result.get("strengths", []),
        "improvements": scoring_result.get("improvements", []),
        "recommended_skills": scoring_result.get("recommended_skills", []),
        "breakdown": scoring_result.get("breakdown", {})
    }

@router.post("/load-sample")
def load_sample_resume(
    sample_type: str = Form("ai_engineer"),  # "ai_engineer" or "fullstack"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    raw_text = SAMPLE_AI_ENGINEER_RESUME if sample_type == "ai_engineer" else SAMPLE_FULLSTACK_RESUME
    filename = "Alex_Mercer_AI_Engineer.pdf" if sample_type == "ai_engineer" else "Sophia_Chen_FullStack.pdf"
    
    # Save text file
    file_path = os.path.join(settings.UPLOAD_DIR, f"sample_{uuid.uuid4().hex}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(raw_text)

    parsed = ResumeParser.parse_full_resume(file_path)
    scoring_result = calculate_resume_score(parsed)
    overall_score = scoring_result["overall_score"]

    parsed_payload = {**parsed, "scoring": scoring_result}

    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": 0})

    resume = Resume(
        user_id=current_user.id,
        file_name=filename,
        file_path=file_path,
        file_type="pdf",
        extracted_text=raw_text,
        resume_score=overall_score,
        parsed_data_json=json.dumps(parsed_payload),
        is_primary=1
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Update candidate profile
    profile = current_user.candidate_profile
    if not profile:
        profile = CandidateProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    profile.profile_score = overall_score
    profile.experience_years = parsed["experience_years"]
    profile.education = parsed["education"]
    profile.phone = parsed["phone"]
    profile.headline = "Senior AI & Machine Learning Engineer" if sample_type == "ai_engineer" else "Full Stack Software Engineer"

    # Link skills
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

    return {
        "success": True,
        "resume_id": resume.id,
        "file_name": filename,
        "score": overall_score,
        "skills": parsed.get("skills", []),
        "skills_by_category": parsed.get("skills_by_category", {}),
        "experience_years": parsed.get("experience_years"),
        "education": parsed.get("education"),
        "summary": parsed.get("summary"),
        "strengths": scoring_result["strengths"],
        "improvements": scoring_result["improvements"],
        "recommended_skills": scoring_result["recommended_skills"],
        "breakdown": scoring_result["breakdown"]
    }

@router.get("/analysis")
def get_resume_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    primary_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_primary == 1
    ).first()

    if not primary_resume:
        # Check if candidate has any resume
        primary_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()

    if not primary_resume:
        raise HTTPException(status_code=404, detail="No resume uploaded yet. Please upload a resume to see analysis.")

    parsed_data = {}
    if primary_resume.parsed_data_json:
        try:
            parsed_data = json.loads(primary_resume.parsed_data_json)
        except Exception:
            pass

    scoring = parsed_data.get("scoring", {})
    if not scoring:
        scoring = calculate_resume_score(parsed_data)

    return {
        "resume_id": primary_resume.id,
        "file_name": primary_resume.file_name,
        "resume_score": primary_resume.resume_score,
        "name": parsed_data.get("name", current_user.name),
        "email": parsed_data.get("email", current_user.email),
        "phone": parsed_data.get("phone"),
        "education": parsed_data.get("education", "Bachelor's Degree"),
        "experience_years": parsed_data.get("experience_years", 2.0),
        "skills": parsed_data.get("skills", [s.name for s in current_user.candidate_profile.skills] if current_user.candidate_profile else []),
        "skills_by_category": parsed_data.get("skills_by_category", {}),
        "summary": parsed_data.get("summary", ""),
        "breakdown": scoring.get("breakdown", {"skills_score": 25, "experience_score": 20, "education_score": 12, "contact_score": 15, "content_score": 10}),
        "strengths": scoring.get("strengths", ["Solid technical foundation"]),
        "improvements": scoring.get("improvements", ["Add more quantified metrics to experience"]),
        "recommended_skills": scoring.get("recommended_skills", ["Docker", "AWS", "FastAPI"])
    }
