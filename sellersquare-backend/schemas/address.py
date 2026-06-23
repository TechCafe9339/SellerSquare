from pydantic import BaseModel


class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str