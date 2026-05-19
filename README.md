# ⚡ SkillEngine — Skill Obsolescence & Curriculum Relevance Analytics Engine

<div align="center">

![Version](https://img.shields.io/badge/version-2.5.0-gold)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8)

**An AI-powered platform that tells you which skills are dying, which are rising, and exactly what you need to learn next.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Docs](#-api-reference) · [Database](#-database-design) · [Screenshots](#-screenshots)

</div>

---

## 🎯 What Is This?

SkillEngine analyzes real job market data to give developers, students, and professionals a clear picture of where their skills stand. Upload job listings from companies like Google, Amazon, and Microsoft — the NLP engine scores every skill using **TF-IDF**, identifies gaps, predicts obsolescence, and generates a personalized learning roadmap.

Think of it as a **career GPS** — it knows where you are, where the market is going, and the fastest route between the two.

---

## ✨ Features

### 🏠 Dashboard
- Live job listings filtered by company and role
- Skill demand bar chart and 6-month trend line
- Company skill maps (Google, Amazon, Microsoft, Meta, Apple, etc.)
- Rising vs. declining skill panels
- Demand scores with year-over-year comparison

### 🧪 Skill Gap Analyzer
- Paste your skills → instant TF-IDF market analysis
- Match score gauge (0–100%)
- Gap analysis: matched skills, missing skills, low-demand skills
- Per-skill score with progress bars
- 3-phase personalized learning roadmap
- Obsolescence predictions per skill

### 📂 Dataset Manager
- Drag-and-drop JSON or CSV upload
- NLP preprocessing pipeline (tokenize → extract → score → index)
- File preview before saving
- Format guide with examples

### 📈 Market Intelligence
- Skill category donut chart (rising / stable / declining / emerging)
- Company demand horizontal bar chart
- 18-month skill trajectory line chart
- Obsolescence tracker with replacement suggestions
- Emerging tech radar (2025–2026)

### 🤖 AI Career Advisor
- Full chat interface (like ChatGPT)
- Powered by **Claude Sonnet API** → falls back to local NLP
- Context-aware (knows your skills and history)
- Suggestion pills for quick questions
- Per-user chat history stored in MongoDB

### 👤 User System
- JWT authentication (register / login)
- Per-user skill profile
- Analysis history with match scores
- Chat history saved to MongoDB

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA with component-based UI |
| **Styling** | Tailwind CSS 3 | Utility-first dark theme |
| **Charts** | Recharts | Bar, Line, Radar, Donut charts |
| **HTTP Client** | Axios | API calls with JWT interceptors |
| **Routing** | React Router v6 | Client-side navigation |
| **Backend** | FastAPI (Python 3.11) | REST API + async endpoints |
| **Server** | Uvicorn | ASGI server |
| **Database** | MongoDB 7 + Motor | Async document storage |
| **Auth** | JWT (python-jose) + bcrypt | Secure token-based auth |
| **NLP** | Custom TF-IDF engine | Skill scoring + gap analysis |
| **AI Chat** | Anthropic Claude API | Conversational career advisor |
| **File Upload** | python-multipart | JSON/CSV ingestion |

---

## 📁 Project Structure

```
skillengine/
│
├── backend/                          # Python FastAPI server
│   ├── main.py                       # App entry point, CORS, router registration
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (edit this)
│   │
│   ├── database/
│   │   ├── __init__.py
│   │   └── connection.py             # Motor async MongoDB driver + index creation
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py                # All Pydantic v2 request/response schemas
│   │
│   ├── nlp/
│   │   ├── __init__.py
│   │   └── engine.py                 # TF-IDF engine, skill ontology, chatbot NLP
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                   # /auth/register, /auth/login, /auth/me
│   │   ├── jobs.py                   # /jobs/upload, /jobs/, /jobs/companies
│   │   ├── skills.py                 # /skills/analyze, /skills/predict, /skills/trends
│   │   ├── chat.py                   # /chat/message, /chat/history
│   │   └── user.py                   # /user/data, /user/skills, /user/stats
│   │
│   └── services/
│       ├── __init__.py
│       └── auth_service.py           # hash_password, verify_password, JWT create/decode
│
├── frontend/                         # React + Tailwind SPA
│   ├── index.html                    # HTML entry (Google Fonts: Syne + JetBrains Mono)
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite + /api proxy to backend
│   ├── tailwind.config.js            # Custom dark color palette
│   ├── postcss.config.js
│   │
│   └── src/
│       ├── main.jsx                  # React root, BrowserRouter, AuthProvider, Toaster
│       ├── App.jsx                   # Routes: public (login/register) + protected
│       ├── index.css                 # Tailwind layers + custom component classes
│       │
│       ├── context/
│       │   └── AuthContext.jsx       # Global auth state, session restore, updateUser
│       │
│       ├── services/
│       │   └── api.js                # Axios instance + authAPI, jobsAPI, skillsAPI, chatAPI, userAPI
│       │
│       ├── hooks/
│       │   └── useApi.js             # useApi(fn) → {data, loading, error, execute}
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   └── Layout.jsx        # Collapsible sidebar + <Outlet />
│       │   ├── ui/
│       │   │   ├── PageHeader.jsx    # Title + subtitle + actions
│       │   │   ├── StatCard.jsx      # Metric card with label/value/change
│       │   │   ├── SkillBadge.jsx    # Color-coded status badges
│       │   │   ├── ProgressBar.jsx   # Animated bar with auto color
│       │   │   └── Loader.jsx        # Spinner, Dots, full-page Loader
│       │   └── charts/
│       │       ├── DemandBarChart.jsx   # Top skills bar chart
│       │       ├── TrendLineChart.jsx   # 6-month demand lines
│       │       ├── SkillRadarChart.jsx  # User vs market radar
│       │       └── DonutChart.jsx       # Skill category distribution
│       │
│       └── pages/
│           ├── LoginPage.jsx         # Login + demo account
│           ├── RegisterPage.jsx      # Registration
│           ├── Dashboard.jsx         # Home — charts, companies, jobs table
│           ├── AnalyzePage.jsx       # TF-IDF analyzer + tabs + roadmap
│           ├── DatasetPage.jsx       # File upload + preview + format guide
│           ├── InsightsPage.jsx      # Market analytics + obsolescence tracker
│           ├── ChatPage.jsx          # AI chat with Claude + NLP fallback
│           └── ProfilePage.jsx       # Skills manager + history
│
├── sample_dataset.json               # 20 job listings to get started
├── jobs_100.csv                      # 100 job listings CSV dataset
└── SETUP.md                          # Detailed setup instructions
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| MongoDB | 7.0+ | [mongodb.com](https://mongodb.com) or Atlas |

---

### Step 1 — Start MongoDB

**Local:**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu
sudo apt-get install -y mongodb && sudo systemctl start mongod

# Windows — download from mongodb.com/try/download/community
```

**Cloud (MongoDB Atlas — recommended):**
1. Create free account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free **M0 cluster**
3. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net`
4. Whitelist your IP address

---

### Step 2 — Backend Setup

```bash
# Clone or unzip the project
cd skillengine/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.local
nano .env                        # Edit with your values
```

**Edit `.env`:**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=skillengine
JWT_SECRET=your-very-long-random-secret-here-min-32-chars
JWT_EXPIRE_DAYS=7
ANTHROPIC_API_KEY=sk-ant-api03-...        # Optional — enables real AI chat
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

```bash
# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **API running at:** `http://localhost:8000`
✅ **Swagger docs at:** `http://localhost:8000/docs`
✅ **Health check:** `http://localhost:8000/health`

---

### Step 3 — Frontend Setup

```bash
cd skillengine/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ **App running at:** `http://localhost:5173`

> Vite automatically proxies all `/api/*` requests to `http://localhost:8000` — no manual config needed.

---

### Step 4 — Load Sample Data

1. Register an account at `http://localhost:5173/register`
2. Go to **Datasets** page
3. Drag and drop `sample_dataset.json` or `jobs_100.csv`
4. Click **Upload** — data is processed and stored in MongoDB

**Or via curl:**
```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpass"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Upload dataset
curl -X POST http://localhost:8000/jobs/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample_dataset.json"
```

---

## 🗄 Database Design

### Collection: `users`
```json
{
  "_id": "ObjectId",
  "name": "Ankush Sharma",
  "email": "ankush@example.com",
  "password": "$2b$12$bcrypt_hash_here",
  "skills": ["Python", "React", "SQL", "Docker"],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-05-19T08:00:00Z"
}
```

### Collection: `jobs`
```json
{
  "_id": "ObjectId",
  "company": "Google",
  "role": "ML Engineer",
  "skills": ["Python", "PyTorch", "LLMs", "MLOps", "Kubernetes"],
  "demand": 97,
  "yoy": 18,
  "location": "Mountain View CA",
  "salary_min": 180000,
  "salary_max": 320000,
  "created_at": "2025-05-19T00:00:00Z"
}
```

### Collection: `chats`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId string",
  "role": "user",
  "content": "Am I ready for a Google SDE role?",
  "created_at": "2025-05-19T10:00:00Z"
}
```

### Collection: `predictions`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId string",
  "skills": ["Python", "React", "SQL"],
  "target_role": "AI/ML Engineer",
  "result": {
    "match_score": 65.0,
    "matched": ["Python"],
    "missing": [
      { "skill": "PyTorch", "score": 78.2, "status": "rising", "frequency": 8 }
    ],
    "redundant": [],
    "recommendations": ["Learn PyTorch", "Add Kubernetes"]
  },
  "created_at": "2025-05-19T10:01:00Z"
}
```

