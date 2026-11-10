# RELIABENCH DATA MODEL SPECIFICATION

The relational schema is implemented with SQLAlchemy 2.0 and supports SQLite (local development) and PostgreSQL (production).

```
                      +---------------+
                      |     Agent     |
                      +-------+-------+
                              | 1
                              |
                              | *
+-------------------+ 1     * |        1 +--------------------+
|   BenchmarkTask   +---------+----------+  FailureScenario   |
+---------+---------+   ExperimentAgent  +----------+---------+
          | 1                 | 1                   | 1
          |                   |                     |
          | *                 | *                   | *
+---------+-------------------+---------------------+---------+
|                           Experiment                        |
+---------------------------------+---------------------------+
                                  | 1
                                  |
                                  | *
+---------------------------------+---------------------------+
|                              Run                            |
+---------------------------------+---------------------------+
                                  | 1
                                  |
                                  | *
+---------------------------------+---------------------------+
|                             Trial                           |
+---------------------------------+---------------------------+
         | 1                                        | 1
         | 1                                        | *
+--------+--------+                       +---------+---------+
|   Trajectory    |                       |     Artifact      |
+-----------------+                       +-------------------+
```

---

## Entities and Schema Details

### 1. `agents`
- `id`: String (UUID PK)
- `name`: String (Indexed)
- `description`: Text
- `framework`: String (e.g. `langchain`, `crewai`, `autogen`, `custom`, `harbor_native`)
- `version`: String
- `adapter_type`: String (e.g. `harbor_cli`, `simulator`, `custom_api`)
- `model_provider`: String (e.g. `anthropic`, `openai`, `google`, `mock`)
- `model_name`: String (e.g. `claude-3-7-sonnet`, `gpt-4o`, `simulator-v1`)
- `status`: String (`READY`, `UNVERIFIED`, `OFFLINE`)
- `is_demo`: Boolean (Flags demo/synthetic agents)
- `created_at`: DateTime (UTC)
- `updated_at`: DateTime (UTC)

### 2. `benchmark_tasks`
- `id`: String (UUID PK)
- `name`: String
- `category`: String (e.g. `code_generation`, `multi_hop_qa`, `tool_use`, `debugging`)
- `difficulty`: String (`EASY`, `MEDIUM`, `HARD`)
- `description`: Text
- `instruction`: Text
- `expected_outcome`: Text
- `verification_method`: String (`ASSERTION_SCRIPT`, `LLM_JUDGE`, `UNIT_TESTS`)
- `time_limit_seconds`: Integer (Default: 120)
- `environment_type`: String (`DOCKER_SANDBOX`, `LOCAL_PROCESS`)
- `is_demo`: Boolean
- `created_at`: DateTime

### 3. `failure_scenarios`
- `id`: String (UUID PK)
- `name`: String
- `code`: String (Unique, e.g. `TOOL_TIMEOUT`, `TOOL_HTTP_500`, `MALFORMED_OUTPUT`, `NETWORK_LATENCY`)
- `description`: Text
- `trigger_point`: String (`TOOL_CALL`, `PROVIDER_RESPONSE`, `ENVIRONMENT_INIT`)
- `parameters`: JSON
- `severity`: String (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)

### 4. `experiments`
- `id`: String (UUID PK)
- `title`: String
- `description`: Text
- `agent_id`: FK -> `agents.id`
- `benchmark_task_id`: FK -> `benchmark_tasks.id`
- `failure_scenario_id`: FK -> `failure_scenarios.id` (Nullable: clean run if null)
- `repetitions_k`: Integer (Default: 3, represents $k$ iterations for Pass@k / Pass^k)
- `timeout_seconds`: Integer
- `status`: String (`QUEUED`, `PREPARING`, `RUNNING`, `VERIFYING`, `COMPLETED`, `FAILED`, `CANCELLED`)
- `is_demo`: Boolean
- `created_at`: DateTime
- `started_at`: DateTime (Nullable)
- `completed_at`: DateTime (Nullable)

### 5. `runs` (Aggregated results for an experiment)
- `id`: String (UUID PK)
- `experiment_id`: FK -> `experiments.id`
- `total_trials`: Integer
- `successful_trials`: Integer
- `failed_trials`: Integer
- `pass_rate`: Float (0.0 to 1.0)
- `pass_at_k`: Float
- `pass_to_k`: Float (Pass^k)
- `recovery_rate`: Float (Nullable if no failure injected)
- `avg_duration_seconds`: Float
- `duration_variance`: Float
- `avg_cost_usd`: Float (Nullable)
- `total_tokens`: Integer (Nullable)
- `status`: String (`COMPLETED`, `FAILED`, `CANCELLED`)
- `created_at`: DateTime

### 6. `trials` (Individual run iteration $i \in \{1 \dots k\}$)
- `id`: String (UUID PK)
- `run_id`: FK -> `runs.id`
- `trial_number`: Integer
- `status`: String (`PASSED`, `FAILED`, `RECOVERED`, `TIMEOUT`)
- `reward_score`: Float (Normalized 0.0 to 1.0)
- `duration_seconds`: Float
- `failure_injected`: Boolean
- `failure_recovered`: Boolean
- `error_message`: Text (Nullable)
- `log_file_path`: String
- `created_at`: DateTime

### 7. `trajectories` (ATIF v1.8 metadata & pointer)
- `id`: String (UUID PK)
- `trial_id`: FK -> `trials.id`
- `atif_version`: String (`ATIF-v1.8`)
- `total_steps`: Integer
- `agent_name`: String
- `model_name`: String
- `prompt_tokens`: Integer
- `completion_tokens`: Integer
- `total_cost`: Float
- `storage_path`: String (Path to `artifacts/trajectories/<trial_id>.json`)
- `summary_steps`: JSON (Compact step timeline for fast UI rendering)

