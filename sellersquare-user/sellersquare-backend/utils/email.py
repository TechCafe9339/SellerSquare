import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_reset_email(email: str, reset_link: str):

    msg = EmailMessage()

    msg["Subject"] = "SellerSquare Password Reset"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = email

    msg.set_content(
        f"""
Hello,

Click the link below to reset your password:

{reset_link}

This link will expire in 1 hour.

SellerSquare Team
"""
    )

    with smtplib.SMTP(
        os.getenv("MAIL_SERVER", ''),
        int(os.getenv("MAIL_PORT", '587'))
    ) as server:

        server.starttls()

        server.login(
            os.getenv("MAIL_USERNAME", ''),
            os.getenv("MAIL_PASSWORD", '')
        )

        server.send_message(msg)


def send_otp_email(email: str, otp: str):

    msg = EmailMessage()

    msg["Subject"] = "SellerSquare OTP Verification"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = email

    msg.set_content(
        f"""
Hello,

Your OTP is:

{otp}

This OTP will expire in 5 minutes.

SellerSquare Team
"""
    )

    with smtplib.SMTP(
        os.getenv("MAIL_SERVER", ""),
        int(os.getenv("MAIL_PORT", "587"))
    ) as server:

        server.starttls()

        server.login(
            os.getenv("MAIL_USERNAME", ""),
            os.getenv("MAIL_PASSWORD", "")
        )

        server.send_message(msg)