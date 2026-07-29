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
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

class CorrelationIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract existing X-Request-ID or generate a new UUIDv4
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        response = await call_next(request)
        
        # Attach X-Request-ID to response header for client correlation
        response.headers["X-Request-ID"] = request_id
        return response
```

Every incoming request receives a unique UUIDv4. If the client passes an `X-Request-ID` header, the backend preserves it, enabling true end-to-end distributed request tracing!

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
  "path": "/api/v1/telemetry",
  "status_code": 200,
  "latency_ms": 1.45,
  "client_ip": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```

---

## 4. Step 3: Differentiated Health Probes (`/health/live` vs `/health/ready`)

Kubernetes and cloud platforms like Render use health probes to manage container lifecycles:

- **`/health/live` (Liveness Probe)**: Fast endpoint returning `HTTP 200 {"status": "live"}` to verify the Python process has not deadlocked.
- **`/health/ready` (Readiness Probe)**: Deep probe inspecting memory usage (RSS in MB), uptime, and subsystem dependencies before routing production traffic to the container.
- **`/api/v1/telemetry` (Operational Telemetry)**: Returns comprehensive runtime metrics including RSS memory, uptime seconds, rate limiter budgets, and proxy TTL cache stats.

```python
@router.get("/health/ready")
async def health_ready():
    process = psutil.Process()
    rss_mb = round(process.memory_info().rss / (1024 * 1024), 2)
    return {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "process_memory": {"rss_mb": rss_mb},
        "subsystems": {"github_api_proxy": "degraded_or_healthy"}
    }
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
Our live monitoring console provides an automated 5-step synthetic diagnostic runner that tests client storage integrity, network round-trip time (RTT), backend readiness, proxy TTL cache status, and rate limit budgets in real-time.

---

## Conclusion

With structured JSON logging, distributed UUID request correlation, process health probes, browser RUM, and synthetic E2E diagnostics, we achieve **complete full-stack operational observability** without relying on third-party tracking or paid APM services.

Check out the live operational monitoring dashboard at `/monitoring` to test these probes live in your browser!
