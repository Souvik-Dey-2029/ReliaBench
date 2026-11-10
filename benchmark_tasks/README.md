# Reliabench Benchmark Tasks (AgentClash Challenge Pack Format)

This directory contains standardized benchmark tasks used by Reliabench to evaluate autonomous agent capability and repeatability.

Tasks follow the declarative specification:
- `task.toml` or `task.json`: Metadata, time limits, memory limits, docker base images, and verifier definitions.
- `instruction.md`: Natural language task instruction delivered to the agent in Step 1 of the ATIF trajectory.
- `tests/test.sh` or verifier scripts: Verification assertions computing numerical rewards (0.0 to 1.0) and writing to `logs/verifier/reward.json`.

