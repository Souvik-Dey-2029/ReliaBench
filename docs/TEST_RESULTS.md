# Automated Test Results Summary

**Execution Timestamp**: 2026-11-12
**Suite Outcome**: 40 passed, 0 failures, 0 errors
**Frontend Build**: Vite + TypeScript compilation passed with zero errors (`npm run build`)

## Test Coverage Inventory

| Module | Test File | Cases | Coverage Highlights |
| :--- | :--- | :--- | :--- |
| Core API | `test_api.py` | 5 | Agent CRUD, validation, health status |
| Mathematics | `test_metrics.py` | 6 | Pass rate, Wilson CI, Pass@k, Pass^k, sample variance |
| Challenge Packs | `test_pack_loader.py` | 3 | YAML loading, validator types, requires preconditions |
| Fault Engine | `test_fault_engine.py` | 3 | Deterministic seeded selection, step/tool filters |
| Profiles | `test_agent_profiles.py` | 3 | Fragile failure vs Resilient recovery separation |
| Taxonomy | `test_taxonomy.py` | 3 | Priority order verification and remediation hints |
| Runner | `test_runner_metrics.py` | 3 | Contrast verification, pass^k <= pass@k, ATIF v1.8 shape |
| Regressions | `test_regressions.py` | 3 | Case replay, STILL_FAILING vs FIXED reporting |
| Reliability API | `test_reliability_api.py` | 6 | Endpoints `/packs`, `/run`, `/taxonomy`, `/regressions` |
| Harbor Adapter | `test_harbor_adapter.py` | 2 | Command injection prevention, honest provenance checks |
| Exports & CI | `test_exports_and_run_all.py` | 3 | JSON/CSV run export, `run-all` regression summary |

Total Automated Tests: **40 passed**.
