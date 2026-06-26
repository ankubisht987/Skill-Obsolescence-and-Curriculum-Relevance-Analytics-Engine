# SkillEngine — Complete Project Context
# Paste this entire document into any AI chat model (ChatGPT, Gemini, Claude, etc.)
# It gives the model full understanding of what was built, how it works, and what each file does.

---

## PROJECT NAME
SkillEngine — Skill Obsolescence & Curriculum Relevance Analytics Engine

## ONE-LINE SUMMARY
A full-stack AI-powered web application that analyzes job market data to predict which skills are becoming obsolete, which are in demand, and generates personalized learning roadmaps for users.

---

## TECH STACK

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts          |
| Backend     | Python 3.11, FastAPI, Uvicorn                   |
| Database    | MongoDB (Motor async driver)                    |
| Auth        | JWT (python-jose) + bcrypt password hashing     |
| NLP Engine  | Custom TF-IDF, skill ontology, cosine similarity|
| AI Chat     | Anthropic Claude API → local NLP fallback       |
| HTTP Client | Axios (frontend), httpx (backend)               |

---

## PROJECT STRUCTURE

```
skillengine/
├── backend/                          ← Python FastAPI server
│   ├── main.py                       ← App entry, CORS, startup hooks, router registration
│   ├── requirements.txt              ← All Python dependencies
│   ├── .env                          ← MONGO_URL, JWT_SECRET, ANTHROPIC_API_KEY
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py             ← Motor AsyncIOMotorClient, index creation on startup
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py                ← Pydantic v2 schemas for ALL request/response types
│   ├── nlp/
│   │   ├── __init__.py
│   │   └── engine.py                 ← FULL NLP pipeline (see NLP section below)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                   ← POST /auth/register, /auth/login, GET /auth/me
│   │   ├── jobs.py                   ← POST /jobs/upload, GET /jobs/, /jobs/companies, /jobs/roles
│   │   ├── skills.py                 ← POST /skills/analyze, /skills/predict, GET /skills/trends, /skills/top
│   │   ├── chat.py                   ← POST /chat/message, GET /chat/history, DELETE /chat/history
│   │   └── user.py                   ← GET /user/data, PUT /user/skills, GET /user/stats, DELETE /user/account
│   └── services/
│       ├── __init__.py
│       └── auth_service.py           ← hash_password(), verify_password(), create_token(), decode_token()
│
├── frontend/                         ← React + Tailwind CSS SPA
│   ├── index.html                    ← HTML entry point (Syne + JetBrains Mono fonts)
│   ├── package.json                  ← react, react-router-dom, recharts, axios, lucide-react, clsx
│   ├── vite.config.js                ← Vite dev server, proxy /api → localhost:8000
│   ├── tailwind.config.js            ← Custom dark theme: bg, surface, card, border, accent, green, red, purple
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                  ← ReactDOM root, BrowserRouter, AuthProvider, react-hot-toast
│       ├── App.jsx                   ← React Router: public routes (login/register) + protected routes
│       ├── index.css                 ← @tailwind base/components/utilities + .glass, .btn-primary, .badge-* classes
│       ├── context/
│       │   └── AuthContext.jsx       ← createContext, login(), register(), logout(), updateUser(), session restore
│       ├── services/
│       │   └── api.js                ← Axios instance with JWT interceptor + authAPI, jobsAPI, skillsAPI, chatAPI, userAPI
│       ├── hooks/
│       │   └── useApi.js             ← useApi(fn) hook: {data, loading, error, execute} + useFetch(fn)
│       ├── components/
│       │   ├── layout/
│       │   │   └── Layout.jsx        ← Collapsible sidebar + NavLink active states + <Outlet/>
│       │   ├── ui/
│       │   │   ├── PageHeader.jsx    ← Title + subtitle + actions slot
│       │   │   ├── StatCard.jsx      ← Metric card with label/value/change/icon
│       │   │   ├── SkillBadge.jsx    ← Color-coded badge: rising/stable/declining/hot/emerging
│       │   │   ├── ProgressBar.jsx   ← Animated progress with auto color (green/amber/red)
│       │   │   └── Loader.jsx        ← <Spinner/>, <Dots/>, <Loader text="..."/>
│       │   └── charts/
│       │       ├── DemandBarChart.jsx   ← Recharts BarChart, per-bar colors, custom tooltip
│       │       ├── TrendLineChart.jsx   ← Recharts LineChart, 3 lines (AI/ML, Web Dev, DevOps), 6 months
│       │       ├── SkillRadarChart.jsx  ← Recharts RadarChart, user vs market average
│       │       └── DonutChart.jsx       ← Recharts PieChart doughnut, skill category distribution
│       └── pages/
│           ├── LoginPage.jsx         ← Email/password login + Demo account button
│           ├── RegisterPage.jsx      ← Name/email/password registration
│           ├── Dashboard.jsx         ← Company filter, 4 stat cards, 2 charts, company grid, job table
│           ├── AnalyzePage.jsx       ← Skill input textarea + role select + TF-IDF analysis + 4 tabs
│           ├── DatasetPage.jsx       ← Drag-and-drop JSON/CSV upload + preview table + format guide
│           ├── InsightsPage.jsx      ← Donut chart, company demand bars, trend line, obsolescence table, emerging tech
│           ├── ChatPage.jsx          ← Full chat UI, Claude API + local NLP fallback, suggestion pills
│           └── ProfilePage.jsx       ← Avatar, stats, skills manager (add/remove/save), analysis history
│
└── sample_dataset.json               ← 20 job listings: Google, Amazon, Microsoft, Meta, Apple, Netflix, Stripe, OpenAI, Databricks
```

