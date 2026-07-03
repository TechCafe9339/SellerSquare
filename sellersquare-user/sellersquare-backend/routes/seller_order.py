from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from utils.auth import get_current_seller
from database.database import order_collection
from schemas.order import OrderStatusUpdate

router = APIRouter(prefix="/seller/orders", tags=["Seller Orders"])


@router.get("/")
def seller_orders(seller_id: str = Depends(get_current_seller)):

    orders = order_collection.find()

    result = []

    for order in orders:

        seller_items = []

        for item in order["items"]:

            if item["seller_id"] == seller_id:
                seller_items.append(item)

        if seller_items:

            result.append(
                {
                    "order_id": str(order["_id"]),
                    "customer_id": order["customer_id"],
                    "status": order["status"],
                    "items": seller_items,
                    "total_amount": order["total_amount"],
                    "address": order["address"],
                }
            )

    return result


# @router.get("/{order_id}")
# def get_order(order_id: str, seller_id: str = Depends(get_current_seller)):

#     order = order_collection.find_one(
#         {"_id": ObjectId(order_id), "seller_id": seller_id}
#     )

#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")

#     return {
#         "id": str(order["_id"]),
#         "customer_name": order["customer_name"],
#         "product_name": order["product_name"],
#         "quantity": order["quantity"],
#         "price": order["price"],
#         "total": order["total"],
#         "status": order["status"],
#     }


@router.put("/{order_id}/status")
def update_order_status(
    order_id: str, data: OrderStatusUpdate, seller_id: str = Depends(get_current_seller)
):

    order = order_collection.find_one({"_id": ObjectId(order_id)})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    seller_has_item = any(item["seller_id"] == seller_id for item in order["items"])

    if not seller_has_item:
        raise HTTPException(status_code=403, detail="Unauthorized")

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    result = order_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": data.status}}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Status not updated"
        )

    return {"message": "Status updated"}
