from fastapi import APIRouter, HTTPException
from schemas.seller import SellerRegister, SellerLogin
from database.database import seller_collection
from utils.auth import get_current_seller
from fastapi import Depends
from utils.password import hash_password, verify_password
from utils.jwt_handler import create_access_token
from bson import ObjectId
from schemas.change_password import ChangePassword
from utils.password import verify_password, hash_password
from uuid import uuid4
from datetime import datetime, timedelta
from database.database import seller_collection, reset_collection, otp_collection
import os
from dotenv import load_dotenv
from utils.email import send_reset_email, send_otp_email
import random

router = APIRouter(prefix="/seller", tags=["Seller"])

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")


@router.post("/register")
def register_seller(seller: SellerRegister):

    existing = seller_collection.find_one({"email": seller.email})

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    seller_data = seller.dict()

    seller_data["password"] = hash_password(seller.password)

    seller_collection.insert_one(seller_data)

    return {"message": "Seller registered successfully"}


@router.post("/login")
def login_seller(seller: SellerLogin):

    db_seller = seller_collection.find_one({"email": seller.email})

    if not db_seller:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(seller.password, db_seller["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"seller_id": str(db_seller["_id"])})

    return {"access_token": token}


@router.get("/profile")
def seller_profile(seller_id: str = Depends(get_current_seller)):

    seller = seller_collection.find_one({"_id": ObjectId(seller_id)})

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    return {
        "id": str(seller["_id"]),
        "business_name": seller["business_name"],
        "owner_name": seller["owner_name"],
        "email": seller["email"],
        "phone": seller["phone"],
        "gst_number": seller["gst_number"],
        # "store_logo": seller["store_logo"],
        # "store_address": seller["store_address"],
        # "store_description": seller["store_description"],
    }


@router.put("/profile")
def update_profile(data: dict, seller_id: str = Depends(get_current_seller)):

    seller_collection.update_one({"_id": ObjectId(seller_id)}, {"$set": data})

    return {"message": "Profile updated successfully"}


@router.put("/change-password")
def change_password(data: ChangePassword, seller_id: str = Depends(get_current_seller)):

    seller = seller_collection.find_one({"_id": ObjectId(seller_id)})

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    if not verify_password(data.current_password, seller["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    seller_collection.update_one(
        {"_id": ObjectId(seller_id)},
        {"$set": {"password": hash_password(data.new_password)}},
    )

    return {"message": "Password changed successfully"}


@router.post("/forgot-password")
def forgot_password(data: dict):

    seller = seller_collection.find_one({"email": data["email"]})

    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    seller_collection.update_one(
        {"email": data["email"]},
        {"$set": {"password": hash_password(data["new_password"])}},
    )

    return {"message": "Password updated successfully"}


@router.post("/reset-password")
def reset_password(data: dict):

    record = reset_collection.find_one({"token": data["token"]})

    if not record:
        raise HTTPException(status_code=400, detail="Invalid token")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    hashed = hash_password(data["new_password"])

    seller_collection.update_one(
        {"email": record["email"]}, {"$set": {"password": hashed}}
    )

    reset_collection.delete_one({"token": data["token"]})

    return {"message": "Password reset successful"}


@router.post("/send-otp")
def send_otp(data: dict):

    seller = seller_collection.find_one(
        {"email": data["email"]}
    )

    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Seller not found"
        )

    otp = str(random.randint(100000, 999999))

    otp_collection.delete_many(
        {"email": data["email"]}
    )

    otp_collection.insert_one({
        "email": data["email"],
        "otp": otp,
        "expires_at":
            datetime.utcnow() +
            timedelta(minutes=5)
    })

    send_otp_email(
        data["email"],
        otp
    )

    return {
        "message": "OTP sent"
    }


@router.post("/verify-otp")
def verify_otp(data: dict):

    record = otp_collection.find_one(
        {
            "email": data["email"],
            "otp": data["otp"]
        }
    )

    if not record:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="OTP expired"
        )

    seller_collection.update_one(
        {"email": data["email"]},
        {
            "$set": {
                "password":
                hash_password(
                    data["new_password"]
                )
            }
        }
    )

    otp_collection.delete_one(
        {"_id": record["_id"]}
    )

    return {
        "message":
        "Password updated successfully"
    }