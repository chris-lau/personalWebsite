from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = Field(default="development")
    PORT: int = Field(default=8000)

    # CORS Origins
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://chrislau.dev,https://www.chrislau.dev,https://personalwebsite-8i8.pages.dev,https://chris-lau.pages.dev,https://chrislau.pages.dev,https://chris-lau-storybook.pages.dev"
    )
    CORS_ORIGINS: str = Field(default="")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)

    # GitHub API Token (Optional locally, recommended for production)
    GITHUB_TOKEN: str = Field(default="")

    # Database connection URL
    DATABASE_URL: str = Field(default="sqlite:///./personal_os.db")

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS and CORS_ORIGINS into a clean list of strings."""
        combined = f"{self.ALLOWED_ORIGINS},{self.CORS_ORIGINS}"
        origins = [origin.strip().rstrip("/") for origin in combined.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:5173", "https://chrislau.dev"]


settings = Settings()