---

## DATABASE — MongoDB Collections

### Collection: `users`
```json
{
  "_id": "ObjectId",
  "name": "Ankush Sharma",
  "email": "ankush@example.com",
  "password": "$2b$12$bcrypt_hash",
  "skills": ["Python", "React", "SQL", "Docker"],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```
Indexes: unique on `email`

### Collection: `jobs`
```json
{
  "_id": "ObjectId",
  "company": "Google",
  "role": "ML Engineer",
  "skills": ["Python", "PyTorch", "LLMs", "MLOps"],
  "demand": 97,
  "yoy": 18,
  "location": "Mountain View, CA",
  "salary_min": 180000,
  "salary_max": 300000,
  "created_at": "ISODate"
}
```
Indexes: compound (company + role), text index on skills/role/company

### Collection: `chats`
```json
{
  "_id": "ObjectId",
  "user_id": "string (ObjectId of user)",
  "role": "user | assistant",
  "content": "Am I ready for a Google SDE role?",
  "created_at": "ISODate"
}
```
Indexes: (user_id, created_at)

### Collection: `predictions`
```json
{
  "_id": "ObjectId",
  "user_id": "string (ObjectId of user)",
  "skills": ["Python", "React", "SQL"],
  "target_role": "All",
  "result": {
    "match_score": 65.0,
    "matched": ["Python", "SQL"],
    "missing": [{"skill": "PyTorch", "score": 78.2, "status": "rising", "frequency": 8}],
    "redundant": ["jQuery"],
    "scored_user": [...],
    "recommendations": ["Learn PyTorch", "Add Kubernetes", "Reduce focus on jQuery"]
  },
  "created_at": "ISODate"
}
```

### Collection: `skills`
```json
{
  "_id": "ObjectId",
  "name": "Python",
  "trend": "stable",
  "demand_score": 78.5,
  "updated_at": "ISODate"
}
```

---

## API ENDPOINTS — Full Reference

### Authentication
| Method | Endpoint         | Body                              | Response                    |
|--------|------------------|-----------------------------------|-----------------------------|
| POST   | /auth/register   | {name, email, password}           | {message}                   |
| POST   | /auth/login      | {email, password}                 | {access_token, user}        |
| GET    | /auth/me         | — (Bearer token required)         | {id, name, email, skills}   |

### Jobs
| Method | Endpoint          | Notes                                              |
|--------|-------------------|----------------------------------------------------|
| POST   | /jobs/upload      | multipart/form-data, accepts .json or .csv file    |
| GET    | /jobs/            | Query params: company, role, skip, limit           |
| GET    | /jobs/companies   | Returns distinct company list                      |
| GET    | /jobs/roles       | Returns distinct role list                         |
| GET    | /jobs/{id}        | Single job by MongoDB ObjectId                     |
| DELETE | /jobs/{id}        | Auth required                                      |

