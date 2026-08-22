import resource
import sys
import time

from fastapi import APIRouter, Request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.concurrency import run_in_threadpool

from api.endpoints.github import get_cache_stats
from config import settings
from core.db import SessionLocal, engine
from core.rate_limit import limiter
from schemas.telemetry import (
    START_TIME,
    CacheTelemetry,
    DatabaseTelemetry,
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


def _check_database() -> dict:
    """Run a lightweight DB liveness probe.

    Opens a short-lived session and executes ``SELECT 1``. Returns an
    ``{"status": "ok", "latency_ms": ...}`` dict on success, or
    ``{"status": "unhealthy", "error": ...}`` on failure. The readiness
    probe as a whole is reported as ``degraded`` (rather than failing)
    because data endpoints transparently fall back to static JSON, so the
    API remains functional without the database.
    """
    start = time.perf_counter()
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
        finally:
            db.close()
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"status": "ok", "latency_ms": latency_ms}
    except SQLAlchemyError as exc:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"status": "unhealthy", "latency_ms": latency_ms, "error": str(exc)}
    except Exception as exc:  # pragma: no cover - defensive catch-all
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        return {"status": "unhealthy", "latency_ms": latency_ms, "error": str(exc)}


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

    db_check = await run_in_threadpool(_check_database)

    checks = {
        "process_memory": {"status": "ok", "rss_mb": memory_mb},
        "process_uptime": {"status": "ok", "uptime_seconds": uptime},
        "environment": {"status": "ok", "env": settings.ENVIRONMENT},
        "cors_origins": {"status": "ok", "count": len(settings.cors_origins_list)},
        "database": db_check,
    }

    # The API serves cached/JSON data when the database is unreachable, so a
    # DB failure degrades rather than breaks the service.
    overall_status = "degraded" if db_check["status"] != "ok" else "healthy"

    return ReadinessCheckResponse(
        status=overall_status,
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

    db_check = await run_in_threadpool(_check_database)
    engine_type = engine.dialect.name
    database_data = DatabaseTelemetry(
        status=db_check.get("status", "unknown"),
        latency_ms=db_check.get("latency_ms"),
        engine=engine_type,
    )

    return TelemetryResponse(
        status="ok",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        process=process_data,
        cache=cache_data,
        rate_limit=rate_limit_data,
        database=database_data,
    )
