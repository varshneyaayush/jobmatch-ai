from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.user import SkillSchema, UserResponse

class JobCreate(BaseModel):
    title: str
    company: str
    company_logo: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: str
    location_type: str = "Hybrid"  # Remote, Hybrid, On-site
    job_type: str = "Full-time"    # Full-time, Part-time, Contract, Internship
    experience_level: str = "Mid-Level"
    experience_years_required: float = 2.0
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    salary_period: str = "year"
    salary_text: Optional[str] = None
    skills: List[str] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    company_logo: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    experience_years_required: Optional[float] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None
    salary_text: Optional[str] = None
    skills: Optional[List[str]] = None
    is_active: Optional[int] = None

class JobResponse(BaseModel):
    id: int
    recruiter_id: int
    title: str
    company: str
    company_logo: Optional[str] = None
    description: str
    requirements: Optional[str] = None
    responsibilities: Optional[str] = None
    location: str
    location_type: str
    job_type: str
    experience_level: str
    experience_years_required: float
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str
    salary_period: str
    salary_text: Optional[str] = None
    is_active: int
    featured: int
    created_at: datetime
    skills: List[SkillSchema] = []
    recruiter: Optional[UserResponse] = None
    # Dynamic fields computed for current candidate
    match_score: Optional[int] = None
    compatibility_level: Optional[str] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    items: List[JobResponse]
    total: int
