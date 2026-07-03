from fastapi import APIRouter, Depends

from utils.auth import get_current_seller
from database.database import product_collection, order_collection

router = APIRouter(prefix="/seller/dashboard", tags=["Dashboard"])


@router.get("/")
def seller_dashboard(seller_id: str = Depends(get_current_seller)):

    total_products = product_collection.count_documents({"seller_id": seller_id})
    total_orders = order_collection.count_documents({"seller_id": seller_id})
    low_stock = []

    pending_orders = order_collection.count_documents(
        {"seller_id": seller_id, "status": "pending"}
    )

    orders = order_collection.find({"seller_id": seller_id})

    revenue = 0

    for order in orders:
        revenue += order.get("total", 0)

    recent_products = []

    products = (
        product_collection.find({"seller_id": seller_id, "stock": {"$lte": 10}})
        .sort("_id", -1)
        .limit(5)
    )

    delivered_orders = order_collection.count_documents(
        {"seller_id": seller_id, "status": "delivered"}
    )

    for product in products:
        recent_products.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "stock": product["stock"],
            }
        )

    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "low_stock": low_stock,
        "delivered_orders": delivered_orders,
        "revenue": revenue,
        "recent_products": recent_products,
    }
