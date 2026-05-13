"""
SkillEngine — Skill Obsolescence & Curriculum Relevance Analytics Engine
FastAPI Backend Entry Point
Run: uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database.connection import connect_db, disconnect_db
from routes.auth import router as auth_router
from routes.jobs import router as jobs_router
from routes.skills import router as skills_router
from routes.chat import router as chat_router
from routes.user import router as user_router

app = FastAPI(
    title="SkillEngine API",
    description="AI-powered Skill Obsolescence & Curriculum Relevance Analytics",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lifecycle ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()
    print("✅  MongoDB connected")

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
    print("🛑  MongoDB disconnected")

# ── Health ────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "SkillEngine API", "version": "2.5.0"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth_router,   prefix="/auth",   tags=["Authentication"])
app.include_router(jobs_router,   prefix="/jobs",   tags=["Jobs"])
app.include_router(skills_router, prefix="/skills", tags=["Skills"])
app.include_router(chat_router,   prefix="/chat",   tags=["Chat"])
app.include_router(user_router,   prefix="/user",   tags=["User"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
