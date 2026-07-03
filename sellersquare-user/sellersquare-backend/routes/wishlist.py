from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database.database import wishlist_collection, product_collection

from schemas.wishlist import AddToWishlist

from utils.customer_auth import get_current_customer

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.post("/add")
def add_to_wishlist(
    data: AddToWishlist, customer_id: str = Depends(get_current_customer)
):
    print("CUSTOMER:", customer_id)
    print("PRODUCT:", data.product_id)
    existing = wishlist_collection.find_one(
        {"customer_id": customer_id, "product_id": data.product_id}
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already in wishlist")

    wishlist_collection.insert_one(
        {"customer_id": customer_id, "product_id": data.product_id}
    )

    return {"message": "Added to wishlist"}


@router.get("/")
def get_wishlist(customer_id: str = Depends(get_current_customer)):

    items = wishlist_collection.find({"customer_id": customer_id})

    result = []

    for item in items:

        print("WISHLIST ITEM:", item)

        product = product_collection.find_one({"_id": ObjectId(item["product_id"])})

        print("PRODUCT FOUND:", product)

        if product:

            result.append(
                {
                    "wishlist_id": str(item["_id"]),
                    "product_id": str(product["_id"]),
                    "name": product["name"],
                    "price": product["price"],
                    "image": product.get("image_url", ""),
                }
            )

    print("RESULT:", result)

    return result


@router.delete("/remove/{wishlist_id}")
def remove_wishlist(wishlist_id: str, customer_id: str = Depends(get_current_customer)):

    wishlist_collection.delete_one(
        {"_id": ObjectId(wishlist_id), "customer_id": customer_id}
    )

    return {"message": "Removed from wishlist"}
