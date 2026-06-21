from fastapi import APIRouter, HTTPException
from schemas.admin import AdminLogin
from database.database import (
    admin_collection,
    seller_collection,
    product_collection,
    order_collection,
)
from utils.password import verify_password
from utils.jwt_handler import create_access_token
from bson import ObjectId
from utils.password import hash_password
from schemas.change_password import ChangePassword
from utils.password import verify_password, hash_password

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login")
def login_admin(data: AdminLogin):

    admin = admin_collection.find_one({"email": data.email})

    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if data.secret_pin != admin["secret_pin"]:
        raise HTTPException(status_code=401, detail="Invalid secret pin")

    token = create_access_token({"admin_id": str(admin["_id"])})

    return {"access_token": token}


@router.get("/dashboard")
def dashboard():

    return {
        "total_sellers": seller_collection.count_documents({}),
        "total_products": product_collection.count_documents({}),
        "total_orders": order_collection.count_documents({}),
        "revenue": 0,
    }


@router.get("/sellers")
def get_sellers():

    sellers = seller_collection.find()

    result = []

    for seller in sellers:

        result.append(
            {
                "id": str(seller["_id"]),
                "business_name": seller["business_name"],
                "owner_name": seller["owner_name"],
                "email": seller["email"],
                "phone": seller["phone"],
                "is_active": seller.get("is_active", True),
            }
        )

    return result


@router.put("/sellers/{seller_id}/toggle")
def toggle_seller(seller_id: str):

    seller = seller_collection.find_one({"_id": ObjectId(seller_id)})

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller_collection.update_one(
        {"_id": ObjectId(seller_id)},
        {"$set": {"is_active": not seller.get("is_active", True)}},
    )

    return {"message": "Seller updated"}


@router.delete("/sellers/{seller_id}")
def delete_seller(seller_id: str):

    seller_collection.delete_one({"_id": ObjectId(seller_id)})

    product_collection.delete_many({"seller_id": seller_id})

    return {"message": "Seller and products deleted"}


@router.get("/create-admin")
def create_admin():

    admin_collection.insert_one(
        {
            "email": "debjeet@sellersquare.com",
            "password": hash_password("debjeet123"),
            "secret_pin": "123456",
        }
    )

    return {"message": "Admin created"}


@router.get("/products")
def get_products():

    products = product_collection.find()

    result = []

    for product in products:

        seller = seller_collection.find_one({"_id": ObjectId(product["seller_id"])})

        result.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "stock": product["stock"],
                "category": product["category"],
                "seller": seller["business_name"] if seller else "Unknown",
            }
        )

    return result


@router.delete("/products/{product_id}")
def delete_product(product_id: str):

    product_collection.delete_one({"_id": ObjectId(product_id)})

    return {"message": "Product deleted"}


@router.get("/orders")
def get_orders():

    orders = order_collection.find()

    result = []

    for order in orders:

        result.append(
            {
                "id": str(order["_id"]),
                "customer_name": order.get("customer_name", "Unknown"),
                "total_amount": order.get("total_amount", 0),
                "status": order.get("status", "Pending"),
                "created_at": str(order.get("created_at", "")),
            }
        )

    return result


@router.put("/orders/{order_id}")
def update_order_status(order_id: str, data: dict):

    order_collection.update_one(
        {"_id": ObjectId(order_id)}, {"$set": {"status": data["status"]}}
    )

    return {"message": "Order updated"}


@router.get("/profile")
def admin_profile():

    admin = admin_collection.find_one({})

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return {"email": admin["email"], "role": admin.get("role", "Admin")}


@router.put("/change-password")
def change_password(data: ChangePassword):

    admin = admin_collection.find_one({})

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    if not verify_password(data.current_password, admin["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    admin_collection.update_one(
        {"_id": admin["_id"]}, {"$set": {"password": hash_password(data.new_password)}}
    )

    return {"message": "Password changed successfully"}
