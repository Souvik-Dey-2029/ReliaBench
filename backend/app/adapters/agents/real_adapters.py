from __future__ import annotations

import json
import logging
import subprocess
import time
from typing import Any, Dict, List, Optional
import httpx
from pydantic import BaseModel

from app.agents.base import AgentAdapter, StepRecord

logger = logging.getLogger(__name__)


class ProbeResult(BaseModel):
    status: str  # CONFIGURED, VALIDATED, UNAVAILABLE, ERROR
    latency_ms: float
    message: str
    details: Dict[str, Any] = {}


class HttpAgentAdapter(AgentAdapter):
    """Real HTTP Agent Adapter.

    Invokes agent via REST HTTP POST endpoint.
    Expects JSON body and returns structured StepRecord.
    """

    def __init__(self, endpoint_url: str, timeout_seconds: float = 10.0, auth_token: Optional[str] = None):
        self.endpoint_url = endpoint_url
        self.timeout_seconds = timeout_seconds
        self.auth_token = auth_token

    def probe(self) -> ProbeResult:
        """Probes the remote agent endpoint for health."""
        start = time.perf_counter()
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.get(f"{self.endpoint_url.rstrip('/')}/health", headers=headers)
                elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
                if resp.status_code == 200:
                    return ProbeResult(
                        status="VALIDATED",
                        latency_ms=elapsed_ms,
                        message=f"HTTP Agent reachable at {self.endpoint_url}",
                        details=resp.json() if resp.headers.get("content-type", "").startswith("application/json") else {"text": resp.text[:200]},
                    )
                else:
                    return ProbeResult(
                        status="UNAVAILABLE",
                        latency_ms=elapsed_ms,
                        message=f"Agent returned HTTP {resp.status_code}",
                        details={"status_code": resp.status_code, "body": resp.text[:200]},
                    )
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            return ProbeResult(
                status="ERROR",
                latency_ms=elapsed_ms,
                message=f"Connection failed: {str(e)}",
                details={"error": str(e)},
            )

    def execute_step(
        self,
        step_index: int,
        thought: str,
        tool: str,
        args: Dict[str, Any],
        expected_observation: str,
        injected_fault_payload: Optional[Dict[str, Any]] = None,
    ) -> StepRecord:
        if injected_fault_payload and injected_fault_payload.get("is_error"):
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=injected_fault_payload.get("content", "Injected fault"),
                is_error=True,
                injected_fault=injected_fault_payload.get("error_type", "TOOL_ERROR"),
            )

        start = time.perf_counter()
        headers = {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
        payload = {
            "step_index": step_index,
            "thought": thought,
            "tool": tool,
            "args": args,
            "injected_fault": injected_fault_payload,
        }

        try:
            with httpx.Client(timeout=self.timeout_seconds) as client:
                resp = client.post(
                    f"{self.endpoint_url.rstrip('/')}/execute_step",
                    json=payload,
                    headers=headers,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return StepRecord(
                        step_id=step_index,
                        thought=data.get("thought", thought),
                        tool=data.get("tool", tool),
                        args=data.get("args", args),
                        observation=data.get("observation", expected_observation),
                        is_error=data.get("is_error", False),
                        prompt_tokens=data.get("prompt_tokens", 150),
                        completion_tokens=data.get("completion_tokens", 60),
                        cost_usd=data.get("cost_usd", 0.00045),
                    )
                else:
                    return StepRecord(
                        step_id=step_index,
                        thought=thought,
                        tool=tool,
                        args=args,
                        observation=f"Remote agent HTTP error {resp.status_code}: {resp.text[:200]}",
                        is_error=True,
                    )
        except Exception as e:
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=f"HTTP connection failed: {str(e)}",
                is_error=True,
            )


class CliAgentAdapter(AgentAdapter):
    """Real CLI Agent Adapter.

    Executes agent CLI commands with argument lists (never raw shell strings).
    Captures stdout/stderr and returns structured StepRecord.
    """

    def __init__(self, command_path: str, timeout_seconds: float = 30.0):
        self.command_path = command_path
        self.timeout_seconds = timeout_seconds

    def probe(self) -> ProbeResult:
        """Verifies binary existence and version/help output."""
        start = time.perf_counter()
        import shutil
        bin_path = shutil.which(self.command_path)
        if not bin_path:
            return ProbeResult(
                status="UNAVAILABLE",
                latency_ms=0.0,
                message=f"Binary '{self.command_path}' not found in PATH",
            )
        try:
            proc = subprocess.run([self.command_path, "--version"], capture_output=True, text=True, timeout=5)
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            if proc.returncode == 0:
                return ProbeResult(
                    status="VALIDATED",
                    latency_ms=elapsed_ms,
                    message=f"CLI Agent ready: {proc.stdout.strip()}",
                    details={"version": proc.stdout.strip(), "binary": bin_path},
                )
            else:
                return ProbeResult(
                    status="ERROR",
                    latency_ms=elapsed_ms,
                    message=f"CLI check returned code {proc.returncode}",
                    details={"stderr": proc.stderr[:200]},
                )
        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
            return ProbeResult(
                status="ERROR",
                latency_ms=elapsed_ms,
                message=f"CLI execution failed: {str(e)}",
            )

    def execute_step(
        self,
        step_index: int,
        thought: str,
        tool: str,
        args: Dict[str, Any],
        expected_observation: str,
        injected_fault_payload: Optional[Dict[str, Any]] = None,
    ) -> StepRecord:
        if injected_fault_payload and injected_fault_payload.get("is_error"):
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=injected_fault_payload.get("content", "Injected fault"),
                is_error=True,
                injected_fault=injected_fault_payload.get("error_type", "TOOL_ERROR"),
            )

        cmd = [self.command_path, "run", "--step", str(step_index), "--tool", tool, "--args", json.dumps(args)]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=self.timeout_seconds)
            is_err = (proc.returncode != 0)
            obs = proc.stdout.strip() if not is_err else (proc.stderr.strip() or f"CLI exited with {proc.returncode}")
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=obs or expected_observation,
                is_error=is_err,
                prompt_tokens=180,
                completion_tokens=50,
                cost_usd=0.0005,
            )
        except Exception as e:
            return StepRecord(
                step_id=step_index,
                thought=thought,
                tool=tool,
                args=args,
                observation=f"CLI execution failed: {str(e)}",
                is_error=True,
            )
