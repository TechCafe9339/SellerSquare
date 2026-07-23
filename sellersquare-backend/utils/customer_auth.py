from fastapi import Depends, HTTPException, Request
from jose import jwt

from config import Settings


def get_current_customer(request: Request):
    try:
        token = request.cookies.get("token")

        if not token:
            raise HTTPException(
                status_code=401,
                detail="Not authenticated",
            )

        payload = jwt.decode(
            token,
            Settings.SECRET_KEY,
            algorithms=[Settings.ALGORITHM],
        )

        customer_id = payload.get("customer_id")

        if not customer_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
            )

        return customer_id

    except Exception as e:
        print("AUTH ERROR:", e)

        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )