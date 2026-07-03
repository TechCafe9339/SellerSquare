import os
import smtplib
from email.message import EmailMessage


def send_otp_email(email: str, otp: str):

    msg = EmailMessage()

    msg["Subject"] = "SellerSquare Email Verification"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = email

    msg.set_content(f"""
Your SellerSquare verification code is:

{otp}

This code expires in 10 minutes.
""")

    with smtplib.SMTP(
        os.getenv("MAIL_SERVER", ""), int(os.getenv("MAIL_PORT", ""))
    ) as server:

        server.starttls()

        server.login(os.getenv("MAIL_USERNAME", ""), os.getenv("MAIL_PASSWORD", ""))

        server.send_message(msg)
