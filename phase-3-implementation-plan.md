# Implementation Plan — Phase 3: FastAPI Backend with Security, Caching, & Render Deployment

Build and deploy a personal **FastAPI Backend** service on **Render**, acting as a secure API server and **GitHub API Proxy**. This plan establishes strong security practices (CORS origin protection, IP rate limiting, security headers, sanitized error handling) before public internet deployment, and integrates server-side in-memory caching and resilient frontend fallbacks.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## Goals & Scope

1. **FastAPI Web Service (`/backend`)**:
   - Build a clean Python 3.12+ FastAPI backend in a dedicated `/backend` directory.
   - Implement read-only initial endpoints:
     - `GET /health` — Service status check
     - `GET /api/profile` — Developer bio and skill summary
     - `GET /api/projects` & `GET /api/projects/{slug}` — Portfolio projects
     - `GET /api/now` — Current focus and activities
     - `GET /api/reading` — Reading list
     - `GET /api/github-summary` — Proxy for live GitHub statistics & active repositories
2. **Pre-Deployment Security Controls**:
   - **Strict CORS**: Enforce `Access-Control-Allow-Origin` allowing only approved frontend origins (`http://localhost:5173` in dev, production frontend domain in prod).
   - **IP Rate Limiting**: Integrate `slowapi` to restrict requests to 60 req/min per IP, returning standard `429 Too Many Requests`.
   - **Security Headers Middleware**: Apply `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and Referrer Policy.
   - **Secrets Management**: Securely inject `GITHUB_TOKEN` via environment variables (`.env` locally, Render environment variables in production). Never expose secrets to frontend or git.
   - **Sanitized Errors**: Ensure unhandled exceptions return generic `500 Internal Server Error` without leaking stack traces or local paths.
3. **GitHub API Proxy & Server Caching**:
   - Use an authenticated backend request to GitHub API (elevating rate limit to 5,000 req/hr).
   - Implement in-memory server-side response caching (15-minute TTL) so repeat visitor requests serve instant JSON without hitting GitHub.
4. **Interactive OpenAPI / Swagger UI**:
   - Enable automatic, zero-setup interactive documentation at `/docs` (Swagger UI) and `/redoc` for interactive endpoint testing directly in the browser with zero extra hosting required.
5. **Render Deployment (Free Tier)**:
   - Account signup is deferred until **Phase 3.5 (Cloud Deployment)**. Development in Phase 3.1–3.4 runs 100% locally on `http://localhost:8000`.
   - Uses Render's **100% Free Web Service Plan** (no credit card required).
   - Automatically redeploys from the `/backend` directory on main branch pushes.
6. **Resilient Frontend Integration (Phase 3.6)**:
   - Connect React frontend to FastAPI via `VITE_API_BASE_URL`.
   - Implement graceful fallback: if FastAPI is offline or sleeping (Render free tier 15-min idle spin-down / cold start), React times out after 5s and seamlessly falls back to local `sessionStorage` / static JSON so the site never breaks.
7. **Implementation Order**:
   - `CORS (3.1)` ➔ `Server Caching (3.3)` ➔ `IP Rate Limiting (3.1)` ➔ `Pytest Verification (3.4)` ➔ `Render Cloud Deploy (3.5)` ➔ `Frontend Integration (3.6)`.

---

## Architecture & Directory Structure

