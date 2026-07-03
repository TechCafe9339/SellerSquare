from pydantic import BaseModel


class AddToCart(BaseModel):
    product_id: str
    quantity: int


class UpdateQuantity(BaseModel):
    quantity: int
