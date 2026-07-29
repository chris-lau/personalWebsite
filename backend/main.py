import sys
import traceback

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import settings
from core.middleware import CorrelationIDMiddleware, RequestLoggingMiddleware
from core.rate_limit import limiter
from core.security import SecurityHeadersMiddleware

app = FastAPI(
    title="Personal OS API",
    description=(
        "Backend API service for personal portfolio website, featuring profile data, project showcases, telemetry, and GitHub stats proxy.\n\n"
        "⚠️ **Container Inactivity Cold Start Notice:** This API is hosted on Render's free-tier container infrastructure, which automatically spins down after 15 minutes of inactivity.\n\n"
        "The **very first request** sent to ANY endpoint — including testing endpoints via this Swagger UI (/docs), triggering health probes, or frontend fetches — "
        "will experience a **50+ second wake-up delay** while Render provisions and boots the Docker container. Once awake, all subsequent requests execute in sub-50ms."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Attach Slowapi State & Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Attach Middleware Stack
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CorrelationIDMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
is_wildcard = "*" in settings.cors_origins_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 3. Global 500 Error Sanitizer with Stack Trace Logging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    sys.stderr.write(
        f"[ERROR] [request_id={request_id}] Unhandled Exception: {exc}\n"
        f"{traceback.format_exc()}\n"
    )
    sys.stderr.flush()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
        headers={"X-Request-ID": request_id},
    )


# 4. Health Check Endpoints
@app.get("/health", tags=["Health"])
@app.get("/health/live", tags=["Health"])
@limiter.limit("120/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "service": "Personal OS FastAPI Backend",
    }


@app.get("/health/ready", tags=["Health"])
@limiter.limit("60/minute")
async def health_ready_check(request: Request):
    from api.endpoints.telemetry import health_ready
    return await health_ready(request)



# 5. Include Master API Router
from api.router import api_router

app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)

