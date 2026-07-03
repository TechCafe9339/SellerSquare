from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError

from config import settings

security = HTTPBearer()


def get_current_seller(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )

        seller_id = payload.get("seller_id")

        if not seller_id:
            raise HTTPException(status_code=401, detail="Invalid Token")

        return seller_id

    except JWTError:

        raise HTTPException(status_code=401, detail="Token Expired or Invalid")
