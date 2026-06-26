"""
routes/user.py
GET /user/data        — full profile + prediction history
PUT /user/skills      — update skill list
GET /user/stats       — aggregate stats
DELETE /user/account  — delete account
"""

from fastapi import APIRouter, Depends
from datetime import datetime

from models.schemas import UserSkillsUpdate, UserDataOut
from nlp.engine import normalize_skill
from database.connection import get_db
from routes.auth import get_current_user

router = APIRouter()


@router.get("/data")
async def get_user_data(current: dict = Depends(get_current_user)):
    db  = get_db()
    uid = str(current["_id"])

    predictions = [
        {**p, "_id": str(p["_id"])}
        async for p in db.predictions.find({"user_id": uid}).sort("created_at", -1).limit(20)
    ]
    chats = [
        {**c, "_id": str(c["_id"])}
        async for c in db.chats.find({"user_id": uid}).sort("created_at", -1).limit(50)
    ]
    stats = {
        "total_predictions": await db.predictions.count_documents({"user_id": uid}),
        "total_chats":       await db.chats.count_documents({"user_id": uid}),
        "skills_tracked":    len(current.get("skills", [])),
    }

    return {
        "user": {
            "id":         uid,
            "name":       current["name"],
            "email":      current["email"],
            "skills":     current.get("skills", []),
            "created_at": current.get("created_at"),
        },
        "predictions": predictions,
        "chats":       chats,
        "stats":       stats,
    }


@router.put("/skills")
async def update_skills(body: UserSkillsUpdate, current: dict = Depends(get_current_user)):
    db         = get_db()
    normalized = [normalize_skill(s) for s in body.skills if s.strip()]
    await db.userRegistration.update_one(
        {"_id": current["_id"]},
        {"$set": {"skills": normalized, "updated_at": datetime.utcnow()}},
    )
    return {"message": "Skills updated", "skills": normalized}


@router.get("/stats")
async def get_stats(current: dict = Depends(get_current_user)):
    db  = get_db()
    uid = str(current["_id"])
    return {
        "total_predictions": await db.predictions.count_documents({"user_id": uid}),
        "total_chats":       await db.chats.count_documents({"user_id": uid}),
        "skills_tracked":    len(current.get("skills", [])),
        "total_jobs_in_db":  await db.jobs.count_documents({}),
    }


@router.delete("/account")
async def delete_account(current: dict = Depends(get_current_user)):
    db  = get_db()
    uid = str(current["_id"])
    await db.userRegistration.delete_one({"_id": current["_id"]})
    await db.chats.delete_many({"user_id": uid})
    await db.predictions.delete_many({"user_id": uid})
    return {"message": "Account deleted"}
