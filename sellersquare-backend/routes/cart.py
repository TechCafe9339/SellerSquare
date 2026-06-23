from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database.database import cart_collection, product_collection

from schemas.cart import AddToCart, UpdateQuantity

from utils.customer_auth import get_current_customer

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.post("/add")
def add_to_cart(data: AddToCart, customer_id: str = Depends(get_current_customer)):

    product = product_collection.find_one({"_id": ObjectId(data.product_id)})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = cart_collection.find_one(
        {"customer_id": customer_id, "product_id": data.product_id}
    )

    if existing:

        cart_collection.update_one(
            {"_id": existing["_id"]}, {"$inc": {"quantity": data.quantity}}
        )

    else:

        cart_collection.insert_one(
            {
                "customer_id": customer_id,
                "product_id": data.product_id,
                "quantity": data.quantity,
            }
        )

    return {"message": "Added to cart"}


@router.get("/")
def get_cart(customer_id: str = Depends(get_current_customer)):

    items = cart_collection.find({"customer_id": customer_id})

    result = []

    for item in items:

        product = product_collection.find_one({"_id": ObjectId(item["product_id"])})

        if product:

            result.append(
                {
                    "cart_id": str(item["_id"]),
                    "product_id": str(product["_id"]),
                    "name": product["name"],
                    "price": product["price"],
                    "quantity": item["quantity"],
                    "image": product.get("image_url", ""),
                }
            )

    return result


@router.delete("/remove/{cart_id}")
def remove_cart_item(cart_id: str, customer_id: str = Depends(get_current_customer)):

    cart_collection.delete_one({"_id": ObjectId(cart_id), "customer_id": customer_id})

    return {"message": "Removed from cart"}


@router.get("/count")
def get_cart_count(customer_id: str = Depends(get_current_customer)):

    count = cart_collection.count_documents({"customer_id": customer_id})

    return {"count": count}


@router.put("/update/{cart_id}")
def update_quantity(
    cart_id: str,
    data: UpdateQuantity,
    customer_id: str = Depends(get_current_customer),
):

    quantity = data.quantity

    if quantity < 1:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be at least 1",
        )

    result = cart_collection.update_one(
        {
            "_id": ObjectId(cart_id),
            "customer_id": customer_id,
        },
        {"$set": {"quantity": quantity}},
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found",
        )

    return {"message": "Quantity updated"}
