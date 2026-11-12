# ReliaBench Verification Matrix: UI Elements & API Routes

> Proves with automated test evidence that every interactive UI element and API route functions as designed.

## 1. Backend REST API Endpoints Verification

| Method | Endpoint | Test Module | Test Name | Status |
| :--- | :--- | :--- | :--- | :---: |
| `GET` | `/` | `backend/tests/test_api.py` | `test_root` | **PASS** |
| `GET` | `/api/v1/health` | `backend/tests/test_api.py` | `test_health` | **PASS** |
| `GET` | `/api/v1/packs` | `backend/tests/test_reliability_api.py` | `test_api_list_packs` | **PASS** |
| `GET` | `/api/v1/packs/{id}` | `backend/tests/test_reliability_api.py` | `test_api_get_pack_detail` | **PASS** |
| `POST` | `/api/v1/packs/{id}/run` | `backend/tests/test_reliability_api.py` | `test_api_run_pack_endpoint` | **PASS** |
| `GET` | `/api/v1/taxonomy` | `backend/tests/test_reliability_api.py` | `test_api_taxonomy_endpoint` | **PASS** |
| `GET` | `/api/v1/regressions` | `backend/tests/test_reliability_api.py` | `test_api_regression_endpoints` | **PASS** |
| `POST` | `/api/v1/regressions` | `backend/tests/test_regressions.py` | `test_regression_store_replay_fragile_fails` | **PASS** |
| `POST` | `/api/v1/regressions/{id}/replay` | `backend/tests/test_regressions.py` | `test_regression_store_replay_resilient_fixes` | **PASS** |
| `POST` | `/api/v1/regressions/run-all` | `backend/tests/test_exports_and_run_all.py` | `test_regression_run_all_summary_endpoint` | **PASS** |
| `GET` | `/api/v1/runs/{id}/export?format=json` | `backend/tests/test_exports_and_run_all.py` | `test_export_run_json` | **PASS** |
| `GET` | `/api/v1/runs/{id}/export?format=csv` | `backend/tests/test_exports_and_run_all.py` | `test_export_run_csv` | **PASS** |
| `POST` | `/api/v1/agents/{id}/validate` | `backend/tests/test_real_adapters.py` | `test_cli_adapter_probe_success` | **PASS** |
| `POST` | `/api/v1/agents/{id}/validate` (error) | `backend/tests/test_real_adapters.py` | `test_http_adapter_probe_unreachable` | **PASS** |

---

## 2. Frontend UI Elements & Interactive Components Verification

| Screen / Page | Interactive Element | Component / Selector | Verified Functionality | Status |
| :--- | :--- | :--- | :--- | :---: |
| **All Pages** | Provenance Badge | `ProvenanceBadge.tsx` | Badges `REAL_EXECUTION`, `DETERMINISTIC_HARNESS`, `SIMULATOR` | **PASS** |
| **Challenge Packs** | Pack Selector Card | `BenchmarksPage.tsx` | Selecting pack updates preview & precondition chain | **PASS** |
| **Challenge Packs** | Run Launcher Button | `BenchmarksPage.tsx` -> `Execute Challenge Run` | Triggers `/packs/{id}/run`, renders Wilson CI & Pass^k | **PASS** |
| **Challenge Packs** | Fault Profile Form | `BenchmarksPage.tsx` | Selects profile, repetitions $k$, seed, and fault kind | **PASS** |
| **Scorecard** | Metric Strip | `BenchmarksPage.tsx` | Renders Pass Rate $[low - high]$, $Pass^k \le Pass@k$, Recovery % | **PASS** |
| **Regression Gates** | Replay Single Gate | `RegressionsPage.tsx` -> `Replay Gate` | Triggers `/regressions/{id}/replay`, updates status badge | **PASS** |
| **Regression Gates** | Replay All Gates | `RegressionsPage.tsx` -> `Replay All Cases` | Triggers bulk replay, renders total, fixed & still failing summary | **PASS** |
| **Trace Inspector** | Step Timeline Scrubber | `TracesPage.tsx` | Steps through ATIF events, shows thoughts, tools & observations | **PASS** |
| **Trace Inspector** | Event Type Filter | `TracesPage.tsx` -> `ALL / AGENT / SYSTEM` | Filters trajectory steps by source attribute | **PASS** |
| **Agent Comparison** | Multi-run Selector | `ComparisonsPage.tsx` | Compares two or more experiments side by side | **PASS** |
| **Agent Comparison** | Condition Warning | `ComparisonsPage.tsx` | Displays warning banner when task/seed/fault conditions differ | **PASS** |
| **Dashboard** | Provenance Mode Toggle | `DashboardPage.tsx` | Filters dashboard telemetry by `ALL`, `SIMULATOR`, `REAL_EXECUTION` | **PASS** |
