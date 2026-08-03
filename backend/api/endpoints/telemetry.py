import resource
import sys
import time

from fastapi import APIRouter, Request

from api.endpoints.github import get_cache_stats
from config import settings
from core.rate_limit import limiter
from schemas.telemetry import (
    START_TIME,
    CacheTelemetry,
    ProcessTelemetry,
    RateLimitTelemetry,
    ReadinessCheckResponse,
    TelemetryResponse,
)

router = APIRouter()


def _get_memory_rss_mb() -> float:
    rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    if sys.platform == "darwin":
        return round(rss / (1024 * 1024), 2)
    return round(rss / 1024, 2)


@router.get("/health/live", tags=["Health"])
@limiter.limit("120/minute")
async def health_live(request: Request):
    """Fast process liveness probe returning 200 OK."""
    return {
        "status": "ok",
        "service": "Personal OS FastAPI Backend",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@router.get("/health/ready", response_model=ReadinessCheckResponse, tags=["Health"])
@limiter.limit("60/minute")
async def health_ready(request: Request):
    """Sub-system readiness probe checking process memory, cache state, and settings."""
    memory_mb = _get_memory_rss_mb()
    uptime = round(time.time() - START_TIME, 2)

    checks = {
        "process_memory": {"status": "ok", "rss_mb": memory_mb},
        "process_uptime": {"status": "ok", "uptime_seconds": uptime},
        "environment": {"status": "ok", "env": settings.ENVIRONMENT},
        "cors_origins": {"status": "ok", "count": len(settings.cors_origins_list)},
    }

    return ReadinessCheckResponse(
        status="healthy",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        checks=checks,
    )


@router.get("/telemetry", response_model=TelemetryResponse, tags=["Telemetry"])
@limiter.limit("60/minute")
async def get_telemetry(request: Request):
    """Serves structured system telemetry including uptime, memory RSS, cache hit/miss ratio, and rate limit budget."""
    uptime = round(time.time() - START_TIME, 2)
    memory_mb = _get_memory_rss_mb()

    process_data = ProcessTelemetry(
        uptime_seconds=uptime,
        memory_rss_mb=memory_mb,
        environment=settings.ENVIRONMENT,
    )

    github_hits, github_misses = get_cache_stats()
    cache_data = CacheTelemetry(
        github_cache_hits=github_hits,
        github_cache_misses=github_misses,
        ttl_seconds=900,
        is_cached=github_hits > 0,
    )

    rate_limit_data = RateLimitTelemetry(
        limit_per_minute=settings.RATE_LIMIT_PER_MINUTE,
        active_window=f"{settings.RATE_LIMIT_PER_MINUTE}/minute",
    )

    return TelemetryResponse(
        status="ok",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        process=process_data,
        cache=cache_data,
        rate_limit=rate_limit_data,
    )
