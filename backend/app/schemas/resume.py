from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    file_type: str
    resume_score: int
    created_at: datetime
    parsed_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ResumeAnalysisResponse(BaseModel):
    resume_id: int
    file_name: str
    resume_score: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    education: str
    experience_years: float
    skills: List[str]
    skills_by_category: Dict[str, List[str]]
    summary: str
    breakdown: Dict[str, int]
    strengths: List[str]
    improvements: List[str]
    recommended_skills: List[str]
