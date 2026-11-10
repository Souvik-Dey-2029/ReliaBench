import json
import random
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.entities import Agent, BenchmarkTask, FailureScenario, Experiment, Run, Trial, Trajectory
from app.evaluation.metrics import ReliabilityMetricsCalculator
from app.core.config import settings

DEMO_AGENTS = [
    {
        "name": "Devin-Mock-v2",
        "description": "Autonomous software engineering agent configured with terminal and file tools.",
        "framework": "custom",
        "version": "2.4.0",
        "adapter_type": "simulator",
        "model_provider": "anthropic",
        "model_name": "claude-3-7-sonnet",
        "status": "READY",
        "is_demo": True
    },
    {
        "name": "Claude-Code-Sim",
        "description": "Agentic CLI assistant specializing in repo navigation, editing, and test repair.",
        "framework": "harbor_native",
        "version": "1.0.12",
        "adapter_type": "harbor_cli",
        "model_provider": "anthropic",
        "model_name": "claude-3-5-sonnet",
        "status": "READY",
        "is_demo": True
    },
    {
        "name": "AutoGPT-Ref",
        "description": "Classic autonomous loop agent testing long-horizon goal decomposition.",
        "framework": "autogen",
        "version": "0.5.2",
        "adapter_type": "simulator",
        "model_provider": "openai",
        "model_name": "gpt-4o",
        "status": "READY",
        "is_demo": True
    },
    {
        "name": "Gemini-CodeAgent",
        "description": "Multi-modal code reasoning agent with tool search capabilities.",
        "framework": "custom",
        "version": "3.8.0",
        "adapter_type": "simulator",
        "model_provider": "google",
        "model_name": "gemini-3-flash",
        "status": "READY",
        "is_demo": True
    }
]

DEMO_BENCHMARKS = [
    {
        "name": "BugFix: Django CSRF Middleware bypass",
        "category": "Security & Web",
        "difficulty": "HARD",
        "description": "Isolate and patch CVE regression where custom token headers are improperly validated.",
        "instruction": "Inspect django/middleware/csrf.py, identify the header parsing vulnerability, and write passing test cases in tests/test_csrf.py.",
        "expected_outcome": "All unit tests pass and security assertion returns exit 0.",
        "verification_method": "ASSERTION_SCRIPT",
        "time_limit_seconds": 240,
        "is_demo": True
    },
    {
        "name": "DataPipeline: Broken Pandas Aggregation",
        "category": "Data Engineering",
        "difficulty": "EASY",
        "description": "Fix timestamp truncation causing incorrect groupby sums across monthly time zones.",
        "instruction": "Fix transform.py to localize timestamps to UTC before month-end aggregation.",
        "expected_outcome": "Aggregated metrics match fixture table data/expected.csv exactly.",
        "verification_method": "UNIT_TESTS",
        "time_limit_seconds": 90,
        "is_demo": True
    },
    {
        "name": "APIMock: Payment Gateway Error Handling",
        "category": "Resilience & Tools",
        "difficulty": "MEDIUM",
        "description": "Ensure agent properly handles HTTP 429 rate limits and retries with exponential backoff.",
        "instruction": "Implement retry wrapper around mock Stripe checkout call without exceeding 3 attempts.",
        "expected_outcome": "Payment successfully confirms on attempt 3 without crashing.",
        "verification_method": "ASSERTION_SCRIPT",
        "time_limit_seconds": 120,
        "is_demo": True
    },
    {
        "name": "Refactor: SQL Model Optimization",
        "category": "Database & ORM",
        "difficulty": "MEDIUM",
        "description": "Resolve N+1 query problem by replacing naive iteration with SQLAlchemy joinedload.",
        "instruction": "Refactor queries.py get_user_orders to reduce DB roundtrips from 51 to 1.",
        "expected_outcome": "Query count assertion strictly equals 1.",
        "verification_method": "ASSERTION_SCRIPT",
        "time_limit_seconds": 150,
        "is_demo": True
    }
]

DEMO_FAILURES = [
    {
        "name": "Tool Execution Timeout",
        "code": "TOOL_TIMEOUT",
        "description": "Injected delay exceeding standard 15s subprocess tool execution budget.",
        "trigger_point": "TOOL_CALL",
        "severity": "HIGH",
        "parameters": {"delay_seconds": 20, "target_tool": "run_shell_command"}
    },
    {
        "name": "Tool HTTP 500 Server Error",
        "code": "TOOL_HTTP_500",
        "description": "Mock API service returns internal server error on initial call.",
        "trigger_point": "TOOL_CALL",
        "severity": "MEDIUM",
        "parameters": {"http_status": 500, "retry_after_attempts": 2}
    },
    {
        "name": "Malformed Tool JSON Response",
        "code": "MALFORMED_OUTPUT",
        "description": "Tool returns corrupted truncated JSON payload to test schema recovery.",
        "trigger_point": "TOOL_CALL",
        "severity": "MEDIUM",
        "parameters": {"corruption_type": "unclosed_brace"}
    },
    {
        "name": "Conflicting Instructions",
        "code": "CONFLICTING_PROMPT",
        "description": "Task context injects contradictory requirements testing agent disambiguation.",
        "trigger_point": "PROVIDER_RESPONSE",
        "severity": "LOW",
        "parameters": {"contradiction": "disallow_file_modification_while_asking_to_patch"}
    }
]

