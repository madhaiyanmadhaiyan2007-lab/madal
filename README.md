# MockMate AI 🎙️🤖

> **MockMate AI** is a multilingual (**English + Tamil தமிழ்**) AI-powered Mock Interview Coach with real-time speech analytics, 4-dimension answer evaluation, client-side body language tracking, and comprehensive progress reports.

---

## 🌟 Key Features

### 1. 🌐 Multilingual AI Interview Engine (Phases 1–4)
- **Role Support**: Software Developer (Technical), Data Analyst (Analytics), and HR / Behavioral (STAR methodology).
- **Dual Language**: Complete English and Tamil (**தமிழ்**) question synthesis and Text-to-Speech (TTS) readout.
- **Dynamic 5-Question Generation**: Contextual mix of technical fundamentals and situational questions generated via LLMs.

### 2. 🎙️ Faster-Whisper Speech & Fluency Analytics (Phase 5)
- High-accuracy audio transcription supporting English and Tamil scripts.
- **Cadence & Speed**: Automatic Words-Per-Minute (WPM) detection with optimal target bands (120–160 WPM).
- **Vocal Filler Detection**: Identifies `"um"`, `"uh"`, `"like"`, `"you know"`, and related filler tokens.
- **Pause Detection**: Quantifies hesitation and dead air (>2.0 second silent intervals).

### 3. 🧠 4-Dimension AI Answer Evaluation (Phase 6)
- **🎯 Relevance**: Alignment with question intent and clarity of thesis.
- **🏗️ Structure**: Organization, logical progression, and STAR methodology.
- **💡 Depth**: Domain concepts, precision, accuracy, and technical details.
- **🗣️ Communication**: Articulation, professional tone, and delivery.
- **📖 AI Model Answers**: Tailored sample responses provided in the candidate's chosen language.

### 4. 👁️ Client-Side MediaPipe Body Language Analytics (Phase 7)
- Real-time privacy-first in-browser posture detection (**NO video stream transmitted to server**).
- **Metrics Tracked**: Eye contact percentage with camera lens, head tilt stability, smiling expressions, and face visibility ratio.

### 5. 📊 Comprehensive Performance Reports & Progress (Phase 8)
- **30-40-30 Composite Scoring**:
  $$\text{Overall Score} = (0.30 \times \text{Speech}) + (0.40 \times \text{Answer Quality}) + (0.30 \times \text{Body Language})$$
- **Recharts Data Visualizations**:
  - Bar chart for vocal filler word frequency distribution.
  - Multi-line progress chart tracking score trajectory over past sessions.
- **Actionable AI Feedback**: Highlighted strengths, prioritized improvement tips, and per-question accordion breakdown.
- **Export / Print**: Clean printable scorecard layout.

---

## 🏗️ Architecture & Technology Stack

```text
[ React 19 + Vite + Tailwind + Recharts ]
                  │
                  ▼ (JWT Bearer Token / HTTPS / FormData)
[ FastAPI Backend (Python 3.11) ]
      ├── /auth          ──► [ PostgreSQL Database (SQLAlchemy) ]
      ├── /interviews    ──► [ LLM Engine (Gemini / OpenAI) ]
      └── /answers       ──► [ Faster-Whisper (FFmpeg STT Engine) ]
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, MediaPipe Vision |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Database** | PostgreSQL, SQLAlchemy ORM, psycopg2-binary |
| **AI & Speech** | Faster-Whisper (CTranslate2), Gemini / OpenAI API, Browser SpeechSynthesis |
| **Authentication** | Passlib (bcrypt), PyJWT (Bearer Token Auth) |
| **DevOps & Deploy** | Docker, Render Blueprint, Vercel SPA Config |

---

## 📁 Project Structure

```text
mock ai interview/
├── backend/
│   ├── routers/
│   │   ├── auth.py              # /auth/signup, /auth/login, /auth/me
│   │   ├── interviews.py        # POST /interviews/start, GET /history, GET /{id}/report
│   │   └── answers.py           # POST /answers/upload (Whisper + LLM + Body Language)
│   ├── services/
│   │   ├── llm_service.py       # LLM question generation & 4-dimension answer scoring
│   │   └── whisper_service.py   # Faster-Whisper transcription & speech metrics
│   ├── uploads/
│   │   └── audio/               # Candidate audio recordings (gitignored)
│   ├── auth.py                  # JWT authentication & bcrypt hashing
│   ├── database.py              # SQLAlchemy engine & health check
│   ├── models.py                # PostgreSQL ORM entities (User, Interview, Question, Answer)
│   ├── schemas.py               # Pydantic data contracts
│   ├── main.py                  # FastAPI application entry point
│   ├── requirements.txt         # Backend Python dependencies
│   ├── Dockerfile               # Production container definition (Python 3.11 + FFmpeg)
│   ├── render.yaml              # Render cloud infrastructure blueprint
│   ├── .dockerignore
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Centralized fetch client (Auth, Interviews, Reports)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Candidate authentication & token provider
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx    # Candidate authentication
│   │   │   ├── SignupPage.jsx   # Candidate registration
│   │   │   ├── DashboardPage.jsx# Role launcher, past sessions list & Recharts progress line chart
│   │   │   ├── InterviewPage.jsx# Video studio, audio recording, TTS & live evaluation
│   │   │   └── ReportPage.jsx   # Phase 8 30-40-30 scorecards, filler chart & deep dive
│   │   ├── App.jsx              # Main view manager & system health monitor
│   │   ├── index.css            # Tailwind directives
│   │   └── main.jsx
│   ├── vercel.json              # Vercel SPA routing & security headers
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v20/v22/v25)
- **Python**: v3.10+ (tested on Python 3.11–3.13)
- **FFmpeg**: Installed and available in PATH (required for Whisper audio decoding)
- **PostgreSQL**: Running instance on port 5432 (or configure `DATABASE_URL` in `backend/.env`)

