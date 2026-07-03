from jose import jwt
from datetime import datetime, timedelta

from config import Settings


def create_access_token(data):

    payload = data.copy()

    payload["exp"] = datetime.utcnow() + timedelta(days=7)

    return jwt.encode(payload, Settings.SECRET_KEY, algorithm=Settings.ALGORITHM)
