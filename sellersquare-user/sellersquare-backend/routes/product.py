from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from schemas.product import ProductCreate, ProductUpdate
from datetime import datetime
from database.database import product_collection

from utils.auth import get_current_seller

router = APIRouter(prefix="/seller/products", tags=["Products"])


@router.post("/")
def create_product(
    product: ProductCreate, seller_id: str = Depends(get_current_seller)
):

    data = product.dict()

    data["seller_id"] = seller_id

    data["created_at"] = datetime.utcnow()
    data["updated_at"] = datetime.utcnow()
    data["status"] = product.status
    product_collection.insert_one(data)

    return {"message": "Product Created"}


@router.get("/")
def get_seller_products(seller_id: str = Depends(get_current_seller)):

    products = product_collection.find({"seller_id": seller_id})

    result = []

    for product in products:

        result.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "stock": product["stock"],
                "category": product["category"],
                "brand": product.get("brand", ""),
                "image_url": product.get("image_url", ""),
                "status": product.get("status", "active"),
            }
        )

    return result


@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
    seller_id: str = Depends(get_current_seller),
):

    existing = product_collection.find_one(
        {"_id": ObjectId(product_id), "seller_id": seller_id}
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.dict()

    update_data["updated_at"] = datetime.utcnow()

    product_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_data},
    )

    return {"message": "Product updated successfully"}


@router.delete("/{product_id}")
def delete_product(product_id: str, seller_id: str = Depends(get_current_seller)):

    existing = product_collection.find_one(
        {"_id": ObjectId(product_id), "seller_id": seller_id}
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    product_collection.delete_one({"_id": ObjectId(product_id)})

    return {"message": "Product deleted successfully"}


@router.get("/{product_id}")
def get_product(
    product_id: str,
    seller_id: str = Depends(get_current_seller),
):

    product = product_collection.find_one(
        {
            "_id": ObjectId(product_id),
            "seller_id": seller_id,
        }
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "description": product["description"],
        "price": product["price"],
        "stock": product["stock"],
        "category": product["category"],
        "brand": product.get("brand", ""),
        "image_url": product.get("image_url", ""),
    }


@router.put("/{product_id}/status")
def toggle_status(product_id: str, seller_id: str = Depends(get_current_seller)):

    product = product_collection.find_one(
        {"_id": ObjectId(product_id), "seller_id": seller_id}
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_status = "inactive" if product.get("status") == "active" else "active"

    product_collection.update_one(
        {"_id": ObjectId(product_id)}, {"$set": {"status": new_status}}
    )

    return {"message": "Status updated", "status": new_status}