### Skills
| Method | Endpoint           | Body                                    | Response                        |
|--------|--------------------|-----------------------------------------|---------------------------------|
| POST   | /skills/analyze    | {user_skills[], target_role, target_company} | AnalysisResult (match_score, missing, matched, etc.) |
| POST   | /skills/predict    | {user_skills[], target_role}            | PredictionOut (obsolete, relevant, roadmap) |
| GET    | /skills/trends     | —                                       | {rising: [], stable: [], declining: [], emerging: []} |
| GET    | /skills/top        | Query: limit=20                         | [{skill, count}]                |

### Chat
| Method | Endpoint         | Body/Notes                              | Response               |
|--------|------------------|-----------------------------------------|------------------------|
| POST   | /chat/message    | {message} — calls Claude API first, falls back to local NLP | {reply, source} |
| GET    | /chat/history    | Query: skip, limit                      | {messages[], total}    |
| DELETE | /chat/history    | Clears all messages for current user    | {message}              |

### User
| Method | Endpoint         | Body/Notes                              | Response               |
|--------|------------------|-----------------------------------------|------------------------|
| GET    | /user/data       | Returns user + last 20 predictions + 50 chats | {user, predictions, chats, stats} |
| PUT    | /user/skills     | {skills[]}                              | {message, skills}      |
| GET    | /user/stats      | —                                       | {total_predictions, total_chats, skills_tracked, total_jobs_in_db} |
| DELETE | /user/account    | Deletes user + all chats + predictions  | {message}              |

---

## NLP ENGINE — How It Works (backend/nlp/engine.py)

### Skill Ontology
- 50+ skills defined with: aliases, category, trend
- Categories: AI/ML, Frontend, Backend, DevOps, Cloud, Data, Security, Legacy, Emerging
- Trends: rising (×1.4 weight), stable (×1.0), declining (×0.35), emerging (×1.7)

### Key Functions

**`tokenize(text)`**
- Lowercases, splits on non-alphanumeric, removes stop words
- Returns clean token list

**`normalize_skill(raw)`**
- Maps raw skill string to canonical ontology name using alias matching
- e.g. "pytorch" → "PyTorch", "k8s" → "Kubernetes"

**`extract_skills_from_text(text)`**
- Regex word-boundary matching against all ontology skills + aliases
- Used for free-text job descriptions

**`TFIDFEngine`**
- `.fit(documents)` — builds IDF cache from corpus of skill lists
- `.score(term, document)` — TF×IDF for a term in a document
- `.market_score(skill, flat_corpus)` — returns 0–100 demand score with trend weighting

**`cosine_similarity(vec_a, vec_b)`**
- Dot product / (|a| × |b|) — measures similarity between two skill vectors

**`analyze_skills(user_skills, job_records, target_role, target_company)`**
- Filters job records by role/company
- Normalizes user skills
- Computes matched, missing, redundant skill sets
- Scores every skill via TF-IDF + trend weight
- Sorts missing skills by importance (highest score first)
- Returns: match_score (0–100%), matched[], missing[{skill,score,status,frequency}], redundant[], scored_user[], recommendations[]

**`predict_obsolescence(user_skills)`**
- Classifies each user skill as obsolete/relevant based on trend
- Generates 3-phase learning roadmap (0–3mo, 3–6mo, 6–12mo)
- Returns: obsolete[], relevant[], emerging[], gap_score%, roadmap[]

**`generate_local_response(message, user_skills, job_data)`**
- Rule-based NLP chatbot fallback
- Handles: company readiness, skill recommendations, obsolescence queries, salary questions
- Used when Anthropic API key is not configured

---

## FRONTEND ARCHITECTURE

### Authentication Flow
1. User logs in via `LoginPage.jsx` → calls `authAPI.login()`
2. JWT token + user object stored in `localStorage` as `se_token` / `se_user`
3. `AuthContext.jsx` restores session on page load, verifies token via `GET /auth/me`
4. Axios interceptor in `api.js` attaches `Authorization: Bearer <token>` to every request
5. On 401 response → auto-clears storage, redirects to `/login`
6. Protected routes wrapped in `<RequireAuth>` in `App.jsx`