def seed_demo_data_if_empty(db: Session):
    """
    Checks if database is populated. If empty, seeds realistic, mathematically verified demo records.
    All demo records are clearly flagged with is_demo=True.
    """
    if db.query(Agent).first() is not None:
        return

    # 1. Create Agents
    agents_map = {}
    for a in DEMO_AGENTS:
        agent = Agent(**a)
        db.add(agent)
        db.flush()
        agents_map[agent.name] = agent

    # 2. Create Benchmarks
    benchmarks_map = {}
    for b in DEMO_BENCHMARKS:
        task = BenchmarkTask(**b)
        db.add(task)
        db.flush()
        benchmarks_map[task.name] = task

    # 3. Create Failures
    failures_map = {}
    for f in DEMO_FAILURES:
        scen = FailureScenario(**f)
        db.add(scen)
        db.flush()
        failures_map[scen.code] = scen

    # 4. Create Pre-seeded Benchmark Experiments with verified metrics
    exp_configs = [
        {
            "title": "Claude-Code: Django CSRF Security Patch (Clean)",
            "agent": agents_map["Claude-Code-Sim"],
            "task": benchmarks_map["BugFix: Django CSRF Middleware bypass"],
            "failure": None,
            "k": 3,
            "trial_durations": [24.2, 28.1, 25.5],
            "trial_statuses": ["PASSED", "PASSED", "PASSED"]
        },
        {
            "title": "Claude-Code: Payment Gateway with HTTP 500 Injection",
            "agent": agents_map["Claude-Code-Sim"],
            "task": benchmarks_map["APIMock: Payment Gateway Error Handling"],
            "failure": failures_map["TOOL_HTTP_500"],
            "k": 3,
            "trial_durations": [32.0, 36.4, 30.8],
            "trial_statuses": ["RECOVERED", "RECOVERED", "FAILED"]  # 2 recovered, 1 failed
        },
        {
            "title": "Devin-Mock: Broken Pandas Aggregation (Clean)",
            "agent": agents_map["Devin-Mock-v2"],
            "task": benchmarks_map["DataPipeline: Broken Pandas Aggregation"],
            "failure": None,
            "k": 3,
            "trial_durations": [18.5, 17.2, 19.8],
            "trial_statuses": ["PASSED", "PASSED", "PASSED"]
        },
        {
            "title": "AutoGPT-Ref: Payment Gateway with Timeout Injection",
            "agent": agents_map["AutoGPT-Ref"],
            "task": benchmarks_map["APIMock: Payment Gateway Error Handling"],
            "failure": failures_map["TOOL_TIMEOUT"],
            "k": 3,
            "trial_durations": [45.1, 48.0, 42.9],
            "trial_statuses": ["FAILED", "RECOVERED", "FAILED"]  # 1 recovered, 2 failed
        }
    ]

    for cfg in exp_configs:
        exp = Experiment(
            title=cfg["title"],
            description="Automated baseline experiment testing reliability & repeatability.",
            agent_id=cfg["agent"].id,
            benchmark_task_id=cfg["task"].id,
            failure_scenario_id=cfg["failure"].id if cfg["failure"] else None,
            repetitions_k=cfg["k"],
            timeout_seconds=cfg["task"].time_limit_seconds,
            status="COMPLETED",
            is_demo=True,
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc)
        )
        db.add(exp)
        db.flush()

        # Compute metrics
        k = cfg["k"]
        durations = cfg["trial_durations"]
        statuses = cfg["trial_statuses"]
        success_count = sum(1 for s in statuses if s in ("PASSED", "RECOVERED"))
        fail_count = len(statuses) - success_count
        recoveries = sum(1 for s in statuses if s == "RECOVERED")
        injected = len(statuses) if cfg["failure"] else 0

        pass_rate = ReliabilityMetricsCalculator.calculate_pass_rate(success_count, len(statuses))
        pass_at_k = ReliabilityMetricsCalculator.calculate_pass_at_k(len(statuses), success_count, k)
        pass_to_k = ReliabilityMetricsCalculator.calculate_pass_to_k(len(statuses), success_count, k)
        recovery_rate = ReliabilityMetricsCalculator.calculate_recovery_rate(recoveries, injected)
        dur_stats = ReliabilityMetricsCalculator.calculate_duration_metrics(durations)

        run = Run(
            experiment_id=exp.id,
            total_trials=len(statuses),
            successful_trials=success_count,
            failed_trials=fail_count,
            pass_rate=pass_rate,
            pass_at_k=pass_at_k,
            pass_to_k=pass_to_k,
            recovery_rate=recovery_rate,
            avg_duration_seconds=dur_stats["avg_duration"],
            duration_variance=dur_stats["variance"],
            avg_cost_usd=round(random.uniform(0.0015, 0.0042), 4),
            total_tokens=random.randint(2800, 7500),
            status="COMPLETED"
        )
        db.add(run)
        db.flush()

        for idx, (dur, st) in enumerate(zip(durations, statuses), start=1):
            is_fail_injected = (cfg["failure"] is not None)
            is_recovered = (st == "RECOVERED")
            err_msg = f"Injected failure {cfg['failure'].name} encountered and unhandled." if st == "FAILED" and is_fail_injected else None

            trial = Trial(
                run_id=run.id,
                trial_number=idx,
                status=st,
                reward_score=1.0 if st in ("PASSED", "RECOVERED") else 0.0,
                duration_seconds=dur,
                failure_injected=is_fail_injected,
                failure_recovered=is_recovered,
                error_message=err_msg
            )
            db.add(trial)
            db.flush()

            # Create sample ATIF Trajectory record & file
            traj_filename = f"trial_{trial.id}.json"
            traj_path = settings.TRAJECTORIES_DIR / traj_filename

            atif_data = {
                "schema_version": "ATIF-v1.8",
                "session_id": f"sess_{trial.id[:8]}",
                "trajectory_id": f"reliabench:{trial.id}",
                "agent": {
                    "name": cfg["agent"].name,
                    "version": cfg["agent"].version,
                    "model_name": cfg["agent"].model_name,
                    "tool_definitions": [
                        {"name": "run_shell_command", "description": "Execute shell command in sandbox"},
                        {"name": "read_file", "description": "Read file contents"},
                        {"name": "write_file", "description": "Write patched file content"}
                    ]
                },
                "steps": [
                    {
                        "step_id": 1,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "user",
                        "message": cfg["task"].instruction
                    },
                    {
                        "step_id": 2,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "agent",
                        "message": f"Analyzing task instructions for {cfg['task'].name}.",
                        "reasoning_content": "Inspecting workspace and executing initial test suite to verify current failure state.",
                        "tool_calls": [
                            {
                                "tool_call_id": f"call_{trial.id[:6]}_1",
                                "function_name": "run_shell_command",
                                "arguments": {"command": "pytest -v"}
                            }
                        ],
                        "metrics": {"prompt_tokens": 520, "completion_tokens": 68, "cached_tokens": 120, "cost": 0.0012}
                    },
                    {
                        "step_id": 3,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "system",
                        "observation": {
                            "results": [
                                {
                                    "tool_call_id": f"call_{trial.id[:6]}_1",
                                    "content": "FAILED tests/test_security.py - AssertionError: 401 != 200" if st != "FAILED" else "Error: Subprocess timeout / HTTP 500",
                                    "is_error": (st == "FAILED")
                                }
                            ]
                        }
                    },
                    {
                        "step_id": 4,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "agent",
                        "message": "Applying fix to target module and verifying assertions." if st in ("PASSED", "RECOVERED") else "Agent failed to recover from tool fault.",
                        "reasoning_content": "The error was identified. Handling exception and applying recovery fallback." if is_recovered else "Finalizing test assertions.",
                        "tool_calls": [
                            {
                                "tool_call_id": f"call_{trial.id[:6]}_2",
                                "function_name": "write_file",
                                "arguments": {"path": "src/patch.py", "content": "# patched"}
                            }
                        ],
                        "metrics": {"prompt_tokens": 780, "completion_tokens": 145, "cached_tokens": 300, "cost": 0.0021}
                    },
                    {
                        "step_id": 5,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "source": "system",
                        "observation": {
                            "results": [
                                {
                                    "tool_call_id": f"call_{trial.id[:6]}_2",
                                    "content": "SUCCESS: All 12 assertions passed. Verifier reward = 1.0" if st in ("PASSED", "RECOVERED") else "FAILURE: Verifier reward = 0.0",
                                    "is_error": (st == "FAILED")
                                }
                            ]
                        }
                    }
                ],
                "final_metrics": {
                    "total_prompt_tokens": 1300,
                    "total_completion_tokens": 213,
                    "total_cost": 0.0033
                }
            }

            with open(traj_path, "w", encoding="utf-8") as f:
                json.dump(atif_data, f, indent=2)

            trajectory = Trajectory(
                trial_id=trial.id,
                atif_version="ATIF-v1.8",
                total_steps=5,
                agent_name=cfg["agent"].name,
                model_name=cfg["agent"].model_name,
                prompt_tokens=1300,
                completion_tokens=213,
                total_cost=0.0033,
                storage_path=str(traj_path),
                summary_steps=[
                    {"step": 1, "type": "user_instruction", "desc": "User prompt"},
                    {"step": 2, "type": "tool_call", "tool": "run_shell_command"},
                    {"step": 3, "type": "observation", "status": "error" if st == "FAILED" else "ok"},
                    {"step": 4, "type": "recovery" if is_recovered else "agent_action", "tool": "write_file"},
                    {"step": 5, "type": "verifier_result", "reward": 1.0 if st in ("PASSED", "RECOVERED") else 0.0}
                ]
            )
            db.add(trajectory)

    db.commit()

