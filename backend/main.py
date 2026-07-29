from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from config import settings
from core.rate_limit import limiter
from core.security import SecurityHeadersMiddleware

app = FastAPI(
    title="Personal OS API",
    description="Backend API service for personal portfolio website, featuring profile data, project showcases, and GitHub stats proxy.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Attach Slowapi State & Exception Handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. Attach Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 3. Attach CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


# 4. Global 500 Error Sanitizer
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred."},
    )


# 5. Health Check Endpoint
@app.get("/health", tags=["Health"])
@limiter.limit("120/minute")
async def health_check(request: Request):
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "service": "Personal OS FastAPI Backend",
    }


# 6. Include Master API Router
from api.router import api_router

app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
