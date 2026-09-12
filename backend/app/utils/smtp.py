import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)

def send_otp_email(to_email: str, otp_code: str, recipient_name: str = "User") -> bool:
    """
    Sends a real OTP verification code to the given recipient email address via SMTP.
    Requires SMTP credentials configured in settings / environment variables.
    """
    host = settings.SMTP_HOST
    port = settings.SMTP_PORT
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    from_email = settings.SMTP_FROM_EMAIL or "noreply@jobmatch.ai"

    if not host:
        logger.warning("SMTP_HOST is not configured. Unable to send real email.")
        raise ValueError("SMTP configuration missing on server. Please set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD in backend .env file.")

    # Build Email Message
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp_code} is your JobMatch AI Email Verification Code"
    msg["From"] = f"JobMatch AI <{from_email}>"
    msg["To"] = to_email

    text_body = f"""
Hello {recipient_name},

Thank you for creating an account with JobMatch AI!

Your 6-digit email verification code is: {otp_code}

This code will expire in 10 minutes. Please enter this code on the registration page to complete your account setup.

If you did not request this verification code, please ignore this email.

Best regards,
The JobMatch AI Team
"""

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 20px; color: #0b1220; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5eaf0; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }}
        .header {{ text-align: center; margin-bottom: 24px; }}
        .logo-badge {{ display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #0f766e; padding: 8px 16px; border-radius: 12px; font-weight: bold; font-size: 16px; }}
        .otp-box {{ background: #f0fdfa; border: 2px dashed #0f766e; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e; text-align: center; padding: 18px; margin: 24px 0; }}
        .footer {{ text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <div class="logo-badge">JobMatch AI</div>
        </div>
        <h2 style="color: #0b1220; margin-top: 0; text-align: center;">Verify Your Email Address</h2>
        <p>Hello <strong>{recipient_name}</strong>,</p>
        <p>Thank you for signing up for JobMatch AI. Enter the verification code below to complete your account setup:</p>
        
        <div class="otp-box">{otp_code}</div>
        
        <p style="font-size: 13px; color: #64748b;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        
        <div class="footer">
            <p>If you didn't request this account creation, you can safely ignore this email.</p>
            <p>&copy; 2026 JobMatch AI. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

    part1 = MIMEText(text_body, "plain")
    part2 = MIMEText(html_body, "html")
    msg.attach(part1)
    msg.attach(part2)

    try:
        if settings.SMTP_USE_TLS:
            with smtplib.SMTP(host, port, timeout=15) as server:
                server.ehlo()
                server.starttls()
                if username and password:
                    server.login(username, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP_SSL(host, port, timeout=15) as server:
                if username and password:
                    server.login(username, password)
                server.sendmail(from_email, [to_email], msg.as_string())
        return True
    except Exception as e:
        logger.error(f"Failed to send SMTP email to {to_email}: {str(e)}")
        raise RuntimeError(f"SMTP email delivery failed: {str(e)}")
