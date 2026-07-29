# Phase 3 Summary — FastAPI Backend & Python API Service

This document provides a comprehensive summary of all architectural decisions, components, data flows, and test results implemented during **Phase 3** of the Personal Website project.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## 📌 Phase 3 Overview & Goals

The primary goal of Phase 3 was to design, build, and deploy a production-ready, lightweight **Python FastAPI backend** (`/backend`) serving as an API layer, aggregator, and server-side proxy for portfolio content (`/api/profile`, `/api/projects`, `/api/now`, `/api/reading`, `/api/github-summary`).

Phase 3 introduces:
1. **Decoupled Architecture**: Python backend separated from the React frontend.
2. **Server-Side GitHub Proxy & Caching**: Centralized 15-minute TTL cache protecting frontend clients from external rate limits.
3. **Pydantic v2 Data Validation**: Strict schema enforcement for request/response payloads.
4. **Security & Rate Limiting**: `slowapi` IP rate limiting and CORS middleware protection.
5. **Frontend Graceful Fallback**: React API client that seamlessly switches to local static datasets if the backend is offline.
6. **Containerization & Testing**: Pytest test suite and multi-stage `Dockerfile` ready for Render deployment.

---

## 🛠️ Work Accomplished in Phase 3

### 1. Python FastAPI Backend Service (`/backend`)
* Created modular application structure: `app/main.py`, `app/core/`, `app/schemas/`, `app/services/`, `app/api/`, `app/data/`, `tests/`.
* Implemented `GET /health` operational endpoint returning status, environment, and service name.
* Configured `CORSMiddleware` restricting cross-origin requests to authorized origins.

### 2. Schemas & Static Repositories (`app/schemas/` & `app/data/`)
* Built Pydantic v2 schemas: `ProfileResponse`, `ProjectResponse`, `NowResponse`, `BookResponse`, and `GitHubSummaryResponse`.
* Populated JSON content datasets in `backend/app/data/` (`profile.json`, `projects.json`, `now.json`, `reading.json`).
* Built `content_service.py` for async JSON loading and validation.
* *Note: Database storage (PostgreSQL & Neon) is intentionally deferred to Phase 4.*

### 3. Server-Side GitHub Proxy (`app/services/github_service.py`)
* Created async HTTPX client fetching profile statistics and repositories from `https://api.github.com`.
* Added 15-minute in-memory TTL caching with automatic invalidation to eliminate client-side rate limits.

### 4. API Endpoints (`app/api/v1/endpoints/`)
* `GET /health`: Health check endpoint.
* `GET /api/profile` & `GET /api/v1/profile`: Bio, skills, resume metadata.
* `GET /api/projects` & `GET /api/v1/projects`: Project list with `?tag=` filtering.
* `GET /api/projects/{slug}` & `GET /api/v1/projects/{slug}`: Single project lookup.
* `GET /api/now` & `GET /api/v1/now`: Current activities & learning focus.
* `GET /api/reading` & `GET /api/v1/reading`: Book reading list.
* `GET /api/github-summary` & `GET /api/v1/github-summary`: Server-cached GitHub statistics.

### 5. Rate Limiting & OpenAPI Swagger Docs
* Configured `slowapi` IP rate limiter returning standard HTTP 429 responses.
* Auto-generated interactive Swagger UI at `/docs` and ReDoc at `/redoc`.

### 6. Frontend Integration & Offline Fallback (`frontend/src/api/backend.ts`)
* Built React API client (`frontend/src/api/backend.ts`) querying FastAPI backend endpoints.
* Implemented automatic graceful fallback: if backend returns 500 or is unreachable, the React frontend seamlessly falls back to static local datasets without crashing.

### 7. Multi-Stage Docker Build (`backend/Dockerfile`)
* Authored multi-stage `Dockerfile` (`builder` stage for wheel builds + `runner` stage using `python:3.11-slim`).
* Added `.dockerignore` for small, secure container builds ready for Render deployment.

---

## 🧪 Verification & Test Metrics

- **Live Website**: [https://chrislau.dev](https://chrislau.dev)
- **Live Component Storybook**: [https://chris-lau-storybook.pages.dev](https://chris-lau-storybook.pages.dev)
- **Backend Pytest Suite**: **16 / 16 Pytest tests passing** (`./.venv/bin/pytest` in `backend/`).
- **Frontend Vitest Suite**: **59 / 59 Vitest tests passing** (`11 / 11 test files`), including `backend.test.ts`.
- **E2E Playwright Suite**: **6 / 6 Playwright E2E tests passing** (`npx playwright test`).
- **OpenAPI Schema Check**: Valid JSON schema served at `/openapi.json` and `/docs`.
