"""
services/auth_service.py
JWT creation / decoding and bcrypt password hashing.
"""

import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Dict
import os

SECRET_KEY  = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
ALGORITHM   = "HS256"
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


def decode_token(token: str) -> Optional[Dict]:
    """Decode and validate JWT; return payload or None."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
