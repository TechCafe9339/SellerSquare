from fastapi import APIRouter, Depends, HTTPException

from bson import ObjectId

from database.database import (
    cart_collection,
    order_collection,
    product_collection,
    wishlist_collection,
)

from utils.customer_auth import get_current_customer

from schemas.order import CreateOrder

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/checkout")
def checkout(data: CreateOrder, customer_id: str = Depends(get_current_customer)):

    cart_items = list(cart_collection.find({"customer_id": customer_id}))

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0
    items = []

    for item in cart_items:

        product = product_collection.find_one({"_id": ObjectId(item["product_id"])})

        if not product:
            continue

        subtotal = product["price"] * item["quantity"]

        total += subtotal

        items.append(
            {
                "product_id": item["product_id"],
                "seller_id": product["seller_id"],
                "name": product["name"],
                "price": product["price"],
                "quantity": item["quantity"],
            }
        )

    order = {
        "customer_id": customer_id,
        "items": items,
        "address": data.address,
        "total_amount": total,
        "status": "Pending",
    }

    result = order_collection.insert_one(order)

    cart_collection.delete_many({"customer_id": customer_id})

    return {"message": "Order placed", "order_id": str(result.inserted_id)}


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
                "address": order["address"],
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
        "product_name": order["product_name"],
        "quantity": order["quantity"],
        "price": order["price"],
        "total": order["total"],
        "status": order["status"],
        "address": order["address"],
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
