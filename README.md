# JobMatchr

JobMatchr is an AI-powered resume-to-job matching platform that helps users discover relevant job opportunities based on their skills, experience, certifications, and projects.

The platform uses:
- Gemini AI for resume analysis
- JSearch API for live Indian job listings
- An intelligent matching engine for personalized recommendations

---

# Features

## AI Resume Analysis
- Extracts technical skills
- Detects experience level
- Identifies certifications
- Analyzes projects
- Generates ATS score
- Suggests suitable job roles

---

## Live Job Matching
- Fetches real-time Indian job listings
- Calculates AI-based match percentages
- Provides direct application links
- Ranks jobs based on relevance

---

## Match Insights
- Displays why a job matches
- Shows missing skills
- Provides skill-gap recommendations
- Generates resume insights

---

## Freemium Model

### Free Users
- Unlimited resume uploads
- Access to top 5 matching jobs

### Premium Users
- Unlimited job visibility
- Resume optimization
- ATS analysis
- Skill-gap analysis
- Advanced AI insights

---

# Tech Stack

## Frontend
- Next.js
- Tailwind CSS
- TypeScript
- Framer Motion

## Backend
- FastAPI (Python)

## AI
- Gemini API

## Job Data
- JSearch API

## Database
- PostgreSQL

## Cache
- Redis

---

# Project Structure

```bash
JobMatchr/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── pages/
│   └── styles/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── resume_parser.py
│   ├── gemini_service.py
│   ├── job_fetcher.py
│   ├── matcher.py
│   ├── cache_service.py
│   └── main.py
│
├── README.md
├── .gitignore
└── requirements.txt
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/JobMatchr.git
```

```bash
cd JobMatchr
```

---

# Backend Setup

## Create Virtual Environment

```bash
python -m venv venv
```

Activate environment:

### Mac/Linux
```bash
source venv/bin/activate
```

### Windows
```bash
venv\\Scripts\\activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Environment Variables

Create:

```bash
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
JSEARCH_API_KEY=your_jsearch_api_key
```

---

# Run Backend

```bash
uvicorn main:app --reload
```

---

# Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# Resume Processing Flow

```text
Upload Resume
↓
Extract Resume Text
↓
Gemini AI Analysis
↓
Generate Structured Resume Data
↓
Fetch Jobs from JSearch API
↓
Calculate Match Scores
↓
Display Ranked Jobs
```

---

# Match Score Logic

```text
Match Score =
(Matched Skills / Total Job Skills) × 100
```

---

# Security

- Resumes are not permanently stored
- Temporary session-based processing
- Secure backend API handling
- Environment variables protected using .env

---

# Future Enhancements

- AI Resume Optimization
- Skill-gap Learning Recommendations
- Smart Job Alerts
- Chrome Extension
- Recruiter Dashboard
