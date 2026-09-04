from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.job import JobResponse
from app.schemas.user import CandidateProfileResponse

class ApplicationCreate(BaseModel):
    job_id: int
    cover_note: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    resume_id: Optional[int] = None
    match_score: float
    match_breakdown: Optional[Dict[str, Any]] = None
    cover_note: Optional[str] = None
    status: str
    notes: Optional[str] = None
    applied_at: datetime
    updated_at: datetime
    job: Optional[JobResponse] = None
    candidate: Optional[CandidateProfileResponse] = None

    class Config:
        from_attributes = True

class MatchRequest(BaseModel):
    job_id: int
    resume_id: Optional[int] = None

class MatchResponse(BaseModel):
    job_id: int
    match_percentage: int
    compatibility_level: str
    matched_skills: List[str]
    missing_skills: List[str]
    extra_skills: List[str]
    experience_match: str
    experience_note: str
    education_match: str
    education_note: str
    breakdown: Dict[str, int]
