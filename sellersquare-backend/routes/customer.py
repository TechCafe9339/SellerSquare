from fastapi import APIRouter, HTTPException, Response
from schemas.customer import CustomerRegister, CustomerLogin, VerifyOTP
from database.database import (
    customer_collection,
    customer_otp_collection,
    product_collection,
)
from utils.password import hash_password, verify_password
from utils.jwt_handler import create_access_token
from utils.send_otp_email import send_otp_email
import random
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi import Depends
from utils.customer_auth import get_current_customer

router = APIRouter(prefix="/customer", tags=["Customer"])

"""
@router.post("/register")
def register_customer(customer: CustomerRegister):

    existing = customer_collection.find_one({"email": customer.email})

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    otp = str(random.randint(100000, 999999))

    customer_collection.insert_one(
        {
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "password": hash_password(customer.password),
            "is_verified": False,
        }
    )

    customer_otp_collection.delete_many({"email": customer.email})

    customer_otp_collection.insert_one(
        {
            "email": customer.email,
            "otp": otp,
            "expires_at": datetime.utcnow() + timedelta(minutes=10),
        }
    )

    #send_otp_email(customer.email, otp)

    return {"message": "OTP sent successfully", "otp": f"{otp}"}
"""


@router.post("/register")
def register_customer(customer: CustomerRegister):
    try:
        print("Step 1")

        existing = customer_collection.find_one({"email": customer.email})
        print("Step 2")

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        otp = str(random.randint(100000, 999999))
        print("Step 3")
        print("Password:", customer.password)
        print("Password length:", len(customer.password))
        customer_collection.insert_one(
            {
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "password": hash_password(customer.password),
                "is_verified": False,
            }
        )
        print("Step 4")

        customer_otp_collection.insert_one(
            {
                "email": customer.email,
                "otp": otp,
                "expires_at": datetime.utcnow() + timedelta(minutes=10),
            }
        )
        print("Step 5")

        # send_otp_email(customer.email, otp)

        print("Step 6")
        return {"message": "OTP sent successfully", "otp": otp}

    except Exception as e:
        print("ERROR:", repr(e))
        raise


@router.post("/login")
def login_customer(customer: CustomerLogin, response: Response):

    db_customer = customer_collection.find_one({"email": customer.email})

    if not db_customer:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_customer.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Please verify your email first")

    if not verify_password(customer.password, db_customer["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"customer_id": str(db_customer["_id"])})

    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        secure=False,  # True in production
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    return {
        "message": "Login successful",
        "customer": {
            "id": str(db_customer["_id"]),
            "name": db_customer["name"],
            "email": db_customer["email"],
        },
    }


@router.post("/verify-otp")
def verify_otp(data: VerifyOTP):

    record = customer_otp_collection.find_one({"email": data.email, "otp": data.otp})

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")

    customer_collection.update_one(
        {"email": data.email}, {"$set": {"is_verified": True}}
    )

    customer_otp_collection.delete_many({"email": data.email})

    return {"message": "Email verified successfully"}


@router.get("/profile")
def customer_profile(customer_id: str = Depends(get_current_customer)):

    customer = customer_collection.find_one({"_id": ObjectId(customer_id)})

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    return {
        "id": str(customer["_id"]),
        "name": customer["name"],
        "email": customer["email"],
        "phone": customer["phone"],
    }


@router.put("/profile")
def update_profile(data: dict, customer_id: str = Depends(get_current_customer)):

    customer_collection.update_one({"_id": ObjectId(customer_id)}, {"$set": data})

    return {"message": "Profile updated successfully"}


@router.get("/all")
def get_all_products():

    products = product_collection.find()

    result = []

    for product in products:

        result.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "stock": product["stock"],
                "category": product["category"],
                "image": product.get("image_url", ""),
            }
        )

    return result


@router.get("/{product_id}")
def get_product(product_id: str):

    product = product_collection.find_one({"_id": ObjectId(product_id)})

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "description": product.get("description", "No description available"),
        "price": product["price"],
        "stock": product["stock"],
        "category": product["category"],
        "image": product.get("image_url", ""),
    }

@router.post("/logout")
def logout(response: Response):

    response.delete_cookie("token")

    return {
        "message": "Logged out successfully"
    }