### Collection: `skills`
```json
{
  "_id": "ObjectId",
  "name": "PyTorch",
  "trend": "rising",
  "demand_score": 88.5,
  "updated_at": "2025-05-19T00:00:00Z"
}
```

**Indexes created on startup:**
- `users.email` → unique
- `jobs.(company, role)` → compound
- `jobs.(skills, role, company)` → text search
- `chats.(user_id, created_at)` → per-user ordering
- `predictions.(user_id, created_at)` → per-user ordering

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/auth/register` | `{name, email, password}` | `{message}` |
| `POST` | `/auth/login` | `{email, password}` | `{access_token, user}` |
| `GET` | `/auth/me` | — *(Bearer token)* | `{id, name, email, skills}` |

### Jobs

| Method | Endpoint | Notes |
|---|---|---|
| `POST` | `/jobs/upload` | `multipart/form-data` · accepts `.json` or `.csv` |
| `GET` | `/jobs/` | Query: `company`, `role`, `skip`, `limit` |
| `GET` | `/jobs/companies` | Returns distinct company list |
| `GET` | `/jobs/roles` | Returns distinct role list |
| `GET` | `/jobs/{id}` | Single job by MongoDB ObjectId |
| `DELETE` | `/jobs/{id}` | Auth required |

### Skills

| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/skills/analyze` | `{user_skills[], target_role, target_company}` | `AnalysisResult` |
| `POST` | `/skills/predict` | `{user_skills[]}` | `PredictionOut` |
| `GET` | `/skills/trends` | — | `{rising[], stable[], declining[], emerging[]}` |
| `GET` | `/skills/top` | Query: `limit=20` | `[{skill, count}]` |

