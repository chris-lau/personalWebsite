# Implementation Plan — Phase 3.5: Full-Stack (Frontend, Backend & E2E) Operational Monitoring & Telemetry

Create and align the detailed execution plan for **Phase 3.5** directly from the master architectural roadmap in [personal-os-project-plan.md](file:///Users/chrislau/Documents/personalWebsite/personal-os-project-plan.md#L446-L480).

Phase 3.5 introduces an integrated, zero-cost, zero-cookie **Full-Stack Operational Monitoring & Telemetry System** across the Python FastAPI backend (`/backend`), React 18 frontend (`/frontend`), and End-to-End (E2E) application topology.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## Goals & Scope

1. **Backend Telemetry & Structured JSON Logging**:
   - Add `CorrelationIDMiddleware` attaching a unique `X-Request-ID` UUID to all HTTP requests and response headers.
   - Add `RequestLoggingMiddleware` formatting logs in machine-readable JSON (`timestamp`, `request_id`, `method`, `path`, `status_code`, `latency_ms`, `client_ip`, `user_agent`).
   - Update 500 error handler in `backend/main.py` to log exception stack traces to `stderr` before returning sanitized JSON error responses.

2. **Backend Telemetry & Sub-System Readiness Endpoints**:
   - Implement `GET /health/live` (process liveness probe).
   - Implement `GET /health/ready` (readiness probe checking memory, cache readiness, and upstream GitHub API status).
   - Implement `GET /api/v1/telemetry` returning live system metrics (process uptime seconds, RAM RSS in MB, `slowapi` rate-limit budget status, and GitHub proxy cache hit/miss statistics).

3. **Frontend Real User Monitoring (RUM) & Telemetry**:
   - Collect browser performance timing (Time To First Byte, navigation timing, total load time).
   - Monitor Core Web Vitals (LCP, INP, CLS).
   - Inspect JavaScript heap memory usage (`performance.memory`) and DOM node counts.
   - Inspect `sessionStorage` cache items, cache size, and cache expiration timers.

4. **Full-Stack E2E Diagnostic Suite & Topology Map**:
   - Build `<FullStackMonitoringDashboard />` component embedded on `/how-this-site-works`.
   - Render a live full-stack system topology diagram: `[Cloudflare Pages React SPA] ──(RTT ms)──► [FastAPI Render Backend] ──(Proxy Cache)──► [GitHub REST API]`.
   - Automated 5-step E2E synthetic diagnostic suite (`[Run Full E2E Diagnostic Test]`):
     - **Check 1**: Client Storage & Cache Integrity.
     - **Check 2**: Network RTT & CORS Validation.
     - **Check 3**: FastAPI Backend Readiness (`/health/ready`).
     - **Check 4**: GitHub API Proxy & 15-Min TTL Cache (`/api/v1/github-summary`).
     - **Check 5**: Rate Limiting Enforcement (`slowapi`).
   - Interactive maintenance actions: `[Ping Health]`, `[Flush Session Cache]`, `[Simulate Offline Mode]`, and `[Export Diagnostic Log (.json)]`.

5. **Educational Guidebook Series Documentation**:
   - Add **Volume 2, Chapter 8**: *"Full-Stack Operational Monitoring, Structured JSON Logging, Telemetry Endpoints & E2E Synthetic Probes"* to `backend/data/backend_guidebook_chapters.json` and `backend/posts/backend-guidebook-master.md`.

---

## Workspace Directory Structure Updates

```text
personalWebsite/
├── README.md                          # Master project documentation
├── personal-os-project-plan.md        # Architectural roadmap (Phase 3.5 added)
├── phase-3.5-implementation-plan.md   # Phase 3.5 execution plan & checklist
├── backend/
│   ├── main.py                        # Updated with logging, health/live, health/ready
│   ├── core/
│   │   └── middleware.py              # X-Request-ID & Structured JSON logging middleware
│   ├── api/
│   │   └── v1/
│   │       ├── router.py              # Included telemetry router
│   │       └── endpoints/
│   │           ├── health.py          # GET /health, /health/live, /health/ready
│   │           └── telemetry.py       # GET /api/v1/telemetry
│   └── tests/
│       └── test_telemetry.py          # Pytest suite for logging & telemetry endpoints
└── frontend/
    ├── src/
    │   ├── types/
    │   │   └── monitoring.ts          # Full-stack telemetry TypeScript types
    │   ├── api/
    │   │   └── telemetryApi.ts        # API client for backend telemetry & synthetic probes
    │   ├── utils/
    │   │   └── telemetry.ts           # RUM browser metrics & sessionStorage audit helpers
    │   ├── components/
    │   │   └── monitoring/
    │   │       ├── FullStackMonitoringDashboard.tsx  # Interactive telemetry & E2E diagnostic UI
    │   │       ├── FullStackMonitoringDashboard.css
    │   │       └── FullStackMonitoringDashboard.test.tsx
    │   └── pages/
    │       └── HowThisSiteWorksPage.tsx # Embedded monitoring dashboard
    └── e2e/
        └── monitoring.spec.ts         # Playwright E2E test for synthetic diagnostic runner
```

---

## Step-by-Step Implementation Guide

### Step 1: Backend Middleware & Structured Logging (`backend/core/middleware.py` & `backend/main.py`)
1. Create `backend/core/middleware.py`:
   - `CorrelationIDMiddleware(BaseHTTPMiddleware)`: Reads or generates a `uuid4()` request ID, sets `request.state.request_id`, and appends `X-Request-ID` to response headers.
   - `RequestLoggingMiddleware(BaseHTTPMiddleware)`: Computes execution duration `process_time_ms`, extracts client IP, HTTP method, URL path, and status code. Emits a structured JSON log string to `sys.stdout`.
2. Update `backend/main.py`:
   - Add `CorrelationIDMiddleware` and `RequestLoggingMiddleware`.
   - Update `global_exception_handler` to print full exception stack traces to `sys.stderr` with `request_id` before returning HTTP 500 JSON.

### Step 2: Backend Telemetry Endpoints (`backend/api/v1/endpoints/health.py` & `telemetry.py`)
1. Update `backend/api/v1/endpoints/health.py`:
   - `GET /health` & `GET /health/live`: Fast process liveness probe returning `{"status": "ok", "service": "Personal OS FastAPI Backend"}`.
   - `GET /health/ready`: Sub-system readiness probe checking process memory, GitHub proxy cache status, and upstream reachability.
2. Create `backend/api/v1/endpoints/telemetry.py`:
   - `GET /api/v1/telemetry`: Returns Pydantic `TelemetryResponse` schema containing:
     - `process`: `uptime_seconds`, `memory_rss_mb`, `python_version`, `environment`.
     - `cache`: `github_cache_hits`, `github_cache_misses`, `ttl_seconds`, `items_cached`.
     - `rate_limit`: `limit_per_minute` (60), `active_window`.
3. Create `backend/tests/test_telemetry.py`:
   - Pytest tests verifying `/health/live`, `/health/ready`, `/api/v1/telemetry`, and `X-Request-ID` response headers.

### Step 3: Frontend Telemetry Types & Measurement Utilities (`frontend/src/`)
1. Create `frontend/src/types/monitoring.ts`:
   - Interfaces for `BackendTelemetry`, `BrowserPerformanceMetrics`, `SessionStorageAudit`, `DiagnosticTestResult`, and `FullStackTopologyState`.
2. Create `frontend/src/utils/telemetry.ts`:
   - `getBrowserPerformanceMetrics()`: Evaluates navigation timing, TTFB, DOM Interactive time, and JS memory heap (`performance.memory`).
   - `auditSessionStorage()`: Scans `sessionStorage`, counts keys, calculates byte size, and audits cache age.
   - `exportDiagnosticReport(data)`: Triggers browser download of a formatted diagnostic JSON report.
3. Create `frontend/src/api/telemetryApi.ts`:
   - Client functions for calling `/health/ready`, `/api/v1/telemetry`, benchmarking network RTT (ms), and running synthetic E2E diagnostic probes.

### Step 4: Full-Stack Monitoring UI Dashboard (`frontend/src/components/monitoring/`)
1. Create `FullStackMonitoringDashboard.tsx` & `FullStackMonitoringDashboard.css`:
   - **Section 1: Live Full-Stack Topology Map**: Visual node map (`React SPA` ➔ `FastAPI Backend` ➔ `GitHub REST API`) with real-time status badges and latency indicators.
   - **Section 2: Backend Telemetry Cards**: Display server uptime, memory usage, cache hit/miss ratio, and rate-limit status.
   - **Section 3: Browser RUM Telemetry Cards**: Display Core Web Vitals (LCP, INP, CLS), TTFB, DOM nodes count, and storage usage.
   - **Section 4: Automated E2E Synthetic Diagnostic Suite**: `[Run Full E2E Diagnostic Test]` executing 5 checks with live status badges.
   - **Section 5: Interactive Controls**: `[Ping Health]`, `[Flush Session Cache]`, `[Simulate Offline Mode]`, `[Export Diagnostic Log]`.
2. Create `FullStackMonitoringDashboard.test.tsx`:
   - Vitest component tests verifying component render, diagnostic runner execution, and control button handlers.

### Step 5: Integration, Guidebook Documentation & E2E Testing
1. Update `frontend/src/pages/HowThisSiteWorksPage.tsx`:
   - Embed `<FullStackMonitoringDashboard />` as an interactive operational control panel section.
2. Update `backend/data/backend_guidebook_chapters.json` & `backend/posts/backend-guidebook-master.md`:
   - Add Volume 2, Chapter 8: *"Full-Stack Operational Monitoring, Structured JSON Logging, Telemetry Endpoints & E2E Synthetic Probes"*.
3. Create `frontend/e2e/monitoring.spec.ts`:
   - Playwright test asserting monitoring dashboard functionality and running E2E synthetic diagnostics.

---

## Detailed Task Checklist for Execution

### Step 1: Backend Structured Logging & Middleware
- [x] Create `backend/core/middleware.py` with `CorrelationIDMiddleware` and `RequestLoggingMiddleware`.
- [x] Connect middleware in `backend/main.py` and update 500 error handler to log stack traces to `stderr`.

### Step 2: Backend Telemetry Endpoints
- [x] Update `backend/api/endpoints/telemetry.py` with `/health/live` and `/health/ready`.
- [x] Create `backend/api/endpoints/telemetry.py` with `GET /api/v1/telemetry`.
- [x] Add Pytest tests in `backend/tests/test_middleware.py` and `backend/tests/test_telemetry.py`.

### Step 3: Frontend Telemetry Utilities & Client
- [x] Define TypeScript types in `frontend/src/types/monitoring.ts`.
- [x] Implement `frontend/src/utils/telemetry.ts` performance and storage helpers.
- [x] Implement `frontend/src/api/telemetryApi.ts` client.
- [x] Add Vitest unit tests in `frontend/src/utils/telemetry.test.ts` and `frontend/src/api/telemetryApi.test.ts`.

### Step 4: Full-Stack Monitoring UI & Diagnostic Suite
- [x] Build `<FullStackMonitoringDashboard />` and `FullStackMonitoringDashboard.css`.
- [x] Implement 5-step synthetic diagnostic test runner (`[Run Full E2E Diagnostic Test]`).
- [x] Add Vitest tests in `FullStackMonitoringDashboard.test.tsx`.
- [x] Add Storybook stories in `FullStackMonitoringDashboard.stories.tsx`.

### Step 5: Integration & Guidebook Documentation
- [x] Embed `<FullStackMonitoringDashboard />` into `frontend/src/pages/HowThisSiteWorksPage.tsx`.
- [x] Add Chapter 8 to `backend/data/backend_guidebook_chapters.json` and `backend/posts/backend-guidebook-master.md`.
- [x] Add Playwright E2E test in `frontend/e2e/monitoring.spec.ts`.

---

## Verification Plan

### Automated Verification
1. **Backend Pytest Suite**: `./.venv/bin/pytest` in `backend/` verifying `/health/live`, `/health/ready`, `/api/v1/telemetry`, and structured logging headers.
2. **Frontend Vitest Suite**: `npm test` in `frontend/` verifying telemetry client utilities and component rendering.
3. **Playwright E2E Suite**: `npx playwright test` verifying the 5-step synthetic diagnostic test runner.

### Manual Verification
1. Launch local backend (`uvicorn main:app --port 8000`) and frontend (`npm run dev`).
2. Navigate to `http://localhost:5173/how-this-site-works`.
3. Run the E2E synthetic diagnostic suite and confirm all 5 checks pass.
4. Export the diagnostic `.json` report and verify output schema.
