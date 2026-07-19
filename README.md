# Enterprise Predictive Maintenance Platform - Caterpillar Hackathon

A production-ready predictive maintenance platform built for industrial equipment monitoring, featuring role-based controls, sensor telemetry ingestion, and AI failure prediction.

---

## 🏗️ Architecture

The platform utilizes a decoupled, microservices-style architecture optimized for cloud deployments:

- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS) deployed on Vercel.
- **API Backend**: Django REST Framework (DRF) + Django ORM deployed on Railway. Handles authentication (JWT), user management, machinery logging, alerts, and business logic.
- **AI Microservice**: FastAPI (SQLAlchemy, Pandas, Scikit-learn) deployed on Railway. Handles model inference, anomaly scoring, and machine learning telemetry analytics.
- **Database**: Neon PostgreSQL, shared by both Django and FastAPI. Utilizes timeseries partitioning on sensor metrics.

```text
                               ┌────────────────────────┐
                               │       Next.js 15       │
                               │  Frontend Dashboard    │
                               └───────────┬────────────┘
                                           │
                                           │ (JWT / REST APIs)
                                           ▼
                               ┌────────────────────────┐
                               │  Django REST Backend   │
                               └─────┬────────────┬─────┘
                                     │            │
             (Database Connections)  │            │ (HTTP Requests)
                                     ▼            ▼
 ┌──────────────────────┐      ┌───────────┐┌───────────┐
 │   Neon PostgreSQL    │◄─────┤  FastAPI  ├┤ AI Model  │
 │  (Timeseries DB)     │      │   Service ││  Inference│
 └──────────────────────┘      └───────────┘└───────────┘
```

---

## 📂 Project Structure

```text
/
├── backend/                  # Django & DRF Backend Service
│   ├── config/               # Django base configuration (settings, routes)
│   ├── apps/                 # Local modular django applications
│   │   ├── users/            # Users, roles, JWT auth, custom permissions
│   │   ├── machinery/        # Sites, machines
│   │   ├── telemetry/        # SensorData, predictions, alerts
│   │   ├── maintenance/      # MaintenanceTeams, service logs
│   │   └── notifications/    # Push notifications / alerts
│   ├── requirements.txt      # Python backend packages
│   ├── manage.py             # CLI command utility
│   └── railway.json          # Django railway deploy script
├── ai-service/               # FastAPI Microservice for AI/ML Inference
│   ├── requirements.txt      # Python libraries (FastAPI, Scikit-learn, Pandas)
│   ├── main.py               # Main uvicorn server application
│   └── railway.json          # FastAPI railway deploy script
├── frontend/                 # Next.js 15 Frontend
│   ├── src/                  # App Router components & client modules
│   ├── package.json          # Frontend Node libraries
│   ├── next.config.ts        # Next.js settings
│   └── tsconfig.json         # TypeScript configuration
└── docs/                     # Platform Design Documentation
    ├── database_schema.md    # ER diagram and PostgreSQL DDL schema
    └── development_roadmap.md # Task milestones and timelines
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+

### 1. Database Configuration
1. Provision a PostgreSQL instance (Neon PostgreSQL recommended).
2. Run the DDL script found in [database_schema.md](file:///c:/Users/admin/Desktop/CAT%20HACKATHON/docs/database_schema.md) to set up tables, relationships, and indices.

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL in .env
python manage.py migrate
python manage.py runserver
```

### 3. AI Service Setup (FastAPI)
```bash
cd ai-service
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL in .env
python main.py
```

### 4. Frontend Setup (Next.js)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## 🧪 Verification & Testing
To run backend authentication, user roles, and database mapping tests:
```bash
cd backend
python manage.py test
```
All integration and unit tests run against local fallback SQLite, confirming endpoint responses and credential validity.
