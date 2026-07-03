from pydantic import BaseModel, EmailStr


class SellerRegister(BaseModel):
    business_name: str
    owner_name: str
    email: EmailStr
    phone: str
    gst_number: str
    password: str
    # store_logo: str
    # store_address: str
    # store_description: str


class SellerLogin(BaseModel):
    email: EmailStr
    password: str
