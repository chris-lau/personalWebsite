# Implementation Plan — Phase 3: FastAPI Backend & Python API Service

Recreate and align the implementation plan for **Phase 3** directly from the master architectural roadmap in [personal-os-project-plan.md](file:///Users/chrislau/Documents/personalWebsite/personal-os-project-plan.md#L344-L442). Phase 3 introduces a lightweight, production-ready **FastAPI backend** in Python (`/backend`) using Pydantic v2, Uvicorn, Async HTTPX, Pytest, and Slowapi.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## Goals & Scope

1. **Python FastAPI Backend Scaffolding**: Create a clean, decoupled `/backend` directory structure with `pyproject.toml`, FastAPI app initialization, Uvicorn server configuration, and CORS middleware setup.
2. **Pydantic v2 Data Schemas & Contracts**: Define strict Pydantic v2 models for profile, projects, now, reading, and GitHub summary endpoints (`ProfileResponse`, `ProjectResponse`, `NowResponse`, `BookResponse`, `GitHubSummaryResponse`).
3. **Decoupled Static Content Repositories**: Serve portfolio data (projects, profile, now, reading) via local static JSON files in `backend/app/data/` prior to PostgreSQL integration in Phase 4.
4. **GitHub REST API Server-Side Proxy**: Fetch, transform, and cache GitHub profile and repository statistics server-side using Async HTTPX with a 15-minute TTL cache, eliminating client-side rate limit constraints and hiding API keys.
5. **Security & Rate Limiting**: Configure CORS middleware restricting origins to authorized frontends, and implement IP rate limiting (`slowapi`) returning standard HTTP 429 responses.
6. **Frontend Integration & Graceful Fallback**: Build a React API client (`frontend/src/api/backend.ts`) that queries FastAPI backend endpoints with automatic fallback to local frontend datasets if the backend is offline.
7. **Testing & Dockerization**: Write a complete Pytest test suite for backend endpoints and create a multi-stage `Dockerfile` ready for Render deployment.

---

## Workspace Directory Structure Updates

```text
personalWebsite/
├── README.md                          # Master project documentation
├── personal-os-project-plan.md        # Architectural roadmap
├── phase-1-implementation-plan.md     # Phase 1 execution plan & summary
├── phase-2-implementation-plan.md     # Phase 2 execution plan & summary
├── phase-3-implementation-plan.md     # Phase 3 execution plan & checklist
├── frontend/                          # React + TypeScript frontend
└── backend/                           # Python FastAPI backend
    ├── pyproject.toml                 # Dependencies & tool configurations
    ├── Dockerfile                     # Container build manifest
    ├── .dockerignore
    ├── app/
    │   ├── main.py                    # FastAPI application entrypoint & CORS setup
    │   ├── core/
    │   │   ├── config.py              # Environment settings (Pydantic BaseSettings)
    │   │   └── rate_limit.py          # Slowapi rate limiting configuration
    │   ├── schemas/
    │   │   ├── profile.py             # Profile Pydantic schema
    │   │   ├── project.py             # Project Pydantic schema
    │   │   ├── content.py             # Now & Reading Pydantic schemas
    │   │   └── github.py              # GitHub Summary Pydantic schema
    │   ├── services/
    │   │   ├── content_service.py     # Local JSON content loader
    │   │   └── github_service.py      # Async HTTPX client + 15-min in-memory TTL cache
    │   ├── api/
    │   │   └── v1/
    │   │       ├── router.py          # APIRouter aggregator
    │   │       └── endpoints/
    │   │           ├── health.py      # GET /health
    │   │           ├── profile.py     # GET /api/profile & GET /api/v1/profile
    │   │           ├── projects.py    # GET /api/projects & GET /api/projects/{slug}
    │   │           ├── content.py     # GET /api/now & GET /api/reading
    │   │           └── github.py      # GET /api/github-summary
    │   └── data/                      # Local JSON content repositories
    │       ├── profile.json
    │       ├── projects.json
    │       ├── now.json
    │       └── reading.json
    └── tests/                         # Pytest test suite
        ├── conftest.py                # Test client fixtures
        ├── test_health.py
        ├── test_projects.py
        ├── test_content.py
        └── test_github.py
```

---

## Detailed Task Breakdown for Execution

### Step 1: Backend Scaffolding & Environment Setup (`backend/`)
- [x] Create `backend/` directory structure and `pyproject.toml` specifying `fastapi`, `uvicorn`, `pydantic`, `httpx`, `slowapi`, `pytest`, `pytest-asyncio`, `ruff`, `mypy`.
- [x] Create `app/main.py` initializing FastAPI app with CORS middleware and top-level router.
- [x] Implement `GET /health` returning `{"status": "ok", "service": "personal-os-backend", "version": "0.1.0"}`.

### Step 2: Data Schemas & Local Repositories (`app/schemas/` & `app/data/`)
- [x] Define `ProfileResponse`, `ProjectResponse`, `NowResponse`, `BookResponse`, and `GitHubSummaryResponse` Pydantic models.
- [x] Populate `backend/app/data/` JSON repositories (`profile.json`, `projects.json`, `now.json`, `reading.json`).
- [x] Write `content_service.py` to asynchronously read and validate JSON datasets against Pydantic models.

### Step 3: Server-Side GitHub Proxy & In-Memory Cache (`app/services/github_service.py`)
- [x] Implement `GitHubService` using `httpx.AsyncClient` to fetch profile & repo statistics from GitHub REST API.
- [x] Add server-side in-memory TTL cache (15-minute expiration) with automatic cache invalidation.
- [x] Transform raw GitHub API payloads into clean `GitHubSummaryResponse` view models.

### Step 4: API Endpoint Implementation (`app/api/v1/endpoints/`)
- [x] `GET /health` — Health check endpoint.
- [x] `GET /api/profile` & `GET /api/v1/profile` — Serves profile, bio, skills, and resume metadata.
- [x] `GET /api/projects` & `GET /api/v1/projects` — Serves all projects with optional `?tag=` filtering.
- [x] `GET /api/projects/{slug}` & `GET /api/v1/projects/{slug}` — Serves single project detail by slug or returns HTTP 404.
- [x] `GET /api/now` & `GET /api/v1/now` — Serves current activities, learning focus, and reading list.
- [x] `GET /api/reading` & `GET /api/v1/reading` — Serves curated book reading list.
- [x] `GET /api/github-summary` & `GET /api/v1/github-summary` — Serves server-cached GitHub profile stats & repositories.

### Step 5: Security, Rate Limiting & Documentation
- [x] Integrate `slowapi` rate limiter (60 requests/minute per IP address).
- [x] Standardize exception handlers for HTTP 404, 429, and 500 errors.
- [x] Enable OpenAPI Swagger UI at `/docs` and ReDoc at `/redoc`.

### Step 6: Frontend Integration & Fallback Client (`frontend/src/api/backend.ts`)
- [x] Build `frontend/src/api/backend.ts` API client querying FastAPI endpoints.
- [x] Implement fallback mechanism: if backend returns error or is unreachable, fallback to local `frontend/src/data/` files seamlessly.
- [x] Write Vitest unit tests in `frontend/src/api/backend.test.ts`.

### Step 7: Pytest Testing & Docker Containerization (`backend/tests/` & `backend/Dockerfile`)
- [x] Write Pytest test cases covering `/health`, `/api/projects`, `/api/profile`, `/api/github-summary`, and error scenarios.
- [x] Create multi-stage `Dockerfile` and `.dockerignore` for Render deployment readiness.

### Step 8: Volume 2 Guidebook App & Educational Content (`frontend/src/pages/GuidebookPage.tsx`)
- [x] Create Volume 2 guidebook dataset (`backend/data/backend_guidebook_chapters.json` & `backend/posts/backend-guidebook-master.md`) covering FastAPI, Pydantic v2, REST endpoints, GitHub proxy cache, `slowapi`, Pytest, and Docker.
- [x] Add interactive Volume Selector Tab Bar on `/guidebook` to switch seamlessly between `[ 📘 Vol 1: Frontend ]` and `[ 🐍 Vol 2: FastAPI Backend ]`.

### Step 9: Multi-Cloud Deployments & Custom Domain Setup
- [x] Deploy React SPA frontend to Cloudflare Pages and attach custom domain `https://chrislau.dev`.
- [x] Deploy isolated component library Storybook to Cloudflare Pages (`https://chris-lau-storybook.pages.dev`).
- [x] Prepare FastAPI backend multi-stage Docker container for Render cloud deployment.

---

## Verification Plan

### Automated Verification
1. **Pytest Test Suite**: `pytest` inside `backend/` verifying all API endpoints, status codes, and error responses.
2. **Frontend Vitest Suite**: `npm test` inside `frontend/` verifying backend API client and fallback mechanisms.
3. **OpenAPI Schema Check**: Verify JSON schema validity at `http://localhost:8000/openapi.json`.

### Manual Verification
1. **Interactive OpenAPI Docs**: Test endpoints directly via `http://localhost:8000/docs`.
2. **CORS & Rate Limiting Check**: Verify headers and rate limit 429 responses.
3. **Frontend Integration**: Test React app calling FastAPI backend and graceful fallback when backend server is stopped.
