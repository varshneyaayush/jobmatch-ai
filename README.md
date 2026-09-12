# JobMatch AI — Your career. Matched intelligently.

JobMatch AI is a production-grade, AI-powered Job Portal and Resume Matching Platform connecting job seekers with high-impact tech opportunities using real NLP/ML resume parsing, TF-IDF vectorization, Cosine Similarity, and dynamic skill ontology matching.

---
## 🚀 Live Demo

- 🌐 **Frontend:** https://jobmatch-ai-gaek.vercel.app/
- ⚡ **Backend API:** https://jobmatch-ai-snowy.vercel.app/
- ❤️ **API Health:** https://jobmatch-ai-snowy.vercel.app/api/health

## 🌟 Core Features

### 1. 3D Career Matching Experience
- **Interactive Three.js / React Three Fiber Hero Scene**: Abstract glowing AI core with orbiting career entities (*Resume, Skills, Job, Experience, Education, Match Score*), smooth mouse parallax, and dynamic lighting.
- **Cinematic Dark Glass Design**: Dark obsidian palette (`#07080D`), liquid-glass surfaces (`backdrop-blur-xl`), cyan neon accents (`#00F0FF`), and fluid Framer Motion animations.

### 2. Multi-Stage Real Resume Parser & NLP Engine
- **PyMuPDF & python-docx Parser**: Extracts structured plain text from PDF and DOCX files without data loss.
- **Entity & Skill Detection**: Matches against an indexed knowledge base of 500+ tech skills across AI/ML, Frontend, Backend, Databases, and Cloud/DevOps.
- **Resume Score Calculation (0–100)**: Objectively evaluates technical skill depth, seniority trajectory, degree credentials, and ATS readability.

### 3. Dynamic AI Job Matching Engine
- **No Hardcoded Scores**: Uses genuine Scikit-Learn TF-IDF vectorization with n-grams and Cosine Similarity combined with Jaccard Skill Overlap.
- **Explainable Match Breakdown**:
  - Matched Skills checkmarks (✓)
  - Missing Skills gap indicators (×)
  - Experience Alignment & Education Compatibility metrics
  - Overall Compatibility Level (*Excellent, Strong, Moderate, Potential Fit*)

### 4. Candidate Experience
- **Personalized Recommendations**: Automatically sorted by highest calculated AI Match %.
- **1-Click Applications & Tracking**: Live application status pipeline (*Applied → Under Review → Shortlisted → Interview → Selected / Rejected*).
- **Skill Gap Insights**: Actionable recommendations for technical advancement.

### 5. Recruiter Talent Hub
- **Job Creation & Posting**: Define requirements, salary bands, and mandatory skill tags.
- **AI Candidate Ranking**: Automatically ranks applicants for any job by their computed match score (e.g. *1. Candidate A — 94%, 2. Candidate B — 89%*).
- **Pipeline Stage Management**: Shortlist, reject, or advance candidates with internal recruiter notes.

### 6. Admin Governance Portal
- **Platform Analytics**: Total users, candidates, recruiters, active jobs, submitted applications, and system average match rate.
- **Content & Account Moderation**: Manage user roles and remove inappropriate job postings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Three.js, `@react-three/fiber`, `@react-three/drei`, Lucide Icons, Axios |
| **Backend** | Python 3.14, FastAPI, Uvicorn, Pydantic, Jose JWT, Bcrypt |
| **Database** | SQLite + SQLAlchemy ORM |
| **AI / NLP** | Scikit-learn, Pandas, NumPy, TF-IDF Vectorizer, Cosine Similarity, PyMuPDF, python-docx |

---

## 🚀 Running Locally

Both services are pre-configured and running live:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Start Commands (if restarting):

```bash
# 1. Start FastAPI Backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Start Vite Frontend
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

---

## 🔑 Pre-Seeded Demo Accounts

You can log in instantly using the **"Demo Switcher"** in the top navbar or with the following credentials:

| Role | Name | Email | Password |
|---|---|---|---|
| **Job Seeker (Candidate)** | Alex Mercer (AI Engineer) | `alex.mercer@jobmatch.ai` | `password123` |
| **Job Seeker (Candidate)** | Sophia Chen (Full Stack) | `sophia.chen@jobmatch.ai` | `password123` |
| **Recruiter** | Sarah Jenkins (TechPulse AI) | `sarah.recruiter@techpulse.ai` | `password123` |
| **Recruiter** | David Vance (CloudSphere) | `david.recruiter@cloudsphere.io` | `password123` |
| **Admin** | Admin Lead | `admin@jobmatch.ai` | `password123` |

---

## 📡 API Overview

- `POST /api/auth/register` — Register new user (`job_seeker`, `recruiter`, `admin`)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/demo-login` — 1-click instant demo login
- `POST /api/resume/upload` — Parse PDF/DOCX and compute resume score
- `POST /api/resume/load-sample` — Load pre-formatted sample resume
- `GET  /api/resume/analysis` — Get candidate resume analysis & strengths
- `GET  /api/jobs` — Search and filter jobs with personalized AI match scores
- `POST /api/jobs` — Create job requisition (Recruiter)
- `POST /api/matching/resume-job` — Run real-time match between resume and job
- `GET  /api/matching/recommendations` — Top AI recommendations for candidate
- `POST /api/applications` — Submit job application with cover note
- `GET  /api/applications/job/{id}/candidates` — AI candidate ranking for recruiter
- `PUT  /api/applications/{id}/status` — Update applicant status
- `GET  /api/admin/stats` — Platform analytics & overview
