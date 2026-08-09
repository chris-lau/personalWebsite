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

    # AI Chat — provider keys (all optional; only configure the ones you use).
    # One openai-compatible client serves all three providers.
    GEMINI_API_KEY: str = Field(default="")
    DEEPSEEK_API_KEY: str = Field(default="")
    OPENAI_API_KEY: str = Field(default="")
    CHAT_DEFAULT_MODEL: str = Field(default="gemini-2.0-flash")
    # Stricter per-IP limit than the global RATE_LIMIT_PER_MINUTE.
    CHAT_RATE_LIMIT_PER_MINUTE: int = Field(default=10)
    # Daily cost-abuse caps (in-memory, reset at UTC midnight). The global cap
    # protects the LLM budget across all visitors; the per-IP cap is a fairness
    # backstop against a single user monopolizing it. Set to 0 to disable.
    CHAT_DAILY_GLOBAL_LIMIT: int = Field(default=200)
    CHAT_DAILY_PER_IP_LIMIT: int = Field(default=30)

    # Database connection URL
    DATABASE_URL: str = Field(default="sqlite:///./personal_os.db")

    # Authentication & Security
    JWT_SECRET_KEY: str = Field(default="dev_secret_key_change_in_production_32bytes_min")
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=480)  # 8 hours

    ADMIN_USERNAME: str = Field(default="admin")
    ADMIN_PASSWORD_HASH: str = Field(default="")

    # OAuth Settings (GitHub & Google)
    GITHUB_CLIENT_ID: str = Field(default="")
    GITHUB_CLIENT_SECRET: str = Field(default="")
    GOOGLE_CLIENT_ID: str = Field(default="")
    GOOGLE_CLIENT_SECRET: str = Field(default="")

    # Allowlisted Admin Users (Comma-separated GitHub handles / Google emails)
    ALLOWED_ADMIN_USERS: str = Field(default="admin,chrislau")

    @property
    def allowed_admin_users_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ADMIN_USERS into a clean list of lowercased strings."""
        return [u.strip().lower() for u in self.ALLOWED_ADMIN_USERS.split(",") if u.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated ALLOWED_ORIGINS and CORS_ORIGINS into a clean list of strings."""
        combined = f"{self.ALLOWED_ORIGINS},{self.CORS_ORIGINS}"
        origins = [origin.strip().rstrip("/") for origin in combined.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:5173", "https://chrislau.dev"]


settings = Settings()

