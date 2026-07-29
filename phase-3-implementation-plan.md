# Implementation Plan — Phase 3: FastAPI Backend & Python API Service

Build a production-ready, lightweight **FastAPI backend** (`/backend`) in Python using Pydantic v2, Uvicorn, Async HTTPX, and Pytest. The backend will serve as a proxy and aggregator for portfolio content (`/api/v1/profile`, `/api/v1/projects`, `/api/v1/now`, `/api/v1/reading`, `/api/v1/github-summary`), providing centralized server-side caching (15-min TTL), IP rate limiting (`slowapi`), CORS protection, and OpenAPI Swagger documentation (`/docs`).

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## Goals & Scope

1. **Python FastAPI Backend Scaffolding**: Create a clean, decoupled `/backend` directory structure with `pyproject.toml`, FastAPI app initialization, and Uvicorn server configuration.
2. **Data Schemas & Contracts**: Define strict Pydantic v2 schemas for all API requests and responses.
3. **Decoupled Static Content Repositories**: Serve portfolio data (projects, profile, now, reading) via static JSON repositories before database integration in Phase 4.
4. **GitHub REST API Server-Side Proxy**: Fetch, transform, and cache GitHub profile and repository statistics server-side with a 15-minute TTL cache, removing client-side rate limit pressures.
5. **Security & Rate Limiting**: Configure CORS middleware restricting origins to authorized frontends, and implement IP rate limiting (`slowapi`) returning standard HTTP 429 errors.
6. **Frontend Graceful Fallback**: Update React frontend (`frontend/src/api/backend.ts`) to query FastAPI backend with automatic fallback to local data if the backend is offline.
7. **Testing & Dockerization**: Write a complete Pytest test suite for backend endpoints and create a multi-stage `Dockerfile` for containerized deployment on Render.

---

## Workspace Directory Structure Updates

```text
personalWebsite/
├── README.md                          # Master project documentation
├── personal-os-project-plan.md        # Architectural roadmap
├── phase-1-implementation-plan.md     # Phase 1 plan & summary
├── phase-2-implementation-plan.md     # Phase 2 plan & summary
├── phase-3-implementation-plan.md     # Phase 3 execution plan & checklist
├── frontend/                          # React + TypeScript frontend
└── backend/                           # Python FastAPI backend
    ├── pyproject.toml                 # Dependencies & tool configurations
    ├── Dockerfile                     # Container build manifest
    ├── .dockerignore
    ├── app/
    │   ├── main.py                    # FastAPI application entrypoint & CORS
    │   ├── core/
    │   │   ├── config.py              # Environment settings (Pydantic BaseSettings)
    │   │   └── rate_limit.py          # Slowapi rate limiting setup
    │   ├── schemas/
    │   │   ├── profile.py             # Profile Pydantic schema
    │   │   ├── project.py             # Project Pydantic schema
    │   │   ├── content.py             # Now & Reading Pydantic schemas
    │   │   └── github.py              # GitHub Summary Pydantic schema
    │   ├── services/
    │   │   ├── content_service.py     # Local JSON content loader
    │   │   └── github_service.py      # Async HTTPX client + 15-min in-memory cache
    │   ├── api/
    │   │   └── v1/
    │   │       ├── router.py          # APIRouter aggregator
    │   │       └── endpoints/
    │   │           ├── health.py      # GET /health
    │   │           ├── profile.py     # GET /api/v1/profile
    │   │           ├── projects.py    # GET /api/v1/projects & GET /api/v1/projects/{slug}
    │   │           ├── content.py     # GET /api/v1/now & GET /api/v1/reading
    │   │           └── github.py      # GET /api/v1/github-summary
    │   └── data/                      # Local JSON content files
    │       ├── profile.json
    │       ├── projects.json
    │       ├── now.json
    │       └── reading.json
    └── tests/                         # Pytest test suite
        ├── conftest.py                # Test client fixtures
        ├── test_health.py
        ├── test_projects.py
        ├── test_content.py
        └── test_github_service.py
```

---

## Detailed Task Breakdown for Execution

### Step 1: Backend Scaffolding & Configuration (`backend/`)
- [ ] Create `backend/` directory structure and `pyproject.toml` specifying `fastapi`, `uvicorn`, `pydantic`, `httpx`, `slowapi`, `pytest`, `pytest-asyncio`, `ruff`.
- [ ] Create `app/main.py` initializing FastAPI app with CORS middleware and top-level router.
- [ ] Add `GET /health` returning `{"status": "ok", "service": "personal-os-backend", "version": "0.1.0"}`.

### Step 2: Pydantic Data Contracts & Local JSON Repositories (`app/schemas/` & `app/data/`)
- [ ] Define `ProfileResponse`, `ProjectResponse`, `NowResponse`, `BookResponse`, and `GitHubSummaryResponse` Pydantic models.
- [ ] Populate `backend/app/data/` JSON repositories (`profile.json`, `projects.json`, `now.json`, `reading.json`).
- [ ] Write `content_service.py` to asynchronously read and validate JSON data against Pydantic models.

### Step 3: Server-Side GitHub Proxy & In-Memory Cache (`app/services/github_service.py`)
- [ ] Implement `GitHubService` using `httpx.AsyncClient` to fetch user & repo statistics from GitHub API.
- [ ] Add server-side in-memory TTL cache (15-minute expiration) with automatic cache invalidation.
- [ ] Transform raw GitHub API payloads into clean `GitHubSummaryResponse` view models.

### Step 4: API Endpoint Implementation (`app/api/v1/endpoints/`)
- [ ] `GET /api/v1/profile` — Serves profile, bio, skills, and resume metadata.
- [ ] `GET /api/v1/projects` — Serves all projects with optional `?tag=` filtering.
- [ ] `GET /api/v1/projects/{slug}` — Serves single project detail by slug or returns HTTP 404.
- [ ] `GET /api/v1/now` — Serves current activities, learning focus, and reading list.
- [ ] `GET /api/v1/reading` — Serves curated book reading list.
- [ ] `GET /api/v1/github-summary` — Serves server-cached GitHub profile stats & repositories.

### Step 5: Rate Limiting, Error Formats & OpenAPI Documentation
- [ ] Integrate `slowapi` rate limiter (e.g. 60 requests/minute per IP address).
- [ ] Standardize exception handlers for HTTP 404, 429, and 500 errors.
- [ ] Enable OpenAPI Swagger UI at `/docs` and ReDoc at `/redoc`.

### Step 6: Frontend Integration & Fallback Client (`frontend/src/api/backend.ts`)
- [ ] Build `frontend/src/api/backend.ts` API client querying FastAPI endpoints.
- [ ] Implement fallback mechanism: if backend returns error or is unreachable, fallback to local `frontend/src/data/` files seamlessly.
- [ ] Write Vitest unit tests in `frontend/src/api/backend.test.ts`.

### Step 7: Pytest Testing & Docker Containerization (`backend/tests/` & `backend/Dockerfile`)
- [ ] Write Pytest test cases covering `/health`, `/api/v1/projects`, `/api/v1/profile`, `/api/v1/github-summary`, and error scenarios.
- [ ] Create multi-stage `Dockerfile` and `.dockerignore` for Render deployment readiness.

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
