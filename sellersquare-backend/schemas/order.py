from pydantic import BaseModel


class CreateOrder(BaseModel):
    address: str


class OrderStatusUpdate(BaseModel):
    status: str
