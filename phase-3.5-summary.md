# Phase 3.5 Summary — Full-Stack Operational Monitoring & Telemetry

This document provides a comprehensive summary of all architectural decisions, components, data flows, and test results implemented during **Phase 3.5** of the Personal Website project.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)  
Detailed Execution Plan: [phase-3.5-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/phase-3.5-implementation-plan.md)

---

## 📌 Phase 3.5 Overview & Goals

The primary goal of Phase 3.5 is to design and implement an integrated, zero-cost, zero-cookie **Full-Stack Operational Monitoring & Telemetry System** across the Python FastAPI backend (`/backend`), React 18 frontend (`/frontend`), and End-to-End (E2E) application topology.

Phase 3.5 introduces:
1. **Backend Correlation Request ID (`X-Request-ID`)**: Middleware generating and propagating unique UUIDv4 headers for end-to-end request tracing.
2. **Structured JSON Access Logging**: Machine-readable JSON logs output to `stdout` containing `timestamp`, `request_id`, `method`, `path`, `status_code`, `latency_ms`, `client_ip`, and `user_agent`.
3. **Backend Stack Trace Logging**: Global 500 exception handler capturing full unhandled exception stack traces to `stderr` with request correlation IDs.
4. **Sub-System Health & Telemetry Endpoints**: Process liveness (`/health/live`), sub-system readiness (`/health/ready`), and live process metrics (`GET /api/v1/telemetry`).
5. **Frontend Real User Monitoring (RUM)**: Browser Performance API metrics (TTFB, LCP, INP, CLS), JS Heap Memory, and `sessionStorage` cache auditing.
6. **Live Full-Stack Topology Map & Synthetic Diagnostics**: Interactive UI dashboard on `/how-this-site-works` displaying full-stack topology (`React SPA` ➔ `FastAPI Backend` ➔ `GitHub API`) and an automated 5-step synthetic diagnostic suite.
7. **Software Engineering Guidebook (Volume 2, Chapter 8)**: Chapter documentation covering full-stack telemetry and operational monitoring.

---

## 🛠️ Work Accomplished in Phase 3.5

### 1. Backend Structured Logging & Request Correlation (`backend/core/middleware.py`)
* Created `CorrelationIDMiddleware`: Reads existing `X-Request-ID` or generates a UUIDv4 request ID, attaches it to `request.state.request_id`, and appends `X-Request-ID` to all outgoing HTTP response headers.
* Created `RequestLoggingMiddleware`: Computes request duration `process_time_ms`, extracts client IP, HTTP method, URL path, and status code, emitting structured JSON logs to `stdout`.

### 2. Enhanced Error Handling (`backend/main.py`)
* Attached `CorrelationIDMiddleware` and `RequestLoggingMiddleware` to the FastAPI application stack.
* Updated `global_exception_handler` to write unhandled exception stack traces (`traceback.format_exc()`) to `sys.stderr` with `request_id` context before returning sanitized HTTP 500 JSON error responses.

### 3. Backend Telemetry Schemas & Endpoints (`backend/schemas/telemetry.py` & `backend/api/endpoints/telemetry.py`)
* Built Pydantic v2 telemetry models (`ProcessTelemetry`, `CacheTelemetry`, `RateLimitTelemetry`, `TelemetryResponse`, `ReadinessCheckResponse`).
* Implemented `GET /health/live`: Fast process liveness probe returning `200 OK`.
* Implemented `GET /health/ready`: Deep sub-system readiness probe checking RAM RSS memory (MB), uptime, environment, and CORS configuration.
* Implemented `GET /api/telemetry` & `GET /api/v1/telemetry`: Operational telemetry endpoint exposing real-time process uptime, RSS memory, cache hit/miss status, and `slowapi` rate-limit budgets.
* Attached top-level `/health/live` and `/health/ready` routes in `backend/main.py` and included `telemetry.router` in `backend/api/router.py`.

### 5. Frontend Telemetry Utilities & Client (`frontend/src/`)
* Created TypeScript interface models in `frontend/src/types/monitoring.ts`.
* Built measurement & storage audit utilities in `frontend/src/utils/telemetry.ts` (`getBrowserPerformanceMetrics()`, `auditSessionStorage()`, `exportDiagnosticReport()`).
* Built telemetry API client `frontend/src/api/telemetryApi.ts` (`fetchBackendTelemetry()`, `fetchBackendReadiness()`, `benchmarkNetworkRTT()`, `runE2EDiagnosticSuite()`).
* Added Vitest unit test suite `frontend/src/utils/telemetry.test.ts`. Total Vitest test count increased from 59 to **61 / 61 tests passing** across **12 test files**.

---

## 🏗️ Architecture & Component Topology

```text
Visitor Browser (React 18 SPA on Cloudflare Pages)
   │
   ├──► Browser RUM Telemetry (TTFB, LCP, INP, CLS, JS Heap Memory)
   ├──► SessionStorage Cache Audit (GitHub 15-min TTL status)
   │
   ▼  [X-Request-ID Correlation Header]
FastAPI Backend (Python 3.11 on Render Container)
   │
   ├──► CorrelationIDMiddleware (uuid4 generation & propagation)
   ├──► RequestLoggingMiddleware (structured JSON access logs to stdout)
   ├──► Exception Stack Trace Logger (stderr output on 500 errors)
   ├──► GET /health/live (Process liveness probe)
   ├──► GET /health/ready (Sub-system readiness probe)
   └──► GET /api/v1/telemetry (Process uptime, RSS MB, slowapi budget, cache hit/miss ratio)
```

---

## 🧪 Verification & Test Metrics

- **Backend Pytest Suite**: **21 / 21 Pytest tests passing** (`./.venv/bin/pytest` in `backend/`).
- **Frontend Vitest Suite**: **61 / 61 Vitest tests passing** (`12 / 12 test files`).
- **E2E Playwright Suite**: **6 / 6 Playwright E2E tests passing**.
- **Correlation ID Header**: Verified `X-Request-ID` present on all HTTP responses.
- **Structured JSON Logging**: Verified valid JSON log entries on `stdout`.
- **Sub-System Readiness**: Verified `/health/ready` returns sub-system RAM RSS (MB) and uptime metrics.
- **Browser RUM & Storage Audit**: Verified navigation timing, DOM nodes count, JS heap memory, and `sessionStorage` cache auditing.


