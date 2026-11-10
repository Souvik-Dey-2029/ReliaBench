import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reliabench"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./reliabench.db"
    
    # Storage roots
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    TRAJECTORIES_DIR: Path = ARTIFACTS_DIR / "trajectories"
    LOGS_DIR: Path = ARTIFACTS_DIR / "logs"
    REPORTS_DIR: Path = ARTIFACTS_DIR / "reports"
    
    # External integrations
    HARBOR_VERSION_REQUIRED: str = "v0.25.0"
    HARBOR_BIN_PATH: str = "harbor"
    ENABLE_BIFROST_GATEWAY: bool = False
    BIFROST_ENDPOINT: str = "http://localhost:8080/v1"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.TRAJECTORIES_DIR.mkdir(parents=True, exist_ok=True)
settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)

