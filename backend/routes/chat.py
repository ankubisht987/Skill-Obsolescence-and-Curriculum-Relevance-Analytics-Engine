"""
routes/chat.py
POST   /chat/message   — send message, receive AI reply
GET    /chat/history   — paginated chat history
DELETE /chat/history   — clear history
"""

from fastapi import APIRouter, Depends
from datetime import datetime
from groq import Groq
import os

from models.schemas import (
    ChatMessage,
    ChatResponse,
    ChatHistoryOut,
    ChatEntry
)

from database.connection import get_db
from routes.auth import get_current_user

router = APIRouter()

# =========================
# GROQ CONFIG
# =========================

# FIXED
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(
    api_key=GROQ_API_KEY
)

# =========================
# AI CALL
# =========================

async def _call_groq(system: str, messages: list):

    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY missing")
        return None

    try:

        formatted_messages = [
            {
                "role": m["role"],
                "content": m["content"]
            }
            for m in messages
        ]

        print("✅ Sending request to Groq")

        response = client.chat.completions.create(

            # Better model
            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": system
                },

                *formatted_messages
            ],

            # More consistent responses
            temperature=0.5,

            max_tokens=700,
        )

        reply = response.choices[0].message.content

        print("✅ Groq reply generated")

        return reply

    except Exception as e:

        print("❌ Groq Error:", e)

        return None


# =========================
# SEND MESSAGE
# =========================

@router.post("/message", response_model=ChatResponse)
async def send_message(
    body: ChatMessage,
    current: dict = Depends(get_current_user)
):

    db = get_db()

    uid = str(current["_id"])

    user_skills = current.get("skills", [])

    msg = body.message.strip()

    lower_msg = msg.lower()

    # =========================
    # SIMPLE INTENT DETECTION
    # =========================

    greetings = [
        "hi",
        "hello",
        "hey",
        "hii",
        "yo"
    ]

    if lower_msg in greetings:

        return ChatResponse(
            reply=(
                f"Hello {current['name']} 👋\n\n"
                f"I'm your AI career advisor.\n"
                f"Ask me about:\n"
                f"• Skills\n"
                f"• Career growth\n"
                f"• Salary trends\n"
                f"• Roadmaps\n"
                f"• Job readiness"
            ),
            source="system"
        )

    if (
        "how many skill" in lower_msg
        or "my skills" == lower_msg
        or "skills i have" in lower_msg
    ):

        if user_skills:

            skills_text = "\n".join(
                [f"• {s}" for s in user_skills]
            )

            return ChatResponse(
                reply=(
                    f"You currently have "
                    f"{len(user_skills)} skills:\n\n"
                    f"{skills_text}"
                ),
                source="system"
            )

        return ChatResponse(
            reply="You have not added any skills yet.",
            source="system"
        )

    # =========================
    # CHAT HISTORY
    # =========================

    history = await db.chats.find({
        "user_id": uid
    }).sort("created_at", 1).to_list(20)

    # =========================
    # FETCH RELEVANT JOBS
    # =========================

    jobs = [
        {**j, "_id": str(j["_id"])}
        async for j in db.jobs.find({
            "skills": {
                "$in": user_skills
            }
        }).limit(10)
    ]

    # fallback if no matching jobs

    if not jobs:

        jobs = [
            {**j, "_id": str(j["_id"])}
            async for j in db.jobs.find().limit(10)
        ]

    # =========================
    # BUILD JOB CONTEXT
    # =========================

    job_context = "\n\n".join([

        f"""
Company: {j.get('company', '')}
Role: {j.get('role', '')}
Skills: {', '.join(j.get('skills', []))}
Demand: {j.get('demand', '')}
YoY Growth: {j.get('yoy', '')}
Location: {j.get('location', '')}
Salary Range: ₹{j.get('salary_min', '')} - ₹{j.get('salary_max', '')}
"""

        for j in jobs

    ])

    # =========================
    # SYSTEM PROMPT
    # =========================

    system = f"""
You are SkillEngine AI.

You are an intelligent AI career assistant.

USER PROFILE:
Name: {current['name']}

Skills:
{', '.join(user_skills) if user_skills else 'No skills listed'}

JOB MARKET DATA:
{job_context}

YOUR RESPONSIBILITIES:
- Suggest next skills
- Recommend career paths
- Explain market trends
- Give learning roadmaps
- Recommend projects
- Explain technologies
- Help users improve employability

RULES:
- Answer naturally
- Be conversational
- Give personalized responses
- Avoid repeating the same answer
- Use bullet points when useful
- Keep responses concise but helpful
- Understand user intent carefully
- If user asks simple questions, answer directly
"""

    # =========================
    # MESSAGE HISTORY
    # =========================

    api_messages = []

    for m in history[-10:]:

        api_messages.append({

            "role": (
                "user"
                if m["role"] == "user"
                else "assistant"
            ),

            "content": m["content"]

        })

    api_messages.append({

        "role": "user",
        "content": msg

    })

    # =========================
    # AI RESPONSE
    # =========================

    reply = await _call_groq(
        system,
        api_messages
    )

    source = "groq"

    # =========================
    # FALLBACK NLP ENGINE
    # =========================

    if not reply:

        print("⚠️ Using fallback NLP engine")

        from nlp.engine import generate_local_response

        reply = generate_local_response(
            msg,
            user_skills,
            jobs
        )

        source = "local"

    # =========================
    # SAVE CHAT
    # =========================

    now = datetime.utcnow()

    await db.chats.insert_many([

        {
            "user_id": uid,
            "role": "user",
            "content": msg,
            "created_at": now
        },

        {
            "user_id": uid,
            "role": "assistant",
            "content": reply,
            "created_at": now
        },

    ])

    return ChatResponse(
        reply=reply,
        source=source
    )


# =========================
# GET HISTORY
# =========================

@router.get("/history", response_model=ChatHistoryOut)
async def get_history(
    skip: int = 0,
    limit: int = 100,
    current: dict = Depends(get_current_user),
):

    db = get_db()

    msgs = (
        await db.chats
        .find({
            "user_id": str(current["_id"])
        })
        .sort("created_at", 1)
        .skip(skip)
        .to_list(limit)
    )

    entries = [

        ChatEntry(
            role=m["role"],
            content=m["content"],
            ts=m["created_at"]
        )

        for m in msgs

    ]

    return ChatHistoryOut(
        messages=entries,
        total=len(entries)
    )


# =========================
# CLEAR HISTORY
# =========================

@router.delete("/history")
async def clear_history(
    current: dict = Depends(get_current_user)
):

    db = get_db()

    r = await db.chats.delete_many({
        "user_id": str(current["_id"])
    })

    return {
        "message": f"Deleted {r.deleted_count} messages"
    }