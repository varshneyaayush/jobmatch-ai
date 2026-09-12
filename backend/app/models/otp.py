import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from app.database.session import Base

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    resend_cooldown_until = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=False)
    pending_data_json = Column(Text, nullable=True)
    temp_resume_path = Column(String, nullable=True)
    temp_resume_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
