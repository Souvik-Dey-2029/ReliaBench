# ReliaBench Production Deployment & Operations Guide

## 1. Local Containerized Deployment (Docker Compose)

The complete ReliaBench stack (FastAPI backend + Vite/Nginx frontend + SQLite storage) can be booted with a single command:

```bash
docker compose up --build -d
```

### Verified Service Ports:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API & Docs**: `http://localhost:8000/docs`
- **Health Diagnostic**: `http://localhost:8000/api/v1/health`

---

## 2. Hosted Cloud Deployment Status

### Production Environment Variables
| Variable | Required | Description |
| :--- | :---: | :--- |
| `PROJECT_NAME` | Yes | Platform title (`Reliabench`) |
| `DATABASE_URL` | Yes | SQLite (`sqlite:///./reliabench.db`) or PostgreSQL URI |
| `API_V1_PREFIX` | Yes | Route prefix (`/api/v1`) |
| `HARBOR_BIN_PATH` | No | Path to Harbor binary (`harbor`) |
| `HARBOR_VERSION_REQUIRED` | No | Pinned Harbor version (`v0.25.0`) |
| `ENABLE_BIFROST_GATEWAY` | No | Enable real model gateway (`True` / `False`) |
| `BIFROST_ENDPOINT` | No | URL to Maxim Bifrost gateway instance |
| `BIFROST_API_KEY` | No | Bearer authentication token for Bifrost |

### Hosted Cloud Deployment Note
Hosted cloud deployment (e.g. Render / Railway / Supabase) is currently:
`BLOCKED`: Third-party cloud deployment credentials and hosting API keys are deliberately omitted from this public repository in accordance with zero-secrets hygiene constraints.

The platform is fully deployable via the provided multi-stage `Dockerfile.backend`, `Dockerfile.frontend`, and `docker-compose.yml`.

---

## 3. Smoke Test Runbook

Execute this verification script against any live or local instance:

```bash
# 1. Probe health
curl -f http://localhost:8000/api/v1/health

# 2. List available challenge packs
curl -f http://localhost:8000/api/v1/packs

# 3. Execute deterministic challenge pack run
curl -X POST http://localhost:8000/api/v1/packs/flaky_test_triage/run \
  -H "Content-Type: application/json" \
  -d '{"profile":"resilient","k":3,"seed":42}'

# 4. Trigger regression gate replay
curl -X POST http://localhost:8000/api/v1/regressions/run-all?target_agent=resilient
```
