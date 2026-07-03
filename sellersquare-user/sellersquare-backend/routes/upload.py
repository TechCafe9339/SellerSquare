from fastapi import APIRouter, UploadFile, File
import cloudinary.uploader
from utils.auth import get_current_seller
from fastapi import Depends

router = APIRouter(prefix="/seller/upload", tags=["Upload"])


@router.post("/")
async def upload_image(
    file: UploadFile = File(...), seller_id: str = Depends(get_current_seller)
):

    result = cloudinary.uploader.upload(file.file)

    return {"image_url": result["secure_url"]}
