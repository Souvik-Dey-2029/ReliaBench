import shutil
import subprocess
import os
from typing import Dict, Any, Optional

class HarborAdapter:
    """
    Subprocess-based integration adapter for Harbor v0.25.0.
    Wraps CLI invocations (`harbor run`) safely using argument lists.
    Validates Docker daemon and Harbor binary presence.
    """

    def __init__(self, bin_path: str = "harbor", required_version: str = "v0.25.0"):
        self.bin_path = bin_path
        self.required_version = required_version

    def check_availability(self) -> Dict[str, Any]:
        """
        Inspects whether Harbor CLI and Docker daemon are accessible.
        """
        cli_path = shutil.which(self.bin_path)
        docker_path = shutil.which("docker")
        
        docker_available = False
        docker_version_str = None
        if docker_path:
            try:
                res = subprocess.run(["docker", "info"], capture_output=True, timeout=3)
                docker_available = (res.returncode == 0)
                if docker_available:
                    ver_res = subprocess.run(["docker", "--version"], capture_output=True, text=True, timeout=3)
                    docker_version_str = ver_res.stdout.strip()
            except Exception:
                docker_available = False

        if not cli_path:
            return {
                "available": False,
                "installed_version": None,
                "required_version": self.required_version,
                "docker_available": docker_available,
                "docker_version": docker_version_str,
                "status": "CLI_NOT_INSTALLED",
                "mode": "SIMULATOR_FALLBACK"
            }

        # Check Harbor version
        try:
            ver_res = subprocess.run([self.bin_path, "--version"], capture_output=True, text=True, timeout=5)
            installed_ver = ver_res.stdout.strip()
            return {
                "available": True,
                "installed_version": installed_ver,
                "required_version": self.required_version,
                "docker_available": docker_available,
                "docker_version": docker_version_str,
                "status": "READY" if docker_available else "DOCKER_UNAVAILABLE",
                "mode": "NATIVE_HARBOR" if docker_available else "SIMULATOR_FALLBACK"
            }
        except Exception as e:
            return {
                "available": False,
                "installed_version": None,
                "required_version": self.required_version,
                "docker_available": docker_available,
                "status": f"ERROR: {str(e)}",
                "mode": "SIMULATOR_FALLBACK"
            }

    def build_run_command(self, task_path: str, agent_name: str, model_name: Optional[str] = None) -> list[str]:
        """
        Builds safe argument array for harbor run. No raw shell string interpolation.
        """
        cmd = [self.bin_path, "run", "-p", task_path, "-a", agent_name]
        if model_name:
            cmd.extend(["-m", model_name])
        return cmd

