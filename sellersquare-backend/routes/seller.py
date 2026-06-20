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

router = APIRouter(prefix="/seller", tags=["Seller"])


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
