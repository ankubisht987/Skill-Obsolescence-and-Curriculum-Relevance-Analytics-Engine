"""
routes/jobs.py

POST   /jobs/upload          — upload JSON or CSV dataset
GET    /jobs/                — list jobs (filter: company, role)
GET    /jobs/{job_id}        — single job
DELETE /jobs/{job_id}        — delete job (auth required)
GET    /jobs/companies       — distinct company list
GET    /jobs/roles           — distinct role list
"""

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Query,
    HTTPException,
    Depends
)

from bson import ObjectId

from datetime import datetime

from typing import Optional, List

import json
import csv
import io

from models.schemas import JobUploadResponse

from nlp.engine import (
    extract_skills_from_text,
    normalize_skill
)

from database.connection import get_db

from routes.auth import get_current_user

router = APIRouter()


# =========================================================
# CLEAN MONGO DOCUMENT
# =========================================================

def _clean(j: dict) -> dict:
    """
    Serialize MongoDB document:
    Convert ObjectId → string
    """

    j = dict(j)

    j["id"] = str(j.pop("_id"))

    return j


# =========================================================
# UPLOAD JOBS
# =========================================================

@router.post(
    "/upload",
    response_model=JobUploadResponse
)

async def upload_jobs(

    file: UploadFile = File(...),

    _: dict = Depends(get_current_user),

):

    db = get_db()

    content = await file.read()

    records: List[dict] = []

    # =====================================================
    # JSON FILE
    # =====================================================

    if file.filename.endswith(".json"):

        data = json.loads(content)

        records = (
            data
            if isinstance(data, list)
            else [data]
        )

    # =====================================================
    # CSV FILE
    # =====================================================

    elif file.filename.endswith(".csv"):

        reader = csv.DictReader(

            io.StringIO(
                content.decode("utf-8-sig")
            )

        )

        for row in reader:

            raw = row.get("skills", "")

            row["skills"] = (

                [s.strip() for s in raw.split(",")]

                if raw else []

            )

            records.append(dict(row))

    else:

        raise HTTPException(
            400,
            "Only .json or .csv files are supported"
        )

    inserted = 0

    skipped = 0

    # =====================================================
    # PROCESS RECORDS
    # =====================================================

    for rec in records:

        raw_skills = rec.get("skills", [])

        # Extract skills from string

        if isinstance(raw_skills, str):

            raw_skills = extract_skills_from_text(
                raw_skills
            )

        # Normalize skills

        normalized = [

            normalize_skill(s)

            for s in raw_skills

            if s.strip()

        ]

        # Build document

        doc = {

            "company": str(
                rec.get("company", "Unknown")
            ).strip(),

            "role": str(
                rec.get(
                    "role",
                    rec.get("title", "Unknown")
                )
            ).strip(),

            "skills": normalized,

            "demand": float(
                rec.get("demand") or 0
            ),

            "yoy": float(
                rec.get("yoy") or 0
            ),

            "location": str(
                rec.get("location", "")
            ).strip(),

            "salary_min": int(
                float(
                    rec.get("salary_min") or 0
                )
            ),

            "salary_max": int(
                float(
                    rec.get("salary_max") or 0
                )
            ),

            "created_at": datetime.utcnow(),

        }

        # =================================================
        # UPSERT
        # =================================================

        result = await db.jobs.update_one(

            {
                "company": doc["company"],
                "role": doc["role"]
            },

            {
                "$set": doc
            },

            upsert=True

        )

        if result.upserted_id:

            inserted += 1

        else:

            skipped += 1

    return JobUploadResponse(

        inserted=inserted,

        skipped=skipped,

        total=inserted + skipped,

        message=(
            f"Processed {inserted + skipped} records — "
            f"{inserted} new, "
            f"{skipped} updated"
        )

    )


# =========================================================
# LIST JOBS
# =========================================================

@router.get(
    "/",
    response_model=List[dict]
)

async def list_jobs(

    company: Optional[str] = Query(None),

    role: Optional[str] = Query(None),

    skip: int = Query(
        0,
        ge=0
    ),

    # FIXED
    limit: int = Query(
        1000,
        ge=1,
        le=5000
    ),

):

    db = get_db()

    q: dict = {}

    # =====================================================
    # FILTER COMPANY
    # =====================================================

    if company:

        q["company"] = {

            "$regex": company,

            "$options": "i"

        }

    # =====================================================
    # FILTER ROLE
    # =====================================================

    if role:

        q["role"] = {

            "$regex": role,

            "$options": "i"

        }

    # =====================================================
    # FETCH JOBS
    # =====================================================

    jobs = [

        _clean(j)

        async for j in db.jobs.find(q)

        .sort("created_at", -1)

        .skip(skip)

        .limit(limit)

    ]

    return jobs


# =========================================================
# LIST COMPANIES
# =========================================================

@router.get(
    "/companies",
    response_model=List[str]
)

async def list_companies():

    db = get_db()

    companies = await db.jobs.distinct(
        "company"
    )

    return sorted(companies)


# =========================================================
# LIST ROLES
# =========================================================

@router.get(
    "/roles",
    response_model=List[str]
)

async def list_roles():

    db = get_db()

    roles = await db.jobs.distinct(
        "role"
    )

    return sorted(roles)


# =========================================================
# SINGLE JOB
# =========================================================

@router.get(
    "/{job_id}",
    response_model=dict
)

async def get_job(job_id: str):

    db = get_db()

    try:

        oid = ObjectId(job_id)

    except Exception:

        raise HTTPException(
            400,
            "Invalid job ID"
        )

    job = await db.jobs.find_one({
        "_id": oid
    })

    if not job:

        raise HTTPException(
            404,
            "Job not found"
        )

    return _clean(job)


# =========================================================
# DELETE JOB
# =========================================================

@router.delete("/{job_id}")

async def delete_job(

    job_id: str,

    _: dict = Depends(get_current_user)

):

    db = get_db()

    try:

        oid = ObjectId(job_id)

    except Exception:

        raise HTTPException(
            400,
            "Invalid job ID"
        )

    result = await db.jobs.delete_one({
        "_id": oid
    })

    if result.deleted_count == 0:

        raise HTTPException(
            404,
            "Job not found"
        )

    return {
        "message": "Job deleted"
    }