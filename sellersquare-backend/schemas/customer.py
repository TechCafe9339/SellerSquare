from pydantic import BaseModel, EmailStr


class CustomerRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str