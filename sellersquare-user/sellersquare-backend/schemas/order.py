from pydantic import BaseModel


class CreateOrder(BaseModel):
    address_id: str
    payment_method: str


class OrderStatusUpdate(BaseModel):
    status: str