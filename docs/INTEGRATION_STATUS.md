# Integration Status & Dependency Audit

## Execution Sandboxing
- **Harbor (`v0.25.0`)**: Checked via `/api/v1/health`.
  - When installed with Docker daemon active: runs tasks with `REAL_EXECUTION` provenance badge.
  - When Harbor or Docker is absent: gracefully degrades to `DETERMINISTIC_HARNESS` or `SIMULATOR` fallback. Zero synthetic data is labeled `REAL_EXECUTION`.

## Model Gateway
- **Maxim Bifrost**: Checked via `/api/v1/health`.
  - When enabled: routes OpenAI-compatible chat requests through the gateway endpoint.
  - When disabled or unreachable: falls back cleanly to local stub client with explicit `mode="MOCK"` and `fallback_used=True`.

## Trace Storage & Formats
- **ATIF v1.8**: Harbor-compatible trajectory schema stored at `artifacts/trajectories/*.json` and served dynamically via `/api/v1/runs/{id}/trajectory`.
