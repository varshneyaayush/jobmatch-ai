import datetime
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum

class UserRole(str, enum.Enum):
    JOB_SEEKER = "job_seeker"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=UserRole.JOB_SEEKER.value, nullable=False)
    company_name = Column(String, nullable=True)
    company_logo = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    posted_jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan")
