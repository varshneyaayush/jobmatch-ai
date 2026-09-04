from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.database.session import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False, index=True)
    company_logo = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    location = Column(String, nullable=False, index=True)
    location_type = Column(String, default="Hybrid")  # Remote, Hybrid, On-site
    job_type = Column(String, default="Full-time")  # Full-time, Part-time, Contract, Internship
    experience_level = Column(String, default="Mid-Level")  # Entry, Mid-Level, Senior, Lead
    experience_years_required = Column(Float, default=2.0)
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    salary_currency = Column(String, default="USD")
    salary_period = Column(String, default="year")  # year, month, hour
    salary_text = Column(String, nullable=True)  # e.g., "$120,000 - $150,000/yr" or "₹12–18 LPA"
    is_active = Column(Integer, default=1)
    featured = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    recruiter = relationship("User", back_populates="posted_jobs")
    skills = relationship("Skill", secondary="job_skills", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