### Routing (App.jsx)
```
/login          → LoginPage (public)
/register       → RegisterPage (public)
/               → Dashboard (protected)
/analyze        → AnalyzePage (protected)
/datasets       → DatasetPage (protected)
/insights       → InsightsPage (protected)
/chat           → ChatPage (protected)
/profile        → ProfilePage (protected)
```

### State Management
- No Redux — uses React Context (`AuthContext`) for global auth
- Per-page local state with `useState` / `useEffect`
- `useApi(fn)` hook: wraps async calls with `{data, loading, error, execute}`
- `useFetch(fn)` hook: auto-fetches on mount with `{data, loading, error, refetch}`

### Tailwind Theme (tailwind.config.js)
```js
colors: {
  bg: '#070b12',        // page background
  surface: '#0f1724',   // sidebar / nav
  card: '#141e2e',      // card backgrounds
  border: '#1e2d45',    // borders
  text: '#dde4f0',      // primary text
  muted: '#6b7e99',     // secondary text
  accent: '#3b82f6',    // blue — primary CTA
  green: '#22c55e',     // rising / success
  red: '#ef4444',       // declining / danger
  amber: '#f59e0b',     // warning / missing
  purple: '#a855f7',    // emerging / AI
  cyan: '#06b6d4',      // special
}
```

### Component Hierarchy
```
App
└── Layout (sidebar + outlet)
    ├── Dashboard
    │   ├── StatCard ×4
    │   ├── DemandBarChart
    │   ├── TrendLineChart
    │   └── Company grid + Jobs table
    ├── AnalyzePage
    │   ├── Textarea input + role select
    │   ├── StatCard ×4 (scores)
    │   └── Tabs: Gap Analysis | Radar | Scores | Roadmap
    │       ├── SkillBadge (matched/missing)
    │       ├── SkillRadarChart
    │       ├── ProgressBar (per skill)
    │       └── Roadmap timeline
    ├── DatasetPage
    │   ├── Drag-and-drop upload zone
    │   ├── Preview table
    │   └── Format guide
    ├── InsightsPage
    │   ├── DonutChart (skill categories)
    │   ├── Company demand bars (ProgressBar)
    │   ├── TrendLineChart (18 months)
    │   └── Obsolescence table + Emerging grid
    ├── ChatPage
    │   ├── Message list (user + assistant bubbles)
    │   ├── Suggestion pills
    │   └── Textarea + Send button
    └── ProfilePage
        ├── Avatar + stats grid
        ├── Skills manager (add/remove/save)
        └── Analysis history table
```

---

## DATA FLOW — End to End

### User Registration & Login
```
User fills form
  → POST /auth/register (hashes password with bcrypt, stores in MongoDB)
  → POST /auth/login (verifies password, returns JWT)
  → JWT stored in localStorage
  → AuthContext.user set globally
  → Navigate to Dashboard
```

### Uploading a Job Dataset
```
User drags JSON/CSV onto upload zone (DatasetPage)
  → jobsAPI.upload(file) → POST /jobs/upload (multipart)
  → Backend reads file, parses JSON or CSV
  → For each record: normalize skills via ontology
  → Upsert into MongoDB jobs collection (company+role as unique key)
  → Returns {inserted, skipped, total}
  → Frontend shows success card with counts
```

### Skill Gap Analysis
```
User enters skills + selects target role (AnalyzePage)
  → skillsAPI.analyze({user_skills, target_role})
  → POST /skills/analyze
  → Backend fetches up to 1000 jobs from MongoDB
  → Filters by target_role if specified
  → TFIDFEngine.fit(all job skill lists)
  → Normalizes user skills via ontology
  → Computes: matched ∩ required, missing = required - user, redundant = user - required
  → Scores every skill: TF-IDF × trend weight → 0-100 score
  → Saves prediction to MongoDB
  → Returns AnalysisResult
  → Frontend renders 4 stat cards + tab panels (gap/radar/scored/roadmap)
```

