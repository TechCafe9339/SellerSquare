from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    full_name: str
    phone: str = Field(pattern=r"^[6-9]\d{9}$")
    address: str
    city: str
    state: str
    pincode: str
    is_default: bool = True