---

### Step 1: Run Backend (FastAPI)

```powershell
cd backend

# 1. Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On macOS/Linux: source venv/bin/activate

# 2. Install requirements
pip install -r requirements.txt

# 3. Configure environment variables
copy .env.example .env        # On macOS/Linux: cp .env.example .env

# 4. Start FastAPI server
uvicorn main:app --reload --port 8000
```

- **API Server**: `http://localhost:8000`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### Step 2: Run Frontend (React + Vite + Tailwind + Recharts)

```powershell
cd frontend

# 1. Install NPM dependencies
npm install

# 2. Start Vite development server
npm run dev
```

- **Candidate UI**: `http://localhost:5173`

---

## ☁️ Production Deployment Guide

### Option A: Deploy Backend on Render

1. Create a free account at [Render.com](https://render.com).
2. Connect your Git repository.
3. Choose **Blueprint** and select `backend/render.yaml`, or create a **Web Service**:
   - **Environment**: `Docker`
   - **Docker Context**: `./backend`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Health Check Path**: `/health`
4. Set the following Environment Variables in the Render dashboard:
   - `DATABASE_URL`: PostgreSQL connection string (e.g. from Render Managed PostgreSQL).
   - `JWT_SECRET_KEY`: Random 64-character secret key.
   - `ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g. `https://your-mockmate-app.vercel.app`).
   - `GEMINI_API_KEY` or `OPENAI_API_KEY`: API key for question generation & evaluations.
   - `WHISPER_MODEL_SIZE`: `small` (or `base`).

---

### Option B: Deploy Frontend on Vercel

1. Create an account at [Vercel.com](https://vercel.com).
2. Import your repository and set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` | Output Directory: `dist`.
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-mockmate-backend.onrender.com`
6. Click **Deploy**. Vercel will automatically configure SPA rewrites via `frontend/vercel.json`.

---

## 📡 Key API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/signup` | Register new candidate account | ❌ |
| `POST` | `/auth/login` | Login and receive JWT bearer token | ❌ |
| `GET` | `/auth/me` | Fetch authenticated candidate profile | ✅ |
| `GET` | `/health` | Server & PostgreSQL connection health | ❌ |
| `POST` | `/interviews/start` | Synthesize 5 LLM questions for target role | ✅ |
| `GET` | `/interviews/history` | Chronological session list for trend charting | ✅ |
| `GET` | `/interviews/{id}/report` | Calculate 30-40-30 composite report | ✅ |
| `POST` | `/answers/upload` | Upload audio answer for Whisper STT & AI scoring | ✅ |

---

## 📸 Application Walkthrough & UI Highlights

```text
+-------------------------------------------------------------------------------+
| MockMate AI 🎙️🤖                    System Health: ● Healthy [Candidate Profile]
+-------------------------------------------------------------------------------+
|
|  [ 📊 Candidate Dashboard ]
|  ├── 📈 Performance Progress Trend (Recharts Line Chart: Overall / Speech / Quality)
|  ├── 📋 Past Interview Sessions & One-Click "View Report" Action
|  └── 🚀 Launcher: Select Target Role (Dev/Data/HR) & Language (English/Tamil)
|
|  [ 🎙️ Live Interview Studio ]
|  ├── 🤖 AI Question Display with Text-to-Speech (TTS) Voice Readout
|  ├── 📹 Live Webcam Video Feed with Face & Eye Contact Feedback
|  ├── 🎙️ Real-Time Audio Recorder with Duration & Volume Waveform
|  └── ⚡ Instant Whisper STT Transcription + 4-Dimension AI Scorecard
|
|  [ 📑 Comprehensive Performance Report (Phase 8) ]
|  ├── 🏆 30% Speech + 40% Answer Quality + 30% Body Language Weighted Score Cards
|  ├── 📊 Vocal Filler Word Frequency Bar Chart (Recharts)
|  ├── 💡 Prioritized AI Improvement Tips & Actionable Strengths/Weaknesses
|  └── 🔍 Question-by-Question Deep Dive with AI Improved Model Answers
+-------------------------------------------------------------------------------+
```

---

## 🛡️ Privacy & Security Design
- **Zero Video Storage**: Video frames are analyzed locally in the candidate's browser via MediaPipe WebAssembly. Only lightweight numeric percentages (`eye_contact_pct`, `head_tilt_pct`, `smile_pct`) are transmitted.
- **Secure Authentication**: Passwords hashed with `bcrypt` (work factor 12) and API authenticated via short-lived JWT Bearer tokens.
- **CORS Protection**: Restricted to configured origins.

---

## 📄 License
MIT &copy; 2026 MockMate AI. Built for candidates worldwide to master technical and behavioral interviews.
#   m a d a l  
 