### Chat

| Method | Endpoint | Notes |
|---|---|---|
| `POST` | `/chat/message` | `{message}` → calls Claude API, falls back to local NLP |
| `GET` | `/chat/history` | Returns last 100 messages for current user |
| `DELETE` | `/chat/history` | Clears all messages |

### User

| Method | Endpoint | Notes |
|---|---|---|
| `GET` | `/user/data` | Full profile + last 20 predictions + last 50 chats |
| `PUT` | `/user/skills` | `{skills[]}` → normalizes via ontology |
| `GET` | `/user/stats` | `{total_predictions, total_chats, skills_tracked, total_jobs}` |
| `DELETE` | `/user/account` | Deletes user + all associated data |

---

## 🧠 NLP Engine

The NLP pipeline lives in `backend/nlp/engine.py`.

### How Skill Scoring Works

```
User Input: "Python, React, SQL, Docker"
           ↓
Tokenize → normalize → match against 50+ skill ontology
           ↓
TF-IDF Score = (term_freq / corpus_size) × log((N+1)/(df+1)+1)
           ↓
Trend Weight × score  →  rising ×1.4 | stable ×1.0 | declining ×0.35 | emerging ×1.7
           ↓
Market Score 0–100  →  compared against all job listings
           ↓
Gap Analysis: matched ∩ required | missing = required - user | redundant = user - required
```

