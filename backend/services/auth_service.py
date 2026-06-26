"""
services/auth_service.py
JWT creation / decoding and bcrypt password hashing.
"""

import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Dict
import os

# SECRET_KEY  = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
SECRET_KEY  = "6ce9bd3c51997f7ccae6d9f6f5f60266dbdce0518582418415e8365af54779a4"
ALGORITHM = "HS512"
EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "7"))


def hash_password(plain: str) -> str:
    """Return bcrypt hash of plain-text password."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Compare plain password against stored bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(payload: Dict) -> str:
    """Create a signed JWT that expires in EXPIRE_DAYS days."""
    data = payload.copy()
    data["exp"] = datetime.utcnow() + timedelta(days=EXPIRE_DAYS)
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("JWT Payload:", payload)

        return payload

    except JWTError as e:
        print("JWT Error:", e)
        return None
    
