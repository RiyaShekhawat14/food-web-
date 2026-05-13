# Food Website Full Stack App

This project started as a frontend food ordering UI and is now a full stack application with:

- `frontend/` for the React + Vite client
- `backend/` for the FastAPI API
- Supabase Postgres for persistent data
- demo checkout support for free college-project payment flow

## Ports

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`

## Features

- Responsive food ordering UI
- Login and signup with JWT authentication
- Database-backed products, cart, and orders
- Demo payment gateway flow
- Order history page backed by the database

## Run locally

1. Frontend setup:
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

2. Backend setup:
```bash
cd backend
copy .env.example .env
..\.venv\Scripts\python.exe -m pip install -r requirements.txt
..\.venv\Scripts\python.exe run.py
```

PowerShell-safe backend commands:
```powershell
cd c:\Users\hp\OneDrive\Desktop\food-web\food-website\backend
copy .env.example .env
& ..\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
& ..\.venv\Scripts\python.exe .\run.py
```

If `.venv` does not exist yet, create it once from the repo root:
```powershell
cd c:\Users\hp\OneDrive\Desktop\food-web\food-website
py -3.13 -m venv .venv
& .\.venv\Scripts\python.exe -m pip install --upgrade pip
```

## Architecture

### Frontend

- Entry point: `frontend/src/main.jsx`
- App shell and routes: `frontend/src/App.jsx`
- API-backed app state: `frontend/src/Context/StoreContext.jsx`
- API base URL config: `frontend/src/config/api.js`
- Fetch helper: `frontend/src/services/api.js`

### Backend

- API bootstrap: `backend/main.py`
- Local run entry: `backend/run.py`
- Settings: `backend/app/core/config.py`
- Auth/security helpers: `backend/app/core/security.py`
- Database/session setup: `backend/app/db/session.py`
- Route layer: `backend/app/routers/`
- Business logic layer: `backend/app/services/`
- Database models: `backend/app/models/`
- Request/response schemas: `backend/app/schemas/`

## Environment

Frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Backend:

```env
SECRET_KEY=your-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=4320
DATABASE_PATH=
DATABASE_URL=your-database-url
FRONTEND_BASE_URL=http://127.0.0.1:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PAYMENT_PROVIDER=demo
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
CURRENCY=usd
DELIVERY_FEE=2
```

## Notes

- The backend seeds the food catalog on first startup.
- Demo payment mode is free and suitable for a college project.
- Supabase can be used through `DATABASE_URL`.
- `.env` files are ignored from git.