```text
personalWebsite/
├── README.md
├── personal-os-project-plan.md
├── phase-3-implementation-plan.md
├── frontend/                          # React Frontend
│   └── src/
│       ├── api/
│       │   ├── client.ts              # Base API client with timeout & fallback logic
│       │   └── github.ts              # Transformed API caller pointing to /api/github-summary
│       └── hooks/
│           └── useGitHubData.ts       # React hook with resilient backend fallback
└── backend/                           # FastAPI Backend Service
    ├── main.py                        # FastAPI entrypoint, middleware, CORS, rate limiting
    ├── config.py                      # Pydantic BaseSettings for environment variables
    ├── requirements.txt               # Dependencies: fastapi, uvicorn, pydantic, slowapi, httpx, pytest, ruff
    ├── Dockerfile                     # Container definition for Render deployment
    ├── render.yaml                    # Render infrastructure-as-code manifest
    ├── core/
    │   ├── cache.py                   # In-memory TTL cache utility
    │   ├── rate_limit.py              # slowapi Limiter instance
    │   └── security.py                # Security headers middleware
    ├── api/
    │   ├── router.py                  # Master API router
    │   └── endpoints/
    │       ├── health.py              # GET /health
    │       ├── profile.py             # GET /api/profile
    │       ├── projects.py            # GET /api/projects
    │       ├── now.py                 # GET /api/now
    │       ├── reading.py             # GET /api/reading
    │       └── github.py              # GET /api/github-summary (Cached GitHub Proxy)
    ├── data/
    │   ├── profile.json               # Seed content for profile
    │   ├── projects.json              # Seed content for portfolio projects
    │   ├── now.json                   # Seed content for "now" page
    │   └── reading.json               # Seed content for reading list
    ├── schemas/
    │   ├── profile.py                 # Pydantic schemas for Profile response
    │   ├── project.py                 # Pydantic schemas for Project response
    │   ├── now.py                     # Pydantic schemas for Now response
    │   ├── reading.py                 # Pydantic schemas for Reading response
    │   └── github.py                  # Pydantic schemas for GitHub summary response
    └── tests/
        ├── conftest.py                # Pytest TestClient fixture
        ├── test_health.py             # Tests for /health
        ├── test_cors.py               # Tests for CORS header compliance
        ├── test_rate_limit.py         # Tests for IP rate limiting (429 response)
        ├── test_security_headers.py   # Tests for security header injection
        ├── test_endpoints.py          # Tests for /api/profile, /api/projects, etc.
        └── test_github_proxy.py       # Tests for GitHub proxy & in-memory caching
```

---

## Security Implementation Specifications

| Security Domain | Strategy | Implementation Detail |
| :--- | :--- | :--- |
| **CORS Policy** | Strict origin whitelist | `CORSMiddleware` configured with `ALLOWED_ORIGINS` (`http://localhost:5173` for dev, production domain for prod). Blocks unauthorized origins. |
| **IP Rate Limiting** | `slowapi` throttling | `Limiter(key_func=get_remote_address, default_limits=["60/minute"])`. Over-limit requests receive HTTP `429`. |
| **Security Headers** | Custom Middleware | Adds `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`. |
| **Secrets Protection** | `pydantic-settings` | `GITHUB_TOKEN` loaded from environment. Excluded from all API responses and logging. |
| **Error Handling** | Global exception handler | Catches unhandled Python exceptions and returns `{"detail": "Internal server error"}` with HTTP 500. No stack traces exposed. |
| **Input Validation** | Pydantic v2 schemas | All endpoint parameters and response shapes strictly validated. |

---

## Detailed Task Breakdown

### Phase 3.1: Backend Core Setup & Security Foundation
- [x] Initialize `/backend` directory structure with Python 3.12 virtual environment (`.venv`).
- [x] Create `requirements.txt` with `fastapi`, `uvicorn`, `pydantic`, `pydantic-settings`, `slowapi`, `httpx`, `pytest`, `ruff`.
- [x] Create `config.py` using `Pydantic-Settings` to parse `ENVIRONMENT`, `ALLOWED_ORIGINS`, `GITHUB_TOKEN`, and `RATE_LIMIT_PER_MINUTE`.
- [x] Implement `core/security.py` middleware for security headers (`nosniff`, `DENY` frame options).
- [x] Implement `core/rate_limit.py` using `slowapi` with IP remote address detection.
- [x] Implement `main.py` with FastAPI app, CORS middleware, rate limit exception handler, security headers, and Swagger UI metadata.

