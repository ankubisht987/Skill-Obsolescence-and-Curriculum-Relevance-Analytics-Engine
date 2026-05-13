"""
routes/skills.py

POST /skills/analyze   — TF-IDF gap analysis
POST /skills/predict   — obsolescence prediction
GET  /skills/trends    — skill trends by category
GET  /skills/top       — top demanded skills from DB
"""

from fastapi import APIRouter, Depends
from datetime import datetime
from collections import Counter
from typing import List

from models.schemas import (
    SkillAnalyzeRequest,
    PredictRequest,
    AnalysisResult,
    PredictionOut,
)

from nlp.engine import (
    analyze_skills,
    predict_obsolescence,
    parse_user_skills,
    normalize_skill,
    SKILL_ONTOLOGY,
)

from database.connection import get_db
from routes.auth import get_current_user

router = APIRouter()


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _jobs_to_list(jobs) -> List[dict]:

    return [
        {**j, "_id": str(j["_id"])}
        for j in jobs
    ]


def clean_user_input(user_skills: List[str]) -> List[str]:
    """
    Smart cleaning for user-entered skills.

    Handles:
    - Typos
    - Sentences
    - College/project descriptions
    - Duplicate skills

    Examples:
    "Programming with Python and Java"
    -> ["Python", "Java"]

    "Restapis"
    -> ["REST APIs"]
    """

    extracted = []

    for item in user_skills:

        if not item:
            continue

        # parse free-form sentence
        parsed = parse_user_skills(item)

        if parsed:

            extracted.extend(parsed)

        else:
            # fallback normalize
            normalized = normalize_skill(item)

            if normalized:
                extracted.append(normalized)

    # remove duplicates while preserving order
    final = []

    for skill in extracted:

        if skill and skill not in final:
            final.append(skill)

    return final


# ─────────────────────────────────────────────────────────────
# ANALYZE SKILLS
# ─────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    body: SkillAnalyzeRequest,
    current: dict = Depends(get_current_user),
):

    db = get_db()

    jobs = _jobs_to_list([
        j async for j in db.jobs.find({}).limit(1000)
    ])

    # SMART CLEANING
    cleaned_skills = clean_user_input(body.user_skills)

    result = analyze_skills(
        cleaned_skills,
        jobs,
        body.target_role or "All",
        body.target_company or "All",
    )

    # Save analysis history
    await db.predictions.insert_one({

        "user_id": str(current["_id"]),

        "skills": cleaned_skills,

        "target_role": body.target_role,

        "target_company": body.target_company,

        "result": result,

        "created_at": datetime.utcnow(),
    })

    return result


# ─────────────────────────────────────────────────────────────
# PREDICT OBSOLESCENCE
# ─────────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictionOut)
async def predict(
    body: PredictRequest,
    current: dict = Depends(get_current_user),
):

    cleaned_skills = clean_user_input(body.user_skills)

    return predict_obsolescence(cleaned_skills)


# ─────────────────────────────────────────────────────────────
# SKILL TRENDS
# ─────────────────────────────────────────────────────────────

@router.get("/trends")
async def trends():

    by_trend = {}

    for skill, info in SKILL_ONTOLOGY.items():

        trend = info["trend"]

        by_trend.setdefault(trend, []).append(skill)

    return by_trend


# ─────────────────────────────────────────────────────────────
# TOP SKILLS
# ─────────────────────────────────────────────────────────────

@router.get("/top")
async def top_skills(limit: int = 20):

    db = get_db()

    jobs = [
        j async for j in db.jobs.find({}).limit(500)
    ]

    flat = [

        normalize_skill(s)

        for j in jobs
        for s in j.get("skills", [])
    ]

    flat = [s for s in flat if s]

    freq = Counter(flat)

    return [

        {
            "skill": skill,
            "count": count
        }

        for skill, count in freq.most_common(limit)
    ]