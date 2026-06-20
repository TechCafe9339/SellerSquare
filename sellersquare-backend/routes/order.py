from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from utils.auth import get_current_seller
from database.database import order_collection
from schemas.order import OrderStatusUpdate

router = APIRouter(prefix="/seller/orders", tags=["Orders"])


@router.get("/")
def get_orders(seller_id: str = Depends(get_current_seller)):

    orders = order_collection.find({"seller_id": seller_id})

    result = []

    for order in orders:
        result.append(
            {
                "id": str(order["_id"]),
                "customer_name": order["customer_name"],
                "product_name": order["product_name"],
                "quantity": order["quantity"],
                "total": order["total"],
                "status": order["status"],
            }
        )

    return result


@router.get("/{order_id}")
def get_order(order_id: str, seller_id: str = Depends(get_current_seller)):

    order = order_collection.find_one(
        {"_id": ObjectId(order_id), "seller_id": seller_id}
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": str(order["_id"]),
        "customer_name": order["customer_name"],
        "product_name": order["product_name"],
        "quantity": order["quantity"],
        "price": order["price"],
        "total": order["total"],
        "status": order["status"],
    }


@router.put("/{order_id}")
def update_order_status(
    order_id: str, data: OrderStatusUpdate, seller_id: str = Depends(get_current_seller)
):

    order = order_collection.find_one(
        {"_id": ObjectId(order_id), "seller_id": seller_id}
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_status = ["pending", "processing", "shipped", "delivered", "cancelled"]

    if data.status not in valid_status:
        raise HTTPException(status_code=400, detail="Invalid status")

    order_collection.update_one(
        {"_id": ObjectId(order_id)}, {"$set": {"status": data.status}}
    )

    return {"message": "Order status updated"}
