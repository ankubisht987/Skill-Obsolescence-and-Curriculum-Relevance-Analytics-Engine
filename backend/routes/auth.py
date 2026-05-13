"""
routes/auth.py
POST /auth/register  — create account
POST /auth/login     — get JWT
GET  /auth/me        — current user info
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from datetime import datetime

from models.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from services.auth_service import hash_password, verify_password, create_token, decode_token
from database.connection import get_db

router = APIRouter()


# ── Dependency: resolve Bearer token → user doc ───────────────────────────

async def get_current_user(authorization: str = Header(...)) -> dict:
    try:
        token = authorization.split(" ")[1]
    except (IndexError, AttributeError):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalid or expired")
    db   = get_db()
    user = await db.users.find_one({"email": payload.get("email")})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def _user_out(u: dict) -> UserOut:
    return UserOut(
        id=str(u["_id"]),
        name=u["name"],
        email=u["email"],
        skills=u.get("skills", []),
        created_at=u.get("created_at", datetime.utcnow()),
    )


# ── Routes ────────────────────────────────────────────────────────────────

@router.post("/register", status_code=201)
async def register(body: UserRegister):
    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    await db.users.insert_one({
        "name":       body.name,
        "email":      body.email,
        "password":   hash_password(body.password),
        "skills":     [],
        "created_at": datetime.utcnow(),
    })
    return {"message": "Account created successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db   = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"email": user["email"], "id": str(user["_id"])})
    return TokenResponse(access_token=token, user=_user_out(user))


@router.get("/me", response_model=UserOut)
async def me(current: dict = Depends(get_current_user)):
    return _user_out(current)
