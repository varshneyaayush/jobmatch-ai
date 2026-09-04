from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.database.session import Base

class ApplicationStatus(str):
    APPLIED = "Applied"
    UNDER_REVIEW = "Under Review"
    SHORTLISTED = "Shortlisted"
    INTERVIEW = "Interview"
    SELECTED = "Selected"
    REJECTED = "Rejected"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    match_score = Column(Float, default=0.0)
    match_breakdown_json = Column(Text, nullable=True)  # JSON string: matched_skills, missing_skills, category_scores
    cover_note = Column(Text, nullable=True)
    status = Column(String, default=ApplicationStatus.APPLIED, nullable=False)
    notes = Column(Text, nullable=True)  # Recruiter internal notes
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("CandidateProfile", back_populates="applications")
    resume = relationship("Resume")
