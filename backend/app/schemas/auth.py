from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "job_seeker"  # "job_seeker", "recruiter", "admin"
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class DemoLoginRequest(BaseModel):
    role: str  # "job_seeker", "recruiter", "admin"

class SendOTPRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "job_seeker"
    company_name: Optional[str] = None
    phone: Optional[str] = None
    temp_resume_path: Optional[str] = None
    temp_resume_name: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

