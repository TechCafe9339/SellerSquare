from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database.database import product_collection

router = APIRouter(
    prefix="/products",
    tags=["Public Products"]
)


@router.get("/")
def get_all_products():

    products = product_collection.find(
        {
            "status": "active"
        }
    )

    result = []

    for product in products:

        result.append(
            {
                "id": str(product["_id"]),
                "name": product.get("name", ""),
                "description": product.get("description", ""),
                "price": product.get("price", 0),
                "mrp": product.get("mrp", product.get("price", 0)),
                "brand": product.get("brand", ""),
                "rating": product.get("rating", 4.5),
                "reviews": product.get("reviews", 0),
                "stock": product.get("stock", 0),
                "category": product.get("category", ""),
                "image_url": product.get("image_url", ""),
            }
        )

    return result


@router.get("/{product_id}")
def get_single_product(product_id: str):

    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid Product ID"
        )

    product = product_collection.find_one(
        {
            "_id": ObjectId(product_id),
            "status": "active",
        }
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return {
        "id": str(product["_id"]),
        "name": product.get("name", ""),
        "description": product.get("description", ""),
        "price": product.get("price", 0),
        "mrp": product.get("mrp", product.get("price", 0)),
        "brand": product.get("brand", ""),
        "rating": product.get("rating", 4.5),
        "reviews": product.get("reviews", 0),
        "stock": product.get("stock", 0),
        "category": product.get("category", ""),
        "image_url": product.get("image_url", ""),
    }