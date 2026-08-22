import sys
import time
from typing import Any, Optional

from pydantic import BaseModel, Field

START_TIME = time.time()


class ProcessTelemetry(BaseModel):
    uptime_seconds: float = Field(..., description="Process uptime in seconds")
    memory_rss_mb: float = Field(..., description="Resident Set Size memory in MB")
    python_version: str = Field(default_factory=lambda: sys.version.split()[0])
    environment: str = Field(..., description="Runtime environment")


class CacheTelemetry(BaseModel):
    github_cache_hits: int = Field(default=0, description="GitHub proxy cache hit count")
    github_cache_misses: int = Field(default=0, description="GitHub proxy cache miss count")
    ttl_seconds: int = Field(default=900, description="Cache TTL in seconds")
    is_cached: bool = Field(default=False, description="Cache status")


class RateLimitTelemetry(BaseModel):
    limit_per_minute: int = Field(default=60, description="Rate limit per minute")
    active_window: str = Field(default="60/minute", description="Active window specification")


class DatabaseTelemetry(BaseModel):
    status: str = Field(default="ok", description="Database health status: ok or unhealthy")
    latency_ms: Optional[float] = Field(default=None, description="Database ping latency in milliseconds")
    engine: str = Field(default="postgresql", description="Database engine type (e.g. postgresql, sqlite)")


class TelemetryResponse(BaseModel):
    status: str = "ok"
    timestamp: str = Field(..., description="ISO 8601 server timestamp")
    process: ProcessTelemetry
    cache: CacheTelemetry
    rate_limit: RateLimitTelemetry
    database: Optional[DatabaseTelemetry] = None


class ReadinessCheckResponse(BaseModel):
    status: str = Field(..., description="Overall readiness status: healthy or degraded")
    timestamp: str = Field(..., description="ISO 8601 server timestamp")
    checks: dict[str, Any] = Field(..., description="Subsystem readiness check results")