### Phase 3.2: Seed Data, Schemas, & Static Endpoints
- [x] Create endpoint: `GET /health` -> `{"status": "ok", "environment": "...", "service": "..."}`
- [x] Create JSON seed data in `backend/data/` (`profile.json`, `projects.json`, `skills.json`, `experience.json`, `now.json`, `site_architecture.json`, `blog_posts.json`, `guidebook_chapters.json`).
- [x] Migrate all 20 Markdown blog articles and `guidebook-master.md` to `backend/posts/`.
- [x] Establish `backend/data/` and `backend/posts/` as the **Single Source of Truth** for both React Vite imports and FastAPI REST API endpoints.
- [x] Refactor all frontend data modules (`projects.ts`, `profile.ts`, `skills.ts`, `experience.ts`, `now.ts`, `siteArchitecture.ts`, `blogPosts.ts`, `guidebookData.ts`) to import directly from `backend/data/` and `backend/posts/`.
- [x] Create Pydantic response schemas in `backend/schemas/` (`ProfileResponse`, `ProjectResponse`, `NowResponse`, `ExperienceItemResponse`, `SkillCategoryResponse`, `BlogPostMetaResponse`, `BlogPostDetailResponse`, `GuidebookChapterResponse`).
- [x] Create REST API endpoints:
  - `GET /api/profile`
  - `GET /api/projects` & `GET /api/projects/{slug}`
  - `GET /api/experience`
  - `GET /api/skills`
  - `GET /api/now`
  - `GET /api/posts` & `GET /api/posts/{slug}`
  - `GET /api/guidebook` & `GET /api/guidebook/{chapter_id}`
- [x] Mount master API router in `backend/main.py`.
- [x] Write Pytest integration test suite in `backend/tests/test_endpoints.py` (16 passing tests).

### Phase 3.3: GitHub Proxy & In-Memory Server Caching
- [ ] Create `core/cache.py` with thread-safe in-memory cache utility (TTL = 15 minutes).
- [ ] Implement `api/endpoints/github.py`:
  - Fetch user stats & public repositories from `api.github.com` using `httpx` with `Authorization: Bearer GITHUB_TOKEN`.
  - Transform raw payload into clean `GitHubSummaryResponse` Pydantic model.
  - Wrap response in in-memory cache.
  - Handle rate limit errors / network failures from upstream GitHub gracefully.

### Phase 3.4: Backend Automated Testing Suite
- [x] Create `pyproject.toml` and `conftest.py` with Pytest `TestClient` fixture setup.
- [x] `tests/test_health.py`: Verify `/health` returns 200, CORS origin headers match, and security headers (`nosniff`, `DENY`) are present.
- [ ] `tests/test_rate_limit.py`: Verify spammed requests return `429 Too Many Requests`.
- [ ] `tests/test_endpoints.py`: Verify `/api/projects`, `/api/profile`, `/api/now`, `/api/reading` return valid schemas.
- [ ] `tests/test_github_proxy.py`: Mock upstream GitHub API calls, verify response transformation and caching behavior.

### Phase 3.5: Render Cloud Deployment
- [ ] Create `Dockerfile` and `render.yaml` for Render Web Service deployment from `/backend`.
- [ ] Connect GitHub repo to Render and set environment variables (`GITHUB_TOKEN`, `ALLOWED_ORIGINS`).
- [ ] Deploy service and verify production `/health` and interactive `/docs` (Swagger UI).

### Phase 3.6: Resilient Frontend Integration
- [ ] Add `VITE_API_BASE_URL` configuration in frontend.
- [ ] Update `frontend/src/api/client.ts` with timeout handling (e.g. 5-second timeout to handle Render cold starts).
- [ ] Update `useGitHubData.ts` React hook:
  - Try fetching from FastAPI `/api/github-summary`.
  - If request times out or fails (e.g. backend sleeping), fall back seamlessly to client `sessionStorage` or local static JSON.
- [ ] Run React unit tests & Playwright E2E suite to confirm zero regressions.

---

## Verification Plan

### Automated Tests
- **Backend Pytest**: `cd backend && pytest -v` (100% pass on endpoints, CORS, rate limits, headers, caching).
- **Frontend Vitest**: `cd frontend && npm test` (verify all frontend tests pass with API client updates).
- **E2E Playwright**: `cd frontend && npx playwright test` (verify tabbed dashboard and projects page work end-to-end).

### Manual Security & Runtime Verification
- **CORS Check**: Use `curl -I -H "Origin: https://malicious-site.com" http://localhost:8000/api/projects` -> Verify `Access-Control-Allow-Origin` is restricted.
- **Rate Limit Check**: Run 65 rapid requests -> Verify 61st request returns HTTP `429 Too Many Requests`.
- **Swagger UI Check**: Open `http://localhost:8000/docs` -> Test `/api/github-summary` interactively.
- **Cold Start Fallback Check**: Stop local backend server -> Verify React frontend falls back gracefully to cached/local data without UI crash.
