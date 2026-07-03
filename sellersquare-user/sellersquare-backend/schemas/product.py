from pydantic import BaseModel

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    image_url: str
    brand: str
    is_active: bool = True
    status: str = "active"

class ProductUpdate(BaseModel):
    name: str
    description: str
    price: float
    stock: int
    category: str
    brand: str
    image_url: str
