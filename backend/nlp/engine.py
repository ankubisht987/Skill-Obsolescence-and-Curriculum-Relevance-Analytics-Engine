"""
nlp/engine.py

Enhanced NLP engine with:
- Skill ontology with aliases & trend data
- Typo-tolerant skill normalization
- Free-text skill extraction
- TF-IDF market scoring
- Cosine similarity
- Skill gap analysis
- Obsolescence prediction
- Local chatbot fallback
"""

from __future__ import annotations

import re
import math

from difflib import get_close_matches
from collections import Counter
from typing import List, Dict, Set, Tuple, Any


# ── Skill Ontology ────────────────────────────────────────────────────────

SKILL_ONTOLOGY: Dict[str, Dict] = {

    # AI / ML
    "Python": {
        "aliases": ["py", "python3", "python 3"],
        "category": "AI/ML",
        "trend": "stable"
    },

    "TensorFlow": {
        "aliases": ["tf", "tensorflow2"],
        "category": "AI/ML",
        "trend": "stable"
    },

    "PyTorch": {
        "aliases": ["torch", "pytorch"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "LLMs": {
        "aliases": ["large language models", "llm", "gpt"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "MLOps": {
        "aliases": ["ml ops", "modelops"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "RAG": {
        "aliases": ["retrieval augmented generation"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "Transformer Models": {
        "aliases": ["transformers", "attention mechanism"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "CUDA": {
        "aliases": ["gpu programming", "cuda toolkit"],
        "category": "AI/ML",
        "trend": "stable"
    },

    "RLHF": {
        "aliases": ["reinforcement learning from human feedback"],
        "category": "AI/ML",
        "trend": "rising"
    },

    "Edge AI": {
        "aliases": ["on-device ai", "tinyml"],
        "category": "AI/ML",
        "trend": "emerging"
    },

    "Vector DBs": {
        "aliases": ["vector database", "pinecone", "weaviate", "qdrant"],
        "category": "AI/ML",
        "trend": "rising"
    },

    # Frontend
    "React": {
        "aliases": ["reactjs", "react.js"],
        "category": "Frontend",
        "trend": "stable"
    },

    "TypeScript": {
        "aliases": ["ts", "typescript"],
        "category": "Frontend",
        "trend": "rising"
    },

    "Next.js": {
        "aliases": ["nextjs", "next"],
        "category": "Frontend",
        "trend": "rising"
    },

    "JavaScript": {
        "aliases": ["js", "es6", "es2015", "ecmascript"],
        "category": "Frontend",
        "trend": "stable"
    },

    "GraphQL": {
        "aliases": ["gql"],
        "category": "Frontend",
        "trend": "stable"
    },

    "Vue": {
        "aliases": ["vuejs", "vue.js", "vue3"],
        "category": "Frontend",
        "trend": "stable"
    },

    "WebAssembly": {
        "aliases": ["wasm"],
        "category": "Frontend",
        "trend": "emerging"
    },

    "Angular.js": {
        "aliases": ["angularjs", "angular js"],
        "category": "Frontend",
        "trend": "declining"
    },

    "jQuery": {
        "aliases": ["jquery"],
        "category": "Frontend",
        "trend": "declining"
    },

    # Backend
    "Java": {
        "aliases": ["java 17", "java 21"],
        "category": "Backend",
        "trend": "stable"
    },

    "Spring Boot": {
        "aliases": ["spring", "springboot"],
        "category": "Backend",
        "trend": "stable"
    },

    "Go": {
        "aliases": ["golang", "go lang"],
        "category": "Backend",
        "trend": "rising"
    },

    "Rust": {
        "aliases": ["rust-lang"],
        "category": "Backend",
        "trend": "rising"
    },

    "Node.js": {
        "aliases": ["nodejs", "node"],
        "category": "Backend",
        "trend": "stable"
    },

    "Microservices": {
        "aliases": [
            "micro services",
            "microservice architecture"
        ],
        "category": "Backend",
        "trend": "stable"
    },

    "Kafka": {
        "aliases": ["apache kafka"],
        "category": "Backend",
        "trend": "rising"
    },

    "gRPC": {
        "aliases": ["grpc", "protobuf"],
        "category": "Backend",
        "trend": "rising"
    },

    "FastAPI": {
        "aliases": ["fast api", "fastapi"],
        "category": "Backend",
        "trend": "rising"
    },

    # DevOps / Cloud
    "Kubernetes": {
        "aliases": ["k8s", "kube"],
        "category": "DevOps",
        "trend": "rising"
    },

    "Docker": {
        "aliases": ["containers", "containerization"],
        "category": "DevOps",
        "trend": "stable"
    },

    "Terraform": {
        "aliases": ["iac", "infrastructure as code"],
        "category": "DevOps",
        "trend": "rising"
    },

    "AWS": {
        "aliases": ["amazon web services", "amazon aws"],
        "category": "Cloud",
        "trend": "stable"
    },

    "Azure": {
        "aliases": ["microsoft azure"],
        "category": "Cloud",
        "trend": "stable"
    },

    "GCP": {
        "aliases": ["google cloud", "google cloud platform"],
        "category": "Cloud",
        "trend": "stable"
    },

    "CI/CD": {
        "aliases": [
            "cicd",
            "continuous integration",
            "github actions"
        ],
        "category": "DevOps",
        "trend": "stable"
    },

    "Helm": {
        "aliases": ["helm charts"],
        "category": "DevOps",
        "trend": "rising"
    },

    "OpenTelemetry": {
        "aliases": ["otel", "open telemetry"],
        "category": "DevOps",
        "trend": "rising"
    },

    # Data
    "SQL": {
        "aliases": ["mysql", "postgres", "postgresql", "sqlite"],
        "category": "Data",
        "trend": "stable"
    },

    "Spark": {
        "aliases": ["apache spark", "pyspark"],
        "category": "Data",
        "trend": "stable"
    },

    "dbt": {
        "aliases": ["data build tool"],
        "category": "Data",
        "trend": "rising"
    },

    "Airflow": {
        "aliases": ["apache airflow"],
        "category": "Data",
        "trend": "stable"
    },

    "Redshift": {
        "aliases": ["amazon redshift"],
        "category": "Data",
        "trend": "stable"
    },

    "Hadoop MapReduce": {
        "aliases": ["hadoop", "mapreduce"],
        "category": "Data",
        "trend": "declining"
    },

    # Security
    "Penetration Testing": {
        "aliases": ["pentest", "pen test", "ethical hacking"],
        "category": "Security",
        "trend": "rising"
    },

    "SOC2": {
        "aliases": ["soc 2", "soc2 compliance"],
        "category": "Security",
        "trend": "stable"
    },

    "Zero Trust": {
        "aliases": ["zero trust security"],
        "category": "Security",
        "trend": "rising"
    },

    # Legacy
    "Perl": {
        "aliases": [],
        "category": "Legacy",
        "trend": "declining"
    },

    "Subversion": {
        "aliases": ["svn"],
        "category": "Legacy",
        "trend": "declining"
    },

    "SOAP": {
        "aliases": ["soap api", "xml api"],
        "category": "Legacy",
        "trend": "declining"
    },

    "Flash": {
        "aliases": ["adobe flash", "flex"],
        "category": "Legacy",
        "trend": "declining"
    },

    "ColdFusion": {
        "aliases": ["coldfusion"],
        "category": "Legacy",
        "trend": "declining"
    },

    # Emerging
    "AI Agents": {
        "aliases": ["autonomous agents", "agentic ai"],
        "category": "Emerging",
        "trend": "emerging"
    },

    "GraphRAG": {
        "aliases": ["graph rag"],
        "category": "Emerging",
        "trend": "emerging"
    },

    "Mamba": {
        "aliases": [
            "mamba architecture",
            "state space models",
            "ssm"
        ],
        "category": "Emerging",
        "trend": "emerging"
    },

    "Mixture of Experts": {
        "aliases": ["moe", "mixture-of-experts"],
        "category": "Emerging",
        "trend": "emerging"
    },
}


TREND_WEIGHTS = {
    "rising": 1.4,
    "stable": 1.0,
    "declining": 0.35,
    "emerging": 1.7,
}

RISING_SKILLS = {
    k for k, v in SKILL_ONTOLOGY.items()
    if v["trend"] == "rising"
}

DECLINING_SKILLS = {
    k for k, v in SKILL_ONTOLOGY.items()
    if v["trend"] == "declining"
}

EMERGING_SKILLS = {
    k for k, v in SKILL_ONTOLOGY.items()
    if v["trend"] == "emerging"
}


STOP_WORDS = {
    "and","or","the","a","an","in","on","at","to","for",
    "of","with","by","is","are","was","were","be","been",
    "have","has","do","does","will","experience","years",
    "strong","good","knowledge","understanding","ability",
    "skills","required","preferred","plus","etc","including",
    "working","familiarity","proficiency","expertise",
    "background","exposure","solid","deep","proven",
}


# ── Tokenizer ─────────────────────────────────────────────────────────────

def tokenize(text: str) -> List[str]:

    tokens = re.split(
        r"[^a-zA-Z0-9\.\+\#]+",
        text.lower()
    )

    return [
        t for t in tokens
        if t
        and t not in STOP_WORDS
        and len(t) > 1
    ]


# ── Normalize Skill ───────────────────────────────────────────────────────

def normalize_skill(raw: str) -> str:

    if not raw:
        return ""

    sl = raw.lower().strip()

    noise_words = [
        "programming",
        "development",
        "developer",
        "experience",
        "knowledge",
        "working",
        "with",
        "using",
        "technology",
        "framework",
        "course",
        "in",
    ]

    for word in noise_words:
        sl = sl.replace(word, " ")

    sl = re.sub(r"\s+", " ", sl).strip()

    # Exact match
    for canonical, info in SKILL_ONTOLOGY.items():

        if sl == canonical.lower():
            return canonical

    # Alias match
    for canonical, info in SKILL_ONTOLOGY.items():

        for alias in info.get("aliases", []):

            alias_l = alias.lower()

            if (
                sl == alias_l
                or re.search(
                    r"\b" + re.escape(alias_l) + r"\b",
                    sl
                )
            ):
                return canonical

    # Typo matching
    all_terms = []
    reverse_map = {}

    for canonical, info in SKILL_ONTOLOGY.items():

        all_terms.append(canonical.lower())
        reverse_map[canonical.lower()] = canonical

        for alias in info.get("aliases", []):

            alias_l = alias.lower()

            all_terms.append(alias_l)
            reverse_map[alias_l] = canonical

    match = get_close_matches(
        sl,
        all_terms,
        n=1,
        cutoff=0.78
    )

    if match:
        return reverse_map[match[0]]

    return raw.strip().title()


# ── Parse User Skills ────────────────────────────────────────────────────

def parse_user_skills(text: str) -> List[str]:

    chunks = re.split(
        r"[,;/\n]| and | with | using ",
        text
    )

    found = []

    for chunk in chunks:

        chunk = chunk.strip()

        if not chunk:
            continue

        skill = normalize_skill(chunk)

        if skill and skill not in found:
            found.append(skill)

    return found


# ── Extract Skills ───────────────────────────────────────────────────────

def extract_skills_from_text(text: str) -> List[str]:

    found: Set[str] = set()

    tl = text.lower()

    for canonical, info in SKILL_ONTOLOGY.items():

        patterns = [canonical.lower()] + [
            a.lower()
            for a in info.get("aliases", [])
        ]

        for pat in patterns:

            if re.search(
                r"\b" + re.escape(pat) + r"\b",
                tl
            ):
                found.add(canonical)

    return sorted(found)


# ── TF-IDF Engine ────────────────────────────────────────────────────────

class TFIDFEngine:

    def __init__(self):

        self.idf: Dict[str, float] = {}
        self._N = 0

    def fit(self, documents: List[List[str]]):

        self._N = len(documents)

        all_terms = set(
            t for doc in documents
            for t in doc
        )

        for term in all_terms:

            df = sum(
                1 for doc in documents
                if term in doc
            )

            self.idf[term.lower()] = (
                math.log((self._N + 1) / (df + 1)) + 1
            )

        return self

    def score(self, term: str, document: List[str]) -> float:

        tf = document.count(term) / max(len(document), 1)

        idf = self.idf.get(term.lower(), 1.0)

        return tf * idf

    def market_score(
        self,
        skill: str,
        flat_corpus: List[str]
    ) -> float:

        freq = flat_corpus.count(skill)

        total = len(flat_corpus)

        tf = freq / max(total, 1)

        idf = math.log(
            (total + 1) / (max(freq, 1) + 1)
        ) + 1

        tfidf = tf * idf

        trend = SKILL_ONTOLOGY.get(
            skill,
            {}
        ).get("trend", "stable")

        weight = TREND_WEIGHTS.get(
            trend,
            1.0
        )

        return min(
            round((tfidf * 600 * weight) + (freq * 2.5), 2),
            100.0
        )


# ── Cosine Similarity ────────────────────────────────────────────────────

def cosine_similarity(
    a: Dict[str, float],
    b: Dict[str, float]
) -> float:

    keys = set(a) | set(b)

    dot = sum(
        a.get(k, 0) * b.get(k, 0)
        for k in keys
    )

    mag_a = math.sqrt(
        sum(v ** 2 for v in a.values())
    )

    mag_b = math.sqrt(
        sum(v ** 2 for v in b.values())
    )

    if mag_a == 0 or mag_b == 0:
        return 0.0

    return round(dot / (mag_a * mag_b), 4)


# ── Analyze Skills ───────────────────────────────────────────────────────

def analyze_skills(
    user_skills: List[str],
    job_records: List[Dict],
    target_role: str = "All",
    target_company: str = "All",
) -> Dict[str, Any]:

    relevant = [

        j for j in job_records

        if (
            target_role == "All"
            or j.get("role") == target_role
        )

        and (
            target_company == "All"
            or j.get("company") == target_company
        )
    ] or job_records

    all_required = list({

        s for j in relevant
        for s in j.get("skills", [])
    })

    flat_corpus = [

        s for j in relevant
        for s in j.get("skills", [])
    ]

    engine = TFIDFEngine().fit([
        j.get("skills", [])
        for j in relevant
    ])

    expanded = []

    for s in user_skills:
        expanded.extend(parse_user_skills(s))

    user_norm = list(set(expanded))

    user_set = {s.lower() for s in user_norm}

    req_set = {s.lower() for s in all_required}

    matched = [
        s for s in all_required
        if s.lower() in user_set
    ]

    missing = [
        s for s in all_required
        if s.lower() not in user_set
    ]

    redundant = [
        s for s in user_norm
        if s.lower() not in req_set
    ]

    match_score = round(
        len(matched) / max(len(all_required), 1) * 100,
        1
    )

    def build_entry(skill: str):

        score = engine.market_score(
            skill,
            flat_corpus
        )

        status = (

            "declining"
            if skill in DECLINING_SKILLS

            else "hot"
            if score > 60

            else "rising"
            if skill in RISING_SKILLS

            else "stable"
        )

        return {

            "skill": skill,
            "score": score,
            "status": status,
            "frequency": flat_corpus.count(skill)
        }

    scored_user = [
        build_entry(s)
        for s in user_norm
    ]

    scored_missing = sorted(
        [build_entry(s) for s in missing],
        key=lambda x: x["score"],
        reverse=True
    )

    top_miss = [
        m["skill"]
        for m in scored_missing[:5]
    ]

    new_rising = [
        s for s in RISING_SKILLS
        if s.lower() not in user_set
    ][:2]

    recommendations = [

        f"Top priority to learn: {top_miss[0]}"
        if top_miss
        else "Great coverage — deepen existing skills",

        f"Trending addition: {new_rising[0]}"
        if new_rising
        else "Keep current skills sharpened",

        f"Reduce focus on low-demand skill: {redundant[0]}"
        if redundant
        else "No redundant skills detected",
    ]

    return {

        "match_score": match_score,
        "matched": matched,
        "missing": scored_missing,
        "redundant": redundant,
        "scored_user": scored_user,
        "all_required": all_required,
        "recommendations": recommendations,
    }


# ── Predict Obsolescence ─────────────────────────────────────────────────

def predict_obsolescence(
    user_skills: List[str]
) -> Dict[str, Any]:

    expanded = []

    for s in user_skills:
        expanded.extend(parse_user_skills(s))

    user_norm = list(set(expanded))

    user_set = set(user_norm)

    obsolete = []
    relevant = []

    for skill in user_norm:

        trend = SKILL_ONTOLOGY.get(
            skill,
            {}
        ).get("trend", "stable")

        score = round(
            TREND_WEIGHTS.get(trend, 1.0) * 50,
            1
        )

        entry = {

            "skill": skill,
            "score": score,
            "status": trend,
            "frequency": 0
        }

        if trend == "declining":
            obsolete.append(entry)
        else:
            relevant.append(entry)

    roadmap = [

        {
            "phase": "Phase 1 — 0 to 3 months",
            "title": "Bridge Critical Gaps",
            "skills": [
                s for s in list(RISING_SKILLS)[:4]
                if s not in user_set
            ],
            "priority": "high",
        },

        {
            "phase": "Phase 2 — 3 to 6 months",
            "title": "High-Demand Specialisation",
            "skills": [
                s for s in list(RISING_SKILLS)[4:8]
                if s not in user_set
            ],
            "priority": "medium",
        },

        {
            "phase": "Phase 3 — 6 to 12 months",
            "title": "Future-Proof with Emerging Tech",
            "skills": list(EMERGING_SKILLS)[:5],
            "priority": "strategic",
        },
    ]

    return {

        "obsolete": obsolete,
        "relevant": relevant,
        "emerging": list(EMERGING_SKILLS),

        "gap_score": round(
            len(obsolete) / max(len(user_norm), 1) * 100,
            1
        ),

        "roadmap": roadmap,
    }


# ── Local Chatbot ────────────────────────────────────────────────────────

def generate_local_response(
    message: str,
    user_skills: List[str],
    job_data: List[Dict],
) -> str:

    msg = message.lower()

    u_set = {s.lower() for s in user_skills}

    analysis = analyze_skills(
        user_skills,
        job_data
    )

    # Company readiness
    if any(w in msg for w in [
        "google",
        "amazon",
        "microsoft",
        "meta",
        "apple",
        "ready",
        "interview"
    ]):

        company = next(

            (
                c for c in [
                    "Google",
                    "Amazon",
                    "Microsoft",
                    "Meta",
                    "Apple"
                ]

                if c.lower() in msg
            ),

            "top tech companies"
        )

        jobs = [
            j for j in job_data
            if j.get("company") == company
        ]

        req = list({

            s for j in jobs
            for s in j.get("skills", [])
        })

        miss = [
            s for s in req
            if s.lower() not in u_set
        ][:5]

        return (

            f"For {company}, your match score is "
            f"{analysis['match_score']}%.\n\n"

            f"You have: "
            f"{', '.join(analysis['matched'][:6]) or 'None'}\n\n"

            f"Missing: "
            f"{', '.join(miss) or 'Strong profile'}\n\n"

            f"Focus next on: "
            f"{miss[0] if miss else 'system design'}"
        )

    # Learn next
    if any(w in msg for w in [
        "learn",
        "next",
        "recommend",
        "suggest",
        "should i"
    ]):

        nxt = [

            s for s in list(RISING_SKILLS)

            if s.lower() not in u_set
        ][:5]

        return (

            "Based on market trends, learn:\n\n"

            + "\n".join(
                f"{i+1}. {s}"
                for i, s in enumerate(nxt)
            )
        )

    # Obsolete skills
    if any(w in msg for w in [
        "obsolete",
        "declining",
        "outdated",
        "dying",
        "old"
    ]):

        user_old = [

            s for s in user_skills

            if normalize_skill(s)
            in DECLINING_SKILLS
        ]

        warning = (

            f"\n\nWarning: {', '.join(user_old)} "
            f"may become obsolete."

            if user_old

            else "\n\nNo declining skills detected."
        )

        return warning

    # Salary
    if any(w in msg for w in [
        "salary",
        "pay",
        "compensation",
        "earn"
    ]):

        return (

            "2025 Tech Salary Benchmarks:\n\n"

            "AI/ML Engineer: $160k – $280k\n"
            "Backend Engineer: $130k – $220k\n"
            "Frontend Engineer: $120k – $200k\n"
            "DevOps Engineer: $140k – $230k\n"
            "Security Engineer: $150k – $250k\n\n"

            "Highest premium skills:\n"
            "LLMs, Rust, Kubernetes, System Design"
        )

    # Default
    return (

        f"Your market match score is "
        f"{analysis['match_score']}%.\n\n"

        f"Top skills to add:\n"

        + ", ".join(
            m["skill"]
            for m in analysis["missing"][:4]
        )
    )