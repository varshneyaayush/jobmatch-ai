from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SkillSchema(BaseModel):
    id: int
    name: str
    category: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateProfileUpdate(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_years: Optional[float] = None
    education: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    skills: Optional[List[str]] = None

class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    experience_years: float = 0.0
    education: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_score: int = 0
    skills: List[SkillSchema] = []
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
