from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

from config import Settings

security = HTTPBearer()


def get_current_customer(token=Depends(security)):

    try:
        payload = jwt.decode(
            token.credentials, Settings.SECRET_KEY, algorithms=[Settings.ALGORITHM]
        )

        customer_id = payload.get("customer_id")

        if not customer_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        return customer_id

    except Exception as e:
        print("AUTH ERROR:", e)

        raise HTTPException(status_code=401, detail="Invalid token")
