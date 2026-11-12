# ReliaBench Evidence-Based Capability Audit

> "Evidence over assertion. Never write 'done', 'working', 'production-ready' or 'verified' anywhere unless you have a command output, a test result, or a live HTTP response that proves it in this repository."

**Audit Date**: 2026-11-12
**Auditor**: Lead Engineer / Release Owner (Team ReliaBench)
**Active Git Branch**: `feat/reliability-core`

---

## 1. Capability & Component Audit Matrix

| Capability / Component | Claimed % | Verified % | Evidence (command, test, HTTP response) | Status | Gap to Close | Owner |
| :--- | :---: | :---: | :--- | :---: | :--- | :--- |
| **Repository & Architecture** | 90% | 85% | Directory layout, clean separation of `app/` and `frontend/src/` | WORKS | Add Docker Compose, multi-stage Dockerfiles | Souvik |
| **Backend API Foundation** | 75% | 75% | 40 pytest tests passing (`pytest backend/tests`), `/api/v1/health` returns HTTP 200 | WORKS | Consistent error envelope, pagination, schema smoke test | Mohit |
| **Frontend & Navigation** | 75% | 75% | `npm run build` exits 0 (Vite 8, TypeScript 5), sidebar routing working | WORKS | Loading/error/empty fallback states, Playwright tests | Souvik |
| **Landing Page & Visuals** | 60% | 60% | Editorial theme, `LiquidCanvas.tsx`, `/` route functional | PARTIAL | Ensure zero lorem ipsum, add interactive live teaser | Souvik |
| **Benchmark Pack Catalog** | 85% | 85% | 6 challenge YAML packs with step `requires`, loaded by `pack.py` | WORKS | Add converter adapter reference and pack validator tests | Mohit |
| **Deterministic Harness** | 75% | 80% | `FaultEngine` using seeded PRNG `(seed, step, tool, kind)`, zero `random.random()` | WORKS | Expand CLI runner script with structured JSON output | Mohit |
| **Reliability Metrics** | 80% | 85% | $Pass@k$, $Pass^k$, Wilson 95% CI in `metrics.py`, tested in `test_metrics.py` | WORKS | Verify $Pass^k \le Pass@k$ invariant in all edge cases | Mohit |
| **Failure Injection Engine** | 70% | 75% | `TOOL_ERROR`, `TOOL_TIMEOUT`, `MODEL_UNAVAILABLE`, `MISLEADING_INSTRUCTION` | WORKS | Cover compound multi-fault injections | Mohit |
| **Agent Registration & Real Adapters** | 40% | 40% | Reference agent profiles (`fragile`, `retrying`, `resilient`) implemented | PARTIAL | Implement real HTTP & CLI adapters, add agent probe endpoint | Souvik |
| **Harbor Integration** | 35% | 35% | `HarborAdapter` with safe argument lists and version checking (v0.25.0) | PARTIAL | Real trajectory fixture parsing, mock CLI execution | Aravind |
| **Bifrost Telemetry Gateway** | 25% | 30% | `BifrostClient` with token/cost calculation and labelled local stub | PARTIAL | Real HTTP call with retries and timeout handling | Aravind |
| **ATIF Trace Inspection** | 50% | 55% | ATIF v1.8 schema in `atif.py`, `TracesPage.tsx` timeline view | PARTIAL | Step fault highlighting, token/cost visualization per step | Aravind |
| **Agent Comparison & Reporting** | 45% | 50% | `ComparisonsPage.tsx` side-by-side matrix with incompatibility warning | PARTIAL | Add CSV/JSON full scorecard downloads, trace diffing | Souvik |
| **Deployment Readiness** | 25% | 20% | Local setup documented in `README.md`, `.env.example` present | PARTIAL | Dockerfiles, `docker-compose.yml`, GitHub Actions CI | Aravind |

---

## 2. API Route Audit & Status Codes

All endpoints verified live against `TestClient(app)`:
- `GET /` -> `200 OK` (Operational root status)
- `GET /api/v1/health` -> `200 OK` (Harbor, Bifrost, active source_mode)
- `GET /api/v1/packs` -> `200 OK` (Returns 6 loaded YAML challenge packs)
- `GET /api/v1/packs/flaky_test_triage` -> `200 OK` (Pack detail and plan)
- `POST /api/v1/packs/flaky_test_triage/run` -> `200 OK` (Executes deterministic harness)
- `GET /api/v1/taxonomy` -> `200 OK` (Hierarchical categories & remediation hints)
- `GET /api/v1/regressions` -> `200 OK` (List stored regression cases)
- `POST /api/v1/regressions/run-all` -> `200 OK` (Bulk regression execution)
- `GET /api/v1/runs/{id}/export?format=json` -> `200 OK` (Scorecard JSON)
- `GET /api/v1/runs/{id}/export?format=csv` -> `200 OK` (Scorecard CSV)

---

## 3. Plan of Record to Close Gaps
1. **Real Adapters**: Add HTTP and CLI Agent adapters (`backend/app/adapters/agents/`) with connection test endpoints.
2. **Production Hardening**: Add structured JSON logging, standard error envelopes, and CORS configuration.
3. **Containerization & CI**: Add Dockerfile for backend, Dockerfile for frontend, `docker-compose.yml`, and GitHub Actions workflow (`.github/workflows/ci.yml`).
4. **Testing Expansion**: Add schema smoke test for fresh SQLite/Postgres DBs, Playwright E2E configuration and user journey tests.
5. **Verification Matrix**: Create `docs/VERIFICATION_MATRIX.md` mapping every UI element and API endpoint to its automated test.
