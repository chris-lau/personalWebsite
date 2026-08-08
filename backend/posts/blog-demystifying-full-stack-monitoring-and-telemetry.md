# Demystifying Full-Stack Operational Monitoring & Telemetry: Zero-Cost Observability from Browser RUM to FastAPI Middleware

Modern web applications often rely on expensive third-party APM SaaS platforms (like Datadog, New Relic, or Sentry) to gain visibility into performance and errors. However, for personal websites, microservices, and lean engineering teams, building **in-house, zero-cost full-stack telemetry** is both highly educational and remarkably effective.

In this deep dive, we explore how to build a production-grade operational monitoring system across a **React 18 SPA** and a **Python FastAPI backend** without adding external dependencies, databases, or tracking cookies.

---

## 1. The Core Pillars of Operational Telemetry

Effective observability rests on three foundational capabilities:

1. **Distributed Request Correlation**: Tracking an HTTP request as it travels from client to backend server logs.
2. **Structured Machine-Readable Logging**: Emitting JSON formatted logs to `stdout` rather than unformatted plain text.
3. **Deep Sub-System Health Probes & Synthetic Diagnostics**: Differentiating between simple liveness (`is process running?`) and deep readiness (`are downstream services and memory healthy?`).

---

## 2. Step 1: Distributed Request Correlation with Middleware

When a user triggers an API request, identifying that specific request in backend server logs can be challenging when thousands of concurrent requests are executing. 

We solve this using a custom FastAPI middleware: **`CorrelationIDMiddleware`**.

```python
import re
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class CorrelationIDMiddleware(BaseHTTPMiddleware):
    # Allow word chars and hyphens, 1-128 chars.
    # Rejects anything containing newlines, CRLF, spaces, or other injection vectors.
    _VALID_REQUEST_ID = re.compile(r"^[\w\-]{1,128}$")

    async def dispatch(self, request: Request, call_next) -> Response:
        header_request_id = request.headers.get("X-Request-ID")
        # Validate client-supplied ID to prevent header/log injection (CRLF, oversize).
        if header_request_id and self._VALID_REQUEST_ID.match(header_request_id):
            request_id = header_request_id
        else:
            request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        response = await call_next(request)

        # Attach X-Request-ID to response header for client correlation
        response.headers["X-Request-ID"] = request_id
        return response
```

Every incoming request receives a unique UUIDv4. If the client passes an `X-Request-ID` header, the backend validates it against a strict character/length allowlist (`^[\w\-]{1,128}$`) before accepting it. This prevents **header injection and log injection attacks** — a malicious client cannot embed CRLF sequences or oversized payloads into your response headers or stderr logs. Invalid IDs are silently replaced with a fresh UUID.

---

## 3. Step 2: Structured JSON Access Logging

Standard `print()` statements or plain text logs make log aggregation (such as Loki, CloudWatch, or Datadog) difficult. By writing structured JSON access logs to `stdout`, logs become instantly queryable.

```python
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        log_payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "request_id": getattr(request.state, "request_id", "N/A"),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms,
            "client_ip": request.client.host if request.client else "unknown",
            "user_agent": request.headers.get("user-agent", "unknown"),
        }
        logger.info(json.dumps(log_payload))
        return response
```

### Log Output Example:
```json
{
  "timestamp": "2026-07-29T03:30:00.000Z",
  "request_id": "a9e81b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
  "method": "GET",
  "path": "/api/telemetry",
  "status_code": 200,
  "latency_ms": 1.45,
  "client_ip": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```

---

## 4. Step 3: Differentiated Health Probes (`/health/live` vs `/health/ready`)

Kubernetes and cloud platforms like Render use health probes to manage container lifecycles:

- **`/health/live` & `/api/health/live` (Liveness Probes)**: Fast endpoints returning `HTTP 200 {"status": "ok"}` to verify the Python process has not deadlocked. Dual-path routing ensures both root and `/api` probes resolve seamlessly.
- **`/health/ready` & `/api/health/ready` (Readiness Probes)**: Deep probes inspecting memory usage (RSS in MB), uptime, environment configuration, and executing a live `SELECT 1` database query against Aiven PostgreSQL. If the database is unreachable, the readiness status degrades gracefully without throwing a 500 error screen.
- **`/api/telemetry` (Operational Telemetry)**: Returns comprehensive runtime metrics including RSS memory, uptime seconds, rate limiter budgets (`slowapi`), and GitHub proxy cache hit/miss stats.

```python
@router.get("/health/ready", response_model=ReadinessCheckResponse)
async def health_ready(request: Request):
    memory_mb = _get_memory_rss_mb()
    uptime = round(time.time() - START_TIME, 2)
    db_check = _check_database()  # Executes SELECT 1 probe against SessionLocal()

    checks = {
        "process_memory": {"status": "ok", "rss_mb": memory_mb},
        "process_uptime": {"status": "ok", "uptime_seconds": uptime},
        "environment": {"status": "ok", "env": settings.ENVIRONMENT},
        "cors_origins": {"status": "ok", "count": len(settings.cors_origins_list)},
        "database": db_check,
    }
    overall_status = "degraded" if db_check["status"] != "ok" else "healthy"
    return ReadinessCheckResponse(status=overall_status, timestamp=..., checks=checks)
```

---

## 5. Step 4: Browser Real User Monitoring (RUM) & Synthetic Diagnostics

On the frontend React application, we measure performance directly in the user's browser using native Web APIs:

```typescript
export const getBrowserPerformanceMetrics = (): BrowserPerformanceMetrics => {
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;

  return {
    ttfbMs: navEntry ? Math.round(navEntry.responseStart - navEntry.requestStart) : 0,
    domNodeCount: document.getElementsByTagName('*').length,
    usedJSHeapSizeMB: memory ? Math.round(memory.usedJSHeapSize / (1024 * 1024)) : undefined,
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  };
};
```

### Synthetic E2E Diagnostic Runner
Our live monitoring console provides an automated 5-step synthetic diagnostic runner that tests client storage integrity, network round-trip time (RTT), backend readiness, GitHub proxy TTL cache status, and rate limit enforcement in real-time. Each check reports genuine pass/fail status based on actual HTTP responses — the GitHub proxy check verifies the `/api/github-summary` endpoint responds, and the rate-limiter check reads real `X-RateLimit-Limit` and `X-RateLimit-Remaining` response headers rather than assuming success.

---

## Conclusion

With structured JSON logging, distributed UUID request correlation, process health probes, browser RUM, and synthetic E2E diagnostics, we achieve **complete full-stack operational observability** without relying on third-party tracking or paid APM services.

Check out the live operational monitoring dashboard at `/monitoring` to test these probes live in your browser!