### AI Chat
```
User sends message (ChatPage)
  → chatAPI.send(message) → POST /chat/message
  → Backend fetches last 20 chat messages for context
  → Tries Anthropic Claude API first (if ANTHROPIC_API_KEY set)
      System prompt includes: user name, skills, career context
      Sends conversation history as messages array
  → If API fails/not configured → generate_local_response() NLP fallback
      Rule-based matching on keywords (google, learn, obsolete, salary...)
      Uses TF-IDF analysis data for personalized answers
  → Saves both user message + assistant reply to MongoDB chats collection
  → Returns {reply, source: "anthropic"|"local"}
  → Frontend appends bubbles to chat
```

### Obsolescence Prediction
```
User clicks predict (or triggered from AnalyzePage)
  → skillsAPI.predict({user_skills})
  → POST /skills/predict
  → predict_obsolescence() in nlp/engine.py
  → Each skill classified by trend: declining → obsolete, else relevant
  → Gap score = obsolete_count / total × 100
  → 3-phase roadmap generated from RISING_SKILLS and EMERGING_SKILLS
  → Returns PredictionOut
```

---

## ENVIRONMENT VARIABLES

```bash
# backend/.env
MONGO_URL=mongodb://localhost:27017        # or Atlas connection string
DB_NAME=skillengine
JWT_SECRET=your-long-random-secret        # used to sign/verify all JWTs
JWT_EXPIRE_DAYS=7
ANTHROPIC_API_KEY=sk-ant-api03-...        # optional — enables real Claude AI chat
CORS_ORIGINS=http://localhost:5173        # comma-separated allowed origins
```

---

## HOW TO RUN

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
# Edit .env
uvicorn main:app --reload   --host 0.0.0.0 --port 8000
# Swagger UI: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
# Vite proxies /api/* → http://localhost:8000
```

---

## KEY DEPENDENCIES

### Backend (requirements.txt)
- `fastapi==0.111.0` — web framework
- `uvicorn[standard]` — ASGI server
- `motor==3.4.0` — async MongoDB driver
- `pydantic[email]==2.7.1` — data validation
- `python-jose[cryptography]` — JWT
- `bcrypt==4.1.3` — password hashing
- `httpx==0.27.0` — async HTTP (for Anthropic API calls)
- `python-multipart` — file upload support

### Frontend (package.json)
- `react@18` + `react-dom`
- `react-router-dom@6` — client-side routing
- `recharts@2` — all charts (Bar, Line, Radar, Pie)
- `axios@1` — HTTP client with interceptors
- `tailwindcss@3` — utility CSS
- `lucide-react` — icons
- `react-hot-toast` — notifications
- `clsx` — conditional className utility

---

## SAMPLE DATASET (sample_dataset.json)
20 job listings across 9 companies:
- Google (3): AI/ML Engineer, Frontend Engineer, SRE
- Amazon (3): Backend Engineer, Data Engineer, ML Scientist
- Microsoft (3): Cloud Architect, AI Research, Full Stack
- Meta (2): Systems Engineer, AR/VR Engineer
- Apple (2): iOS Developer, ML Engineer
- Netflix (2): Backend Engineer, Data Engineer
- Stripe (2): Security Engineer, Backend Engineer
- OpenAI (2): ML Engineer, Research Engineer
- Databricks (1): Data Platform Engineer

---

## WHAT THIS PROJECT DOES — PLAIN ENGLISH

SkillEngine is a career analytics platform. You upload job listings from companies like Google, Amazon, Microsoft. The system uses NLP (TF-IDF scoring) to analyze which skills are most demanded. Users enter their current skills and the system:

1. **Compares** their skills against the job market using TF-IDF + cosine similarity
2. **Shows** a match score (0–100%), what they have, what they're missing, what's redundant
3. **Predicts** which of their skills are declining/obsolete and which are rising
4. **Generates** a 3-phase personalized learning roadmap
5. **Provides** interactive charts: skill demand bars, trend lines, radar comparison, donut distribution
6. **Hosts** an AI chatbot (Claude or local NLP) that answers career questions with personalization
7. **Stores** everything per-user in MongoDB: chat history, analysis history, skill profile

Every user has isolated data — their chats, predictions, and skill profiles are stored separately in MongoDB under their user_id.
