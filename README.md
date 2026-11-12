# ReliaBench

> "AgentClash and friends are run orchestrators with replay. ReliaBench is a reliability harness that deliberately breaks the environment and reports pass^k under fault, with gateway-level cost attribution."

**Our Defence:** Evaluating an agent solely on happy-path success rates ($pass@1$) gives an illusion of safety. Real deployment exposes agents to transient tool timeouts, 5xx model provider errors, malformed schema payloads, and adversarial instructions. ReliaBench provides reproducible, seeded fault injection to measure true agent resilience and $pass^k$ reliability bounds.

---

## Quickstart

### Prerequisites
- Python 3.10+ (tested with Python 3.13)
- Node.js 18+ and npm
- Docker daemon (optional, for native `harbor run` sandbox execution)

### 1. Backend Setup (FastAPI)
```bash
# Set Python path to backend
export PYTHONPATH="backend"

# Run with uvicorn
.venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Diagnostic: `http://127.0.0.1:8000/api/v1/health`

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Public Editorial Landing: `http://127.0.0.1:5173`
- Operational Benchmark Workspace: `http://127.0.0.1:5173/app`
- Challenge Pack Library: `http://127.0.0.1:5173/app/benchmarks`
- Regression Gates: `http://127.0.0.1:5173/app/regressions`

---

## CLI Challenge Pack Run & Expected Headline Contrast

Run the deterministic reliability test directly through python:

```bash
PYTHONPATH=backend python -c "
from app.benchmarks.pack import load_pack_from_file
from app.agents.reference import ReferenceToolAgent
from app.faults.engine import FaultConfig, FaultKind
from app.services.runner import ReliabilityRunner

pack = load_pack_from_file('benchmark_tasks/packs/flaky_test_triage.yaml')
fault = FaultConfig(kind=FaultKind.TOOL_ERROR, at_step=3, tool='update_quarantine_config')

# 1. Fragile Profile
runner_f = ReliabilityRunner(seed=42)
sc_f = runner_f.run_pack(pack, ReferenceToolAgent('fragile'), k=3, fault=fault, agent_name='fragile')
print('FRAGILE:', {'pass_rate': sc_f.pass_rate, 'taxonomy': sc_f.taxonomy_counts, 'recovery': sc_f.recovery_rate})

# 2. Resilient Profile (Identical Seed & Fault)
runner_r = ReliabilityRunner(seed=42)
sc_r = runner_r.run_pack(pack, ReferenceToolAgent('resilient'), k=3, fault=fault, agent_name='resilient')
print('RESILIENT:', {'pass_rate': sc_r.pass_rate, 'taxonomy': sc_r.taxonomy_counts, 'recovery': sc_r.recovery_rate})
"
```

### Expected Output:
```text
FRAGILE: {'pass_rate': 0.0, 'taxonomy': {'TOOL_CONTRACT': 3}, 'recovery': 0.0}
RESILIENT: {'pass_rate': 1.0, 'taxonomy': {}, 'recovery': 1.0}
```

---

## How the Reliability Core Works

1. **Challenge Packs**: Formatted in YAML with declared tools, step plans, preconditions (`requires`), and verifiable outcome assertions. Unmet preconditions register observable `PLANNING_DEVIATION` failures.
2. **Deterministic Fault Engine**: Injects `TOOL_ERROR`, `TOOL_TIMEOUT`, `MODEL_UNAVAILABLE`, and `MISLEADING_INSTRUCTION` faults using seeded PRNG keyed purely on `(seed, step_index, tool, fault_kind)`. Regression replays reproduce exact failing steps.
3. **Mathematical Evaluation**: Calculates Pass Rate with Wilson 95% Score Confidence Intervals, $pass@k$ (probability at least one of $k$ attempts succeeds), and $pass^k$ (probability that all $k$ consecutive runs succeed, $pass^k \le pass@k$).
4. **Hierarchical Taxonomy**: Classifies every failed run into priority order: `TIMEOUT` > `PLANNING_DEVIATION` > `VERIFIER_MISMATCH` > `RECOVERY_EXHAUSTED` > fault-specific (`TOOL_CONTRACT`, `MODEL_OUTAGE`, `INSTRUCTION_CONFLICT`) > `UNKNOWN`.
5. **Gateway Attribution**: Every model call measures latency, tokens, cost ($USD), and fallback status through `BifrostClient`.

---

## Provenance Modes

Data honesty is non-negotiable in ReliaBench. Every scorecard, trial, and frontend view explicitly badges provenance:
- **`DETERMINISTIC_HARNESS`**: Real agent loop execution against challenge packs with seeded deterministic fault injection.
- **`REAL_EXECUTION`**: Real execution inside Docker sandboxes via Harbor v0.25.0 CLI (`harbor run`). Never claimed unless both Harbor and Docker daemon are present and verified.
- **`SIMULATOR`**: Pre-seeded demo baseline dataset, badged as synthetic in all views.

---

## API Surface

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Harbor availability, Bifrost mode, pack count, active provenance mode |
| `GET` | `/api/v1/packs` | List all available challenge packs |
| `GET` | `/api/v1/packs/{id}` | Inspect challenge pack detail, tools, plan, and preconditions |
| `POST` | `/api/v1/packs/{id}/run` | Execute challenge pack across $k$ trials with deterministic faults |
| `GET` | `/api/v1/taxonomy` | Failure taxonomy catalogue, remediation hints, and priority rules |
| `GET` | `/api/v1/regressions` | List stored regression gates and quarantine statuses |
| `POST` | `/api/v1/regressions` | Promote a trial failure into a permanent regression gate |
| `POST` | `/api/v1/regressions/{id}/replay` | Replay single regression case against selected candidate agent |
| `POST` | `/api/v1/regressions/run-all` | Replay all regression gates and output CI-friendly summary |
| `GET` | `/api/v1/runs/{id}/export` | Export full scorecard in JSON or CSV format |

---

## Automated Tests

ReliaBench is validated with automated test suites across backend and frontend:

```bash
# Backend pytest suite (40 tests)
PYTHONPATH=backend python -m pytest backend/tests -v

# Frontend TypeScript and production bundle check
cd frontend && npm run build
```

---

## What We Reused vs What We Built

### Reused
- **Harbor (`v0.25.0`, Apache-2.0)**: Subprocess sandbox execution layer, argument array builder (`harbor run`), and task containerization.
- **AgentClash (MIT)**: Design reference for challenge-pack YAML schema, replay terminology, and failure taxonomy categories.
- **tau-bench (Sierra)**: Mathematical formulation for $pass^k$ across repeated trials ($p^k$ and exact hypergeometric ratio).
- **Maxim Bifrost**: Model gateway integration pattern for unified token, latency, and cost attribution.

### What We Built
- **Deterministic Reliability Harness**: Zero-randomness seeded PRNG engine simulating reproducible tool, model, and prompt faults.
- **Precondition Chain Engine**: Step-level `requires` enforcement turning latent agent planning deviations into observable failures.
- **Automated Failure Classifier**: Strict priority taxonomy classifier with automated remediation recommendations.
- **Regression Gate Store**: Quarantine registry with individual and bulk CI replay (`FIXED` vs `STILL_FAILING`).
- **ATIF v1.8 Trace Exporter**: Unified schema mapper outputting Harbor-compatible step traces with per-step cost and fault tags.
- **Warm Editorial React UI**: Full dashboard, interactive scrubber, comparison matrix, and pack runner with provenance badges.
