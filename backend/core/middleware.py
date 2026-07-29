import json
import logging
import sys
import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Configure logger for structured stdout logging
logger = logging.getLogger("personal_os.access")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(handler)
    logger.propagate = False


class CorrelationIDMiddleware(BaseHTTPMiddleware):
    """Middleware that injects or propagates a unique X-Request-ID header."""

    async def dispatch(self, request: Request, call_next) -> Response:
        header_request_id = request.headers.get("X-Request-ID")
        request_id = header_request_id if header_request_id else str(uuid.uuid4())
        request.state.request_id = request_id

        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs HTTP request details in structured JSON format."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        response: Response = await call_next(request)
        process_time_ms = round((time.time() - start_time) * 1000, 2)

        client_ip = request.client.host if request.client else "unknown"
        request_id = getattr(request.state, "request_id", "unknown")

        log_data = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "latency_ms": process_time_ms,
            "client_ip": client_ip,
            "user_agent": request.headers.get("user-agent", "unknown"),
        }

        logger.info(json.dumps(log_data))
        return response
