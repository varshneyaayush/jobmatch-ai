from app.schemas.auth import UserRegister, UserLogin, TokenResponse, DemoLoginRequest
from app.schemas.user import UserResponse, SkillSchema, CandidateProfileUpdate, CandidateProfileResponse
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobListResponse
from app.schemas.resume import ResumeResponse, ResumeAnalysisResponse
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse, MatchRequest, MatchResponse

__all__ = [
    "UserRegister",
    "UserLogin",
    "TokenResponse",
    "DemoLoginRequest",
    "UserResponse",
    "SkillSchema",
    "CandidateProfileUpdate",
    "CandidateProfileResponse",
    "JobCreate",
    "JobUpdate",
    "JobResponse",
    "JobListResponse",
    "ResumeResponse",
    "ResumeAnalysisResponse",
    "ApplicationCreate",
    "ApplicationStatusUpdate",
    "ApplicationResponse",
    "MatchRequest",
    "MatchResponse",
]
