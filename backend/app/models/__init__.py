from app.database.session import Base
from app.models.user import User, UserRole
from app.models.profile import CandidateProfile
from app.models.skill import Skill, CandidateSkill, JobSkill
from app.models.resume import Resume
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.models.otp import OTPVerification

__all__ = [
    "Base",
    "User",
    "UserRole",
    "CandidateProfile",
    "Skill",
    "CandidateSkill",
    "JobSkill",
    "Resume",
    "Job",
    "Application",
    "ApplicationStatus",
    "OTPVerification",
]

