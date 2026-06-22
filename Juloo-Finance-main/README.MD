

## One-Command Run (Docker)

Prerequisite: Docker + Docker Compose installed.

From the project root, run:

```bash
docker compose up --build
```

Then open:

- App: `http://localhost:8080`
- Backend API health: `http://localhost:8080/api/health/`

The backend uses a persisted Docker volume for SQLite data (`backend_data`), so your data remains across container restarts.

## Stop The App

```bash
docker compose down
```

If you want to remove database data too:

```bash
docker compose down -v
```

## Local Development (Without Docker)

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For local frontend development, you can point API calls to backend by setting:

```bash# Juloo Finance

Juloo Finance is a full-stack digital banking application with:

- `frontend`: React + Vite
- `backend`: Django REST Framework + JWT auth
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```
