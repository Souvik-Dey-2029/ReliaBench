# RELIABENCH (Global AI Hackathon | PS02)
> **"Same tasks. Same conditions. Measurable agent reliability."**

Reliabench is a framework-independent benchmarking and reliability platform for autonomous AI agents. Rather than ranking models on single lucky runs, Reliabench measures:
1. **Repeatability**: Evaluates Pass@k and Pass^k across repeated identical trials.
2. **Resilience**: Injects controlled faults (timeouts, HTTP 500s, malformed tool payloads, contradictory prompts) and calculates the **Recovery Rate**.
3. **Execution Evidence**: Stores and visualizes step-by-step traces conforming to the **Agent Trajectory Interchange Format (ATIF v1.8)**.
4. **Apples-to-Apples Comparison**: Compares candidate agents side-by-side under identical task specifications, verifiers, and failure conditions.

---

## 1. Quickstart (Local Development)

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ and npm

### Terminal 1: Start Backend (FastAPI)
```powershell
# Set Python path to backend
$env:PYTHONPATH="backend"   # Windows PowerShell
# export PYTHONPATH="backend" # Linux/macOS

# Run with uvicorn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Diagnostic: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start Frontend (Vite + React)
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Public Editorial Landing Page: `http://127.0.0.1:5173`
- Operational Dashboard Workspace: `http://127.0.0.1:5173/app`

---

## 2. Architecture & Design Direction

- **Visual Design Identity**: Technical & Warm Editorial design language combining Graphite surfaces (`#171A16`), Warm Bone accents (`#E8DDC8`), Persimmon action highlights (`#F06B45`), Acid Lime verification indicators (`#C7D94C`), and Muted Sage (`#89977A`).
- **Interactive Liquid Cursor Layer**: Non-blocking, velocity-responsive canvas ripple effect compliant with `prefers-reduced-motion`.
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend Stack**: FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (Local, PostgreSQL-compatible).
- **Execution Sandboxing**: Harbor v0.25.0 adapter (`harbor run`) with transparent fallback to deterministic Simulator when Harbor CLI or Docker Desktop is absent.
- **Data Integrity**: Explicit `source_mode` tagging (`REAL_EXECUTION` vs `SIMULATOR`) to prevent synthetic trial data from contaminating real benchmark measurements.

---

## 3. Running Automated Tests

Run backend unit and API integration tests:
```powershell
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```
Run frontend TypeScript and Vite production build test:
```powershell
cd frontend
npm run build
```

---

## 4. Documentation
Comprehensive architecture, methodology, and integration documents are located in `docs/`:
- [`docs/IMPLEMENTATION_AUDIT.md`](docs/IMPLEMENTATION_AUDIT.md): Comprehensive inventory and gap analysis.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System layout and component interaction.
- [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md): Mathematical formulations for Pass@k, Pass^k, Wilson Confidence Intervals, and Recovery Rate.
- [`docs/TEST_RESULTS.md`](docs/TEST_RESULTS.md): Automated test execution report.
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md): REST v1 API contracts.
- [`docs/INTEGRATION_STATUS.md`](docs/INTEGRATION_STATUS.md): Harbor, Docker, and Bifrost status.
- [`docs/LICENSE_ATTRIBUTION.md`](docs/LICENSE_ATTRIBUTION.md): Third-party notices and licenses.
