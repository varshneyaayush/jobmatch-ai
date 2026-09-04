from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.database.session import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, docx
    extracted_text = Column(Text, nullable=False)
    resume_score = Column(Integer, default=70)
    parsed_data_json = Column(Text, nullable=True)  # JSON string of all structured extracted fields
    is_primary = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
