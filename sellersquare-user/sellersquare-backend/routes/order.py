from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId

from database.database import (
    cart_collection,
    order_collection,
    product_collection,
    wishlist_collection,
    address_collection,
)

from utils.customer_auth import get_current_customer

from schemas.order import CreateOrder

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/checkout")
def checkout(data: CreateOrder, customer_id: str = Depends(get_current_customer)):

    address = address_collection.find_one(
        {
            "_id": ObjectId(data.address_id),
            "customer_id": customer_id,
        }
    )

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    cart_items = list(cart_collection.find({"customer_id": customer_id}))

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_amount = 0
    items = []

    for item in cart_items:

        product = product_collection.find_one({"_id": ObjectId(item["product_id"])})

        if not product:
            continue

        subtotal = product["price"] * item["quantity"]

        total_amount += subtotal

        items.append(
            {
                "product_id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "quantity": item["quantity"],
                "seller_id": product["seller_id"],
            }
        )

    order = {
        "customer_id": customer_id,
        "items": items,
        "address": {
            "full_name": address["full_name"],
            "phone": address["phone"],
            "address": address["address"],
            "city": address["city"],
            "state": address["state"],
            "pincode": address["pincode"],
        },
        "payment_method": data.payment_method,
        "total_amount": total_amount,
        "status": "Pending",
        "created_at": datetime.utcnow(),
    }

    result = order_collection.insert_one(order)

    cart_collection.delete_many({"customer_id": customer_id})

    return {
        "message": "Order placed successfully",
        "order_id": str(result.inserted_id),
    }


@router.get("/my-orders")
def my_orders(customer_id: str = Depends(get_current_customer)):

    orders = order_collection.find({"customer_id": customer_id})

    result = []

    for order in orders:

        result.append(
            {
                "id": str(order["_id"]),
                "total_amount": order["total_amount"],
                "status": order["status"],
                "created_at": order.get("created_at"),
                "items": order["items"],
            }
        )

    return result


@router.get("/my-orders/{order_id}")
def order_details(order_id: str, customer_id: str = Depends(get_current_customer)):

    order = order_collection.find_one(
        {"_id": ObjectId(order_id), "customer_id": customer_id}
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order["_id"]),
        "items": order["items"],
        "total_amount": order["total_amount"],
        "status": order["status"],
        "address": order["address"],
        "payment_method": order.get("payment_method", "COD"),
        "created_at": order.get("created_at"),
    }


@router.get("/stats")
def customer_stats(customer_id: str = Depends(get_current_customer)):

    total_orders = order_collection.count_documents({"customer_id": customer_id})

    total_cart = cart_collection.count_documents({"customer_id": customer_id})

    total_wishlist = wishlist_collection.count_documents({"customer_id": customer_id})

    return {
        "total_orders": total_orders,
        "cart_items": total_cart,
        "wishlist_items": total_wishlist,
    }
