from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenAI Configuration (Phase 2+)
    openai_api_key: str = ""  # Optional for Phase 1

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Cache Configuration (Phase 2+)
    cache_expiry_days: int = 90

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
