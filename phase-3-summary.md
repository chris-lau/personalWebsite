# Phase 3 Summary — FastAPI Backend with Security, Caching, & Render Deployment

This document provides a comprehensive summary log of all steps, architectural decisions, file changes, and fundamental concepts introduced during **Phase 3** of the Personal Website project.

---

## 📌 Phase 3 Overview & Goals

The primary goal of Phase 3 is to construct a dedicated, high-performance **Python FastAPI Backend** in a `/backend` directory. The backend serves two core purposes:
1. **Public Read-Only API**: Exposing structured endpoints for profile overview, portfolio projects, current focus ("Now"), and reading list.
2. **GitHub API Proxy & Response Cache**: Acting as a secure middle layer between the React frontend and GitHub's REST API—increasing rate limits from 60 to 5,000 requests/hour via server-side credentials and providing in-memory caching across all site visitors.

---

## 🛠️ Executed Steps & Changes Made

### Step 1: Core Setup & Security Foundation (Phase 3.1) — ✅ COMPLETED

#### 1. Backend Directory & Virtual Environment Setup (`/backend`)
Created the `/backend` workspace directory and initialized a dedicated Python virtual environment (`.venv`).

* **[`requirements.txt`](file:///Users/chrislau/Documents/personalWebsite/backend/requirements.txt)**: Core dependencies specified and installed:
  * `fastapi` & `uvicorn[standard]` — Modern ASGI web framework & server.
  * `pydantic` & `pydantic-settings` — Schema validation & type-safe environment variable parsing.
  * `slowapi` — IP rate-limiting middleware.
  * `httpx` — Async HTTP client for calling external APIs.
  * `pytest` & `pytest-asyncio` — Testing framework.
  * `ruff` — Fast Python linter.
* **[`backend/.gitignore`](file:///Users/chrislau/Documents/personalWebsite/backend/.gitignore)**: Prevents virtual environment (`.venv/`), bytecode (`__pycache__/`), test caches (`.pytest_cache/`), and secrets (`.env`) from being committed to GitHub.
* **[`backend/.env.example`](file:///Users/chrislau/Documents/personalWebsite/backend/.env.example)** & **[`backend/.env`](file:///Users/chrislau/Documents/personalWebsite/backend/.env)**: Template and local environment configuration files.

#### 2. Configuration Loader (`config.py`)
Created **[`backend/config.py`](file:///Users/chrislau/Documents/personalWebsite/backend/config.py)** using `Pydantic-Settings` to parse environment variables safely with default fallbacks:
* `ENVIRONMENT`: `'development'` vs `'production'`
* `PORT`: `8000`
* `ALLOWED_ORIGINS`: Comma-separated list parsed into a list of allowed CORS origins (`http://localhost:5173`, `http://localhost:3000`).
* `RATE_LIMIT_PER_MINUTE`: `60` requests per minute per IP.
* `GITHUB_TOKEN`: Personal Access Token for GitHub API authorization.

#### 3. Security Headers Middleware (`core/security.py`)
Created **[`backend/core/security.py`](file:///Users/chrislau/Documents/personalWebsite/backend/core/security.py)** implementing `BaseHTTPMiddleware` to inject security headers into every HTTP response:
* `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing.
* `X-Frame-Options: DENY` — Prevents clickjacking framing attacks.
* `X-XSS-Protection: 1; mode=block` — Enables browser XSS filters.
* `Referrer-Policy: strict-origin-when-cross-origin` — Controls referrer leaks.

#### 4. Rate Limiter (`core/rate_limit.py`)
Created **[`backend/core/rate_limit.py`](file:///Users/chrislau/Documents/personalWebsite/backend/core/rate_limit.py)** configuring `slowapi.Limiter` to track client remote IP addresses (`get_remote_address`).

#### 5. Core FastAPI Entrypoint (`main.py`)
Created **[`backend/main.py`](file:///Users/chrislau/Documents/personalWebsite/backend/main.py)** assembling all application components:
* Enables `slowapi` rate limiting and registers the `RateLimitExceeded` 429 handler.
* Attaches `SecurityHeadersMiddleware`.
* Attaches `CORSMiddleware` configured with allowed frontend origins.
* Adds a global 500 exception handler to sanitize unhandled server errors.
* Implements `GET /health` endpoint returning `{"status": "ok", "environment": "development"}`.
* Configures Swagger UI (`/docs`) and ReDoc (`/redoc`) interactive documentation.

#### 6. Pytest Automated Test Suite (`tests/`)
Created **[`backend/pyproject.toml`](file:///Users/chrislau/Documents/personalWebsite/backend/pyproject.toml)**, **[`backend/tests/conftest.py`](file:///Users/chrislau/Documents/personalWebsite/backend/tests/conftest.py)**, and **[`backend/tests/test_health.py`](file:///Users/chrislau/Documents/personalWebsite/backend/tests/test_health.py)**.
* Tests `/health` status, security headers presence, and CORS origin header behavior.
* **Verification Results**: 3/3 automated tests passed in `0.06s`.

---

## 🧠 Core Concepts & Technical Reference

Below are the fundamental backend and security concepts implemented in Phase 3:

### 1. FastAPI Framework
* **What it is**: A modern, high-performance Python web framework for building APIs.
* **Key Feature**: It relies on standard Python type hints. By adding type annotations to function parameters and return types, FastAPI automatically performs data validation, serializes responses to JSON, and generates interactive OpenAPI documentation (`/docs`).

### 2. ASGI vs. WSGI (Uvicorn Server)
* **ASGI (Asynchronous Server Gateway Interface)**: The modern standard for Python asynchronous web servers.
* **Why Uvicorn?**: Traditional Python web servers (WSGI like Gunicorn) handle one request per thread synchronously. Uvicorn uses an event loop (`async`/`await`) to process thousands of concurrent requests without blocking worker threads, making it ideal for API proxies and real-time endpoints.

### 3. Pydantic & Pydantic-Settings
* **Pydantic**: Data validation library for Python. Enforces types at runtime and returns friendly errors when data shape is invalid.
* **Pydantic-Settings**: Extension that reads environment variables from `.env` files or system environments, validates types (e.g. converting `"8000"` to integer `8000`), and supplies defaults.

### 4. CORS (Cross-Origin Resource Sharing)
* **The Problem**: Web browsers enforce the *Same-Origin Policy*. A web page hosted on `http://localhost:5173` cannot make API requests to `http://localhost:8000` unless the backend explicitly approves it.
* **The Solution**: FastAPI's `CORSMiddleware` sends HTTP headers like `Access-Control-Allow-Origin: http://localhost:5173` during preflight (`OPTIONS`) requests, signaling to the browser that the frontend is authorized.

### 5. HTTP Security Headers
* **`X-Content-Type-Options: nosniff`**: Forces browsers to strictly respect the `Content-Type` header (e.g., `application/json`), preventing browsers from interpreting JSON responses as executable HTML/JavaScript scripts.
* **`X-Frame-Options: DENY`**: Prevents external websites from embedding your site inside an `<iframe>`, protecting against Clickjacking attacks.
* **`Referrer-Policy: strict-origin-when-cross-origin`**: Limits sensitive URL path data sent in the HTTP `Referer` header when navigating across domains.

### 6. IP Rate Limiting (`slowapi`)
* **Purpose**: Prevents malicious bots or scripts from spamming backend endpoints with rapid requests.
* **How it works**: Tracks client IP addresses in memory. If a client exceeds the limit (e.g., 60 requests/minute), `slowapi` intercepts the request and immediately returns HTTP status `429 Too Many Requests`.

### 7. OpenAPI Specification & Swagger UI (`/docs`)
* **OpenAPI**: A standard JSON specification describing all routes, request parameters, and response schemas of an API.
* **Swagger UI**: An interactive web browser tool embedded in FastAPI at `/docs`. It parses `/openapi.json` and allows developers to inspect and test endpoints interactively by clicking "Try it out".

### 8. Secrets Isolation (`.env` vs `.env.example`)
* **Rule**: API tokens (like `GITHUB_TOKEN`) must never be committed to git repositories.
* **Pattern**: `.env` is listed in `.gitignore` to keep local credentials private. `.env.example` is committed to git with blank values to guide developers on required variables.

---

## 📑 Remaining Phase 3 Task Roadmap

| Step | Phase Sub-Section | Description & Status |
| :--- | :--- | :--- |
| **Step 1** | **Phase 3.1: Core Setup & Security** | ✅ **COMPLETED** — FastAPI, CORS, rate limiting, security headers, `/health`, Pytest suite. |
| **Step 2** | **Phase 3.2: Seed Data & Schemas** | ⏳ **PENDING** — Pydantic schemas and endpoints (`/api/profile`, `/api/projects`, `/api/now`, `/api/reading`). |
| **Step 3** | **Phase 3.3: GitHub Proxy & Caching** | ⏳ **PENDING** — GitHub proxy endpoint (`/api/github-summary`) with 15-min in-memory server cache. |
| **Step 4** | **Phase 3.4: Complete Pytest Suite** | ⏳ **PENDING** — Full test coverage for all endpoints, schemas, caching, and rate limiting. |
| **Step 5** | **Phase 3.5: Render Cloud Deploy** | ⏳ **PENDING** — Deploy backend to Render's free Web Service tier. |
| **Step 6** | **Phase 3.6: Resilient Frontend Integration** | ⏳ **PENDING** — Connect React frontend to FastAPI with 5s timeout & fallback resilience. |