### Skill Ontology Categories

| Category | Example Skills |
|---|---|
| AI/ML | Python, PyTorch, TensorFlow, LLMs, MLOps, RLHF, RAG |
| Frontend | React, TypeScript, Next.js, GraphQL, WebAssembly |
| Backend | Java, Go, Rust, Node.js, Spring Boot, FastAPI, gRPC |
| DevOps | Kubernetes, Docker, Terraform, CI/CD, Helm, OpenTelemetry |
| Cloud | AWS, Azure, GCP |
| Data | SQL, Spark, dbt, Airflow, Redshift |
| Security | Penetration Testing, Zero Trust, SOC2, PKI |
| Emerging | AI Agents, GraphRAG, Mamba / SSM, Mixture of Experts |
| Legacy | jQuery, Perl, Subversion, SOAP, Hadoop MapReduce |

### Chat Response Cascade

```
User sends message
      ↓
Does ANTHROPIC_API_KEY exist?
   YES → Call Claude Sonnet with system context (name + skills + market data)
   NO  → Rule-based NLP matching
      ↓
Save both messages to MongoDB chats collection
      ↓
Return {reply, source: "anthropic" | "local"}
```

---

## 📊 CSV Dataset Format

For uploading via the Datasets page:

```csv
"company","role","skills","demand","yoy","location","salary_min","salary_max"
"Google","ML Engineer","Python,PyTorch,LLMs,MLOps",97,18,"Mountain View CA",180000,320000
"Amazon","Backend Engineer","Java,AWS,Kafka,Microservices",92,12,"Seattle WA",150000,265000
```

**Required columns:** `company`, `role`, `skills`
**Optional columns:** `demand`, `yoy`, `location`, `salary_min`, `salary_max`

> Skills in the CSV must be **comma-separated within quotes** — the backend splits on commas and normalizes each skill against the ontology.

---

## 🏗 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output: frontend/dist/ — serve with nginx or any static host
```

### Run Backend in Production
```bash
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Checklist
- [ ] Change `JWT_SECRET` to a long random string (32+ chars)
- [ ] Set `MONGO_URL` to your Atlas connection string
- [ ] Set `ANTHROPIC_API_KEY` for real AI chat
- [ ] Update `CORS_ORIGINS` to your production domain
- [ ] Enable MongoDB Atlas IP whitelist for your server

---

## 🔧 Development Commands

```bash
# Backend
uvicorn main:app --reload --port 8000    # Dev server with hot reload
python -m pytest tests/                  # Run tests (if added)

# Frontend
npm run dev        # Dev server at :5173
npm run build      # Production build
npm run preview    # Preview production build locally
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

free for personal and commercial use.

---

## 👨‍💻 Author

Ankush Bisht: Built with ❤️ using **FastAPI**, **React**, **MongoDB**, and **GROQ_API**.

---

<div align="center">
<strong>SkillEngine v2.5</strong> · Know your market value · Stay ahead of the curve
</div>
