from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database.database import address_collection
from schemas.address import AddressCreate
from utils.customer_auth import get_current_customer

router = APIRouter(prefix="/address", tags=["Address"])


@router.post("/add")
def add_address(data: AddressCreate, customer_id: str = Depends(get_current_customer)):

    address_collection.insert_one(
        {
            "customer_id": customer_id,
            "full_name": data.full_name,
            "phone": data.phone,
            "address": data.address,
            "city": data.city,
            "state": data.state,
            "pincode": data.pincode,
        }
    )

    return {"message": "Address added successfully"}


@router.get("/")
def get_addresses(customer_id: str = Depends(get_current_customer)):

    addresses = address_collection.find({"customer_id": customer_id})

    result = []

    for address in addresses:

        result.append(
            {
                "id": str(address["_id"]),
                "full_name": address["full_name"],
                "phone": address["phone"],
                "address": address["address"],
                "city": address["city"],
                "state": address["state"],
                "pincode": address["pincode"],
            }
        )

    return result


@router.delete("/remove/{address_id}")
def remove_address(address_id: str, customer_id: str = Depends(get_current_customer)):

    address_collection.delete_one(
        {
            "_id": ObjectId(address_id),
            "customer_id": customer_id,
        }
    )

    return {"message": "Address removed"}
