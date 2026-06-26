"""
database/connection.py
Async MongoDB connection using Motor driver.
Manages connection lifecycle and creates indexes.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, TEXT
import os

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect_db() -> AsyncIOMotorDatabase:
    global _client, _db
    url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "skillengine")
    _client = AsyncIOMotorClient(url)
    _db = _client[db_name]
    await _create_indexes()
    return _db


async def disconnect_db():
    global _client
    if _client:
        _client.close()


async def _create_indexes():
    """Create performance & uniqueness indexes on startup."""
    # users: unique email
    await _db.userRegistration.create_index("email", unique=True)
    # jobs: compound + text search
    await _db.jobs.create_index([("company", ASCENDING), ("role", ASCENDING)])
    await _db.jobs.create_index([("skills", TEXT), ("role", TEXT), ("company", TEXT)])
    # skills trend cache
    await _db.skills.create_index([("name", ASCENDING)], unique=True)
    # chats: per-user ordered
    await _db.chats.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    # predictions: per-user ordered
    await _db.predictions.create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])


def get_db() -> AsyncIOMotorDatabase:
    """FastAPI dependency — returns active db handle."""
    return _db
