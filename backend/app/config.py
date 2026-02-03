from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB Configuration
    mongodb_uri: str
    database_name: str = "tool_parts_finder"

    # OpenAI Configuration (Phase 2+)
    openai_api_key: str = ""  # Optional for Phase 1

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"  # Railway env var format

    # Cache Configuration (Phase 2+)
    cache_expiry_days: int = 90
    search_history_limit: int = 50  # Phase 1: Keep last 50 searches

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
