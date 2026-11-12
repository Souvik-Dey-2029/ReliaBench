# ReliaBench Operations Runbook

## Service Architecture & Process Lifecycle

```
[ Frontend: React 18 / Vite / Nginx ]
             |
             v  (Reverse Proxy / Direct HTTP)
[ Backend: FastAPI / Uvicorn (port 8000) ]
       |                   |
       +--> SQLite DB      +--> BifrostClient (Model Gateway / Local Stub)
       |                   |
       +--> Pack Catalog   +--> HarborAdapter (Subprocess CLI v0.25.0)
```

## Routine Operations

### Starting Backend Locally
```bash
export PYTHONPATH="backend"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Starting Frontend Locally
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Running Test Verification Gates
```bash
# Backend pytest suite
PYTHONPATH=backend python -m pytest backend/tests -v

# Frontend TypeScript & bundle compilation
cd frontend && npm run build
```

### Replaying Regression Gates via CLI
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/regressions/run-all?target_agent=resilient"
```
