# VendorLock 🔒
**AI Trade Intelligence Platform for FMCG & HORECA Distribution**

> A chat-first AI platform that turns every order, payment, scheme, visit and dispute in India's FMCG and HORECA supply chains into structured intelligence — CIBIL-style trust scores, scheme leakage detection, ghost visit alerts, and proactive risk management.

---

## Project Structure

```
VendorLock/                    ← Backend root (FastAPI)
├── main.py                    ← FastAPI app entry point
├── run.py                     ← Dev server launcher
├── requirements.txt           ← All Python dependencies
├── .env.example               ← Environment variable template
├── Dockerfile                 ← Backend container
├── docker-compose.yml         ← Full dev stack (API + MongoDB + Redis)
│
├── app/
│   ├── core/
│   │   ├── config.py          ← Settings (Pydantic)
│   │   ├── database.py        ← Supabase + PostgreSQL + MongoDB connections
│   │   ├── security.py        ← JWT auth utilities
│   │   └── logging.py         ← Loguru setup
│   │
│   ├── api/v1/
│   │   ├── router.py          ← Master router
│   │   └── endpoints/
│   │       ├── auth.py        ← Login / Register / Me
│   │       ├── orders.py      ← Trade capture + confirm/dispute flow
│   │       ├── trust_score.py ← CIBIL-style Trust Score (Agent 2)
│   │       ├── risk_alerts.py ← Risk intelligence (Agent 3 output)
│   │       ├── beat_plan.py   ← Beat plans + ghost visit detection (Agent 6)
│   │       ├── schemes.py     ← Scheme management + leakage reports
│   │       ├── returns.py     ← Return classification + approval
│   │       ├── expiry.py      ← Near-expiry batch alerts
│   │       ├── certificate.py ← Trust Certificate PDF generator
│   │       ├── telegram_webhook.py ← Telegram Bot webhook receiver
│   │       ├── distributor.py ← Distributor control tower
│   │       ├── retailer.py    ← Retailer management
│   │       ├── salesman.py    ← Salesman reliability scores
│   │       ├── agent.py       ← AI pipeline control / debug
│   │       ├── ondc.py        ← ONDC integration stubs
│   │       ├── analytics.py   ← Dashboard analytics + audit trail
│   │       └── pdf_parser.py  ← Invoice OCR + scheme PDF extraction
│   │
│   ├── agents/
│   │   ├── agent1_trade_capture.py      ← Hindi/Hinglish message → trade event
│   │   ├── agent2_trust_scoring.py      ← CIBIL-style weighted scoring
│   │   ├── agent3_risk_intelligence.py  ← Credit risk, scheme leakage, expiry, GST
│   │   ├── agent4_action_recommendation.py ← Alert → action card + draft message
│   │   ├── agent5_demand_forecast.py    ← SKU demand forecast + pre-stock
│   │   └── agent6_beat_intelligence.py  ← Route optimisation + ghost visit detection
│   │
│   └── db/
│       └── schema.sql         ← Full PostgreSQL schema (run in Supabase)
│
├── venv/                      ← Python virtual environment
│
├── distributor/               ← Next.js 15 — Distributor Control Tower Dashboard
├── company/                   ← Next.js 15 — Brand/Company Intelligence Dashboard
├── agent/                     ← Next.js 15 — AI Agent Monitoring Dashboard
└── salesman/                  ← Flutter — Field Salesman Mobile App
```

---

## Quick Start

### 1. Backend (FastAPI)

```bash
# Activate virtual environment
.\venv\Scripts\activate          # Windows
source venv/bin/activate         # Linux/Mac

# Copy env file and fill in your keys
copy .env.example .env

# Install dependencies (already done in venv)
pip install -r requirements.txt

# Run dev server
python run.py
# OR
uvicorn main:app --reload --port 8000
```

API Docs: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc

### 2. Database Setup (Supabase)

1. Create a new Supabase project
2. Run `app/db/schema.sql` in the Supabase SQL editor
3. Copy your `SUPABASE_URL` and keys into `.env`

### 3. Distributor Dashboard

```bash
cd distributor
npm install
npm run dev        # http://localhost:3000
```

### 4. Company Dashboard

```bash
cd company
npm install
npm run dev        # http://localhost:3001
```

### 5. Agent Dashboard

```bash
cd agent
npm install
npm run dev        # http://localhost:3002
```

### 6. Salesman Flutter App

```bash
cd salesman
flutter pub get
flutter run
```

> ⚠️ Flutter SDK must be installed. Download from https://flutter.dev

---

## Docker (Full Stack)

```bash
docker-compose up --build
```

---

## API Endpoints Summary

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /api/v1/auth/login` | Login → JWT |
| Orders | `POST /api/v1/orders/` | Create order (Agent 1 trigger) |
| Orders | `PATCH /api/v1/orders/{id}/confirm` | Retailer confirms order |
| Trust Score | `GET /api/v1/trust-score/{retailer_id}` | Get CIBIL-style score |
| Trust Score | `GET /api/v1/trust-score/query/myscore` | Retailer self-service |
| Risk Alerts | `GET /api/v1/risk-alerts/` | List active alerts (Agent 3) |
| Beat Plan | `GET /api/v1/beat-plan/{salesman_id}` | Daily beat plan |
| Beat Plan | `GET /api/v1/beat-plan/ghost-visits/report` | Ghost visit detection |
| Schemes | `POST /api/v1/schemes/ingest-pdf` | Upload scheme PDF → RAG |
| Schemes | `GET /api/v1/schemes/leakage` | Scheme leakage report |
| Returns | `POST /api/v1/returns/` | Submit return claim |
| Expiry | `GET /api/v1/expiry/alerts` | Near-expiry alerts |
| Certificate | `POST /api/v1/certificate/generate` | Trust Certificate PDF |
| Certificate | `GET /api/v1/certificate/verify/{id}` | Public QR verification |
| Telegram | `POST /api/v1/webhook/telegram/` | Telegram Bot webhook |
| Analytics | `GET /api/v1/analytics/audit-trail` | Immutable audit log |
| PDF | `POST /api/v1/pdf/parse-invoice` | Invoice OCR |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.13) |
| AI Orchestration | LangGraph + LangChain |
| LLM | Claude (Anthropic) via API |
| Database (structured) | PostgreSQL via Supabase |
| Database (raw/AI) | MongoDB (Motor async) |
| Vector Store | FAISS (scheme RAG) |
| Cache / Queue | Redis + Celery |
| Channel | Telegram Bot API (MVP) |
| Distributor Web | Next.js 15 + TypeScript + Tailwind |
| Salesman Mobile | Flutter (Dart) |
| PDF Parsing | pdfplumber + pytesseract + PyMuPDF |
| Auth | JWT (python-jose) + Supabase Auth |
| Storage | AWS S3 |
| Audit | SHA-256 hash chain |

--

## 6 AI Agents

| Agent | Purpose | Status |
|-------|---------|--------|
| Agent 1 | Trade Capture & Normalisation (multilingual) | MVP |
| Agent 2 | Trust & Behaviour Scoring (CIBIL-style) | MVP |
| Agent 3 | Risk, Scheme & Compliance Intelligence | v2 |
| Agent 4 | Action & Recommendation | v2 |
| Agent 5 | Demand & Pre-Stock Forecast | v2 |
| Agent 6 | Beat Intelligence & Coverage | v2 |

---

*VendorLock turns India's chat-driven FMCG and HORECA trade from memory and guesswork into a scored, safeguarded network.*
