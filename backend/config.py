from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)
    
    # CORS Origins
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    
    # GitHub API Token (Optional locally, recommended for production)
    GITHUB_TOKEN: str = Field(default="")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse comma-separated ALLOWED_ORIGINS into a clean list of strings."""
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:5173"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
