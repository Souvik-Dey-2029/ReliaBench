# RELIABENCH (Global AI Hackathon | PS02)
> **"Same tasks. Same conditions. Measurable agent reliability."**

Reliabench is a framework-independent benchmarking and reliability platform for autonomous AI agents. Rather than ranking models on single lucky runs, Reliabench measures:
1. **Repeatability**: Evaluates Pass@k and Pass^k across repeated identical trials.
2. **Resilience**: Injects controlled faults (timeouts, HTTP 500s, malformed tool payloads, contradictory prompts) and calculates the **Recovery Rate**.
3. **Execution Evidence**: Stores and visualizes step-by-step traces conforming to the **Agent Trajectory Interchange Format (ATIF v1.8)**.
4. **Apples-to-Apples Comparison**: Compares candidate agents side-by-side under identical task specifications and constraints.

---

## 1. Quickstart (Local Development)

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ and npm

### Terminal 1: Start Backend (FastAPI)
```bash
# Set Python path to backend
$env:PYTHONPATH="backend"   # Windows PowerShell
# export PYTHONPATH="backend" # Linux/macOS

# Run with uvicorn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Diagnostic: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start Frontend (Vite + React)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://127.0.0.1:5173`

---

## 2. Architecture & Design

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (Vibrant Neo-Brutalism theme), Recharts, Lucide Icons.
- **Backend**: FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite (Local, PostgreSQL-compatible).
- **Execution Sandboxing**: Harbor v0.25.0 adapter (`harbor run`) with transparent fallback to deterministic Simulator when Harbor CLI or Docker Desktop is absent.
- **Evaluation Mathematics**:
  - **Pass Rate**: $\frac{\sum \text{Successes}}{\text{Total Valid Trials}}$
  - **Pass@k**: $1 - \frac{\binom{n - c}{k}}{\binom{n}{k}}$
  - **Pass^k**: $\frac{\text{Trials with all } k \text{ passes}}{N}$
  - **Recovery Rate**: $\frac{\text{Recoveries after injected fault}}{\text{Total injected faults}}$
- **Observability**: Harbor ATIF v1.8 step inspection.
- **Model Gateway**: Optional Maxim Bifrost integration interface.

---

## 3. Running Automated Tests

Run backend unit and API integration tests:
```bash
$env:PYTHONPATH="backend"
python -m pytest backend/tests -v
```
Run frontend TypeScript and Vite production build test:
```bash
cd frontend
npm run build
```

---

## 4. Documentation
Comprehensive architecture and integration documents are located in `docs/`:
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md): System layout and component interaction.
- [`REPOSITORY_RESEARCH.md`](docs/REPOSITORY_RESEARCH.md): Upstream open-source analysis (Harbor, AgentClash, Bifrost, Opik, Langfuse).
- [`DATA_MODEL.md`](docs/DATA_MODEL.md): Relational schema and entity specifications.
- [`API_CONTRACTS.md`](docs/API_CONTRACTS.md): REST v1 API endpoints.
- [`INTEGRATION_STATUS.md`](docs/INTEGRATION_STATUS.md): External dependency status and fallback mechanisms.
- [`LICENSE_ATTRIBUTION.md`](docs/LICENSE_ATTRIBUTION.md): Third-party notices and licenses.

