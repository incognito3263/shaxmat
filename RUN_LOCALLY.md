# Chess Nexus — Run Locally

This guide explains how to run the **Chess Nexus** project on your local PC.

## Prerequisites

- **Docker** and **Docker Compose** installed (Docker Desktop must be running on Windows)
- Or: **Node.js 18+**, **Python 3.11+**, **PostgreSQL 16** (for non-Docker setup)

---

## Option 1: Docker (Recommended)

### 1. Start all services

From the project root:

```bash
docker compose up --build
```

This starts:

- **PostgreSQL** on port `5432`
- **Backend (FastAPI)** on port `8000`
- **Frontend (React)** on port `3000`

### 2. Open the app

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8000  
- **API docs:** http://localhost:8000/docs  

### 3. Stop services

```bash
docker compose down
```

To remove database data:

```bash
docker compose down -v
```

---

## Option 2: Without Docker

### 1. Database

Start PostgreSQL and create the database:

```sql
CREATE USER shaxmat_user WITH PASSWORD 'shaxmat_password';
CREATE DATABASE shaxmat_plus_db OWNER shaxmat_user;
```

Or use SQLite for local dev (no PostgreSQL needed):

```bash
# No extra setup; backend uses SQLite by default
```

### 2. Backend

```bash
cd backend

# Create uploads directory (required for avatar uploads)
mkdir -p uploads/avatars   # Linux/macOS
# Windows: mkdir uploads\avatars

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

With PostgreSQL:

```bash
set DATABASE_URL=postgresql://shaxmat_user:shaxmat_password@localhost:5432/shaxmat_plus_db
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173 (Vite dev server with proxy to backend on port 8000)

---

## Ports

| Service   | Port  | URL                     |
|----------|-------|-------------------------|
| Frontend | 5173  | http://localhost:5173  |
| Frontend (Docker) | 3000 | http://localhost:3000  |
| Backend  | 8000  | http://localhost:8000  |
| Database | 5432  | localhost:5432          |

---

## Troubleshooting

### Backend fails to start

- Ensure port 8000 is free.
- If using PostgreSQL, check that it is running and `DATABASE_URL` is correct.

### Frontend cannot reach backend

- In dev (`npm run dev`), Vite proxies API calls to `http://localhost:8000`.
- In Docker, frontend uses `http://localhost:3000`; nginx proxies to the backend.

### WebSocket connection fails

- WebSocket connects to `ws://localhost:8000/ws/{public_id}`.
- Ensure the backend is running and port 8000 is accessible.
