"""
models/schemas.py
Pydantic v2 schemas for every API request / response.
Collections: users · jobs · skills · chats · predictions
"""

from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ── Enums ─────────────────────────────────────────────────────────────────

class SkillStatus(str, Enum):
    rising    = "rising"
    stable    = "stable"
    declining = "declining"
    emerging  = "emerging"
    hot       = "hot"
    missing   = "missing"


# ── Auth ──────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name:     str      = Field(..., min_length=2, max_length=100)
    email:    EmailStr
    password: str      = Field(..., min_length=6)

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:         str
    name:       str
    email:      str
    skills:     List[str] = []
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


# ── Jobs ──────────────────────────────────────────────────────────────────

class JobCreate(BaseModel):
    company:    str
    role:       str
    skills:     List[str]
    demand:     Optional[float] = None   # 0–100
    yoy:        Optional[float] = None   # year-over-year %
    location:   Optional[str]  = None
    salary_min: Optional[int]  = None
    salary_max: Optional[int]  = None

class JobOut(BaseModel):
    id:         str
    company:    str
    role:       str
    skills:     List[str]
    demand:     float = 0.0
    yoy:        float = 0.0
    location:   str   = ""
    salary_min: int   = 0
    salary_max: int   = 0
    created_at: datetime

class JobUploadResponse(BaseModel):
    inserted: int
    skipped:  int
    total:    int
    message:  str


# ── Skills ────────────────────────────────────────────────────────────────

class SkillEntry(BaseModel):
    skill:     str
    score:     float
    status:    SkillStatus
    frequency: int = 0

class SkillAnalyzeRequest(BaseModel):
    user_skills:    List[str]
    target_role:    Optional[str] = "All"
    target_company: Optional[str] = "All"

class AnalysisResult(BaseModel):
    match_score:     float
    matched:         List[str]
    missing:         List[SkillEntry]
    redundant:       List[str]
    scored_user:     List[SkillEntry]
    all_required:    List[str]
    recommendations: List[str]

class PredictRequest(BaseModel):
    user_skills:  List[str]
    target_role:  Optional[str] = None

class RoadmapPhase(BaseModel):
    phase:    str
    title:    str
    skills:   List[str]
    priority: str

class PredictionOut(BaseModel):
    obsolete:  List[SkillEntry]
    relevant:  List[SkillEntry]
    emerging:  List[str]
    gap_score: float
    roadmap:   List[RoadmapPhase]


# ── Chat ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class ChatEntry(BaseModel):
    role:    str        # "user" | "assistant"
    content: str
    ts:      datetime = Field(default_factory=datetime.utcnow)

class ChatResponse(BaseModel):
    reply:    str
    source:   str = "local"   # "anthropic" | "local"

class ChatHistoryOut(BaseModel):
    messages: List[ChatEntry]
    total:    int


# ── User ──────────────────────────────────────────────────────────────────

class UserSkillsUpdate(BaseModel):
    skills: List[str]

class UserDataOut(BaseModel):
    user:        UserOut
    predictions: List[Dict[str, Any]] = []
    chats:       List[ChatEntry]      = []
    stats:       Dict[str, int]       = {}
