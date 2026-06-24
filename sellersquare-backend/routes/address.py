from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database.database import address_collection
from schemas.address import AddressCreate
from utils.customer_auth import get_current_customer

router = APIRouter(prefix="/address", tags=["Address"])


@router.post("/add")
def add_address(data: AddressCreate, customer_id: str = Depends(get_current_customer)):

    total_addresses = address_collection.count_documents({"customer_id": customer_id})

    address_collection.insert_one(
        {
            "customer_id": customer_id,
            "full_name": data.full_name,
            "phone": data.phone,
            "address": data.address,
            "city": data.city,
            "state": data.state,
            "pincode": data.pincode,
            "is_default": total_addresses == 0,
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
                "is_default": address.get("is_default", False),
            }
        )

    return result


@router.delete("/{address_id}")
def delete_address(address_id: str, customer_id: str = Depends(get_current_customer)):

    result = address_collection.delete_one(
        {"_id": ObjectId(address_id), "customer_id": customer_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")

    return {"message": "Address deleted successfully"}


@router.put("/{address_id}")
def update_address(
    address_id: str,
    data: AddressCreate,
    customer_id: str = Depends(get_current_customer),
):

    result = address_collection.update_one(
        {"_id": ObjectId(address_id), "customer_id": customer_id},
        {
            "$set": {
                "full_name": data.full_name,
                "phone": data.phone,
                "address": data.address,
                "city": data.city,
                "state": data.state,
                "pincode": data.pincode,
            }
        },
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Address not found")

    return {"message": "Address updated successfully"}


@router.get("/{address_id}")
def get_single_address(
    address_id: str, customer_id: str = Depends(get_current_customer)
):

    address = address_collection.find_one(
        {"_id": ObjectId(address_id), "customer_id": customer_id}
    )

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return {
        "id": str(address["_id"]),
        "full_name": address["full_name"],
        "phone": address["phone"],
        "address": address["address"],
        "city": address["city"],
        "state": address["state"],
        "pincode": address["pincode"],
        "is_default": address.get(
            "is_default",
            False
        )
    }


@router.put("/default/{address_id}")
def set_default_address(
    address_id: str, customer_id: str = Depends(get_current_customer)
):

    address = address_collection.find_one(
        {"_id": ObjectId(address_id), "customer_id": customer_id}
    )

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    address_collection.update_many(
        {"customer_id": customer_id}, {"$set": {"is_default": False}}
    )

    address_collection.update_one(
        {"_id": ObjectId(address_id)}, {"$set": {"is_default": True}}
    )

    return {"message": "Default address updated"}
