# Chris Lau // AI & Product Leadership Website (Triple-Theme ASCII, CLI & Modern Editorial)

A modern, responsive, accessible, frontend-only personal portfolio website and blog engine supporting three distinct visual themes: **Warm Earthy ASCII Art Design**, **Retro Terminal CLI Design**, and **Modern Editorial Design** (inspired by Anthropic and OpenAI web aesthetics) with real-time theme toggling.

Built with **React 18**, **TypeScript**, **Vite**, **React Router 6**, **Storybook 8**, **Vitest**, and **Playwright**.

Live Website: [https://chrislau.dev](https://chrislau.dev)  
Live Component Storybook: [https://chris-lau-storybook.pages.dev](https://chris-lau-storybook.pages.dev)  
GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## 🎨 Key Features

- **Triple-Theme Support**:
  - **`ascii` Mode**: Warm Earthy single-column layout (espresso background, parchment text, terracotta/sage accents, ASCII box frames).
  - **`cli` Mode**: Retro terminal window layout with interactive command prompt (`$`), tab navigation, and terminal output aesthetic.
  - **`modern` Mode**: Modern Editorial layout inspired by Anthropic & OpenAI websites (dark charcoal surface, warm ambient glows, `Instrument Serif` headers, and `Inter` sans-serif typography).
  - **Real-Time Segmented Control**: 3-option pill selector (`[ MODERN | ASCII | CLI ]`) providing instant 1-click theme switching, full keyboard accessibility (`role="radiogroup"`), and `localStorage` state persistence.
- **Client-Side Navigation & Routing**:
  - `/` — Home (Hero bio, featured projects, quick skill overview)
  - `/about` — About & Résumé (Detailed background, core values, technical stack)
  - `/projects` — Projects Showcase (Interactive filterable list by technology tag)
  - `/blog` — Blog Engine (Keyword search, tag filtering, post detail markdown views)
  - `/guidebook` — Frontend Development Guidebook (Interactive 9-chapter reader app)
  - `/experience` — Work & Education Timeline
  - `/now` — Current Activities & Learning Focus (Derek Sivers style `/now` page)
  - `/contact` — Contact details & Social links
  - `/how-this-site-works` — Technical Architecture & Design System showcase
- **Interactive Frontend Development Guidebook App (`/guidebook`)**:
  - Full 9-chapter interactive guidebook: *Building Modern Web Applications: A Step-by-Step Guide for Frontend Beginners*.
  - Features sticky Table of Contents sidebar, markdown canvas rendering, syntax-highlighted line-by-line code blocks, WCAG tables, and next/prev chapter pagination buttons.
  - Includes **Chapter 9: Consuming External REST APIs & Client-Side Caching** (decoupling API view models, 15-minute `sessionStorage` TTL caching, custom hooks, and Storybook stories).
  - **Performance & Mobile Optimization**: `useMemo` pre-parsed markdown node caching, container-relative instant scrolling (`scrollToReader()`), and CSS Grid `minmax(0, 1fr)` track sizing for responsive mobile reading without horizontal viewport overflow.
- **Full-Featured Technical Blog Engine**:
  - Modular Markdown storage in `frontend/src/data/posts/`.
  - Vite raw static imports (`?raw`) with query helpers (`getAllBlogPosts`, `getBlogPostBySlug`, `getBlogPostsByTag`, `getGroupedBlogPostsByCategory`, `getRelatedBlogPosts`).
  - **Executive Summaries**: Every article features a prominent **TL;DR** callout box for instant comprehension.
  - **Category Grouping & Discovery**: Articles organized under clear technical categories (`React Architecture & Design Systems`, `Developer Workflows & Tooling`, `Testing & Quality Assurance`) with automated **Related Articles** suggestions.
  - Includes 13 technical articles covering React architecture, SPA routing mechanics & Cloudflare hosting, scaffolding, 4-tier testing strategies, design tokens, multi-theme context, beginner GitHub workflows, Technical Product Manager (TPM) frontend learning reflections, and interactive AI pair programming workflows.



- **Live GitHub Activity & Repository Dashboard (`/projects`)**:
  - Unauthenticated public requests to GitHub REST API (`api.github.com/users/{username}`).
  - **Interactive Username Switcher**: Allows visitors to lookup any GitHub user/organization (default: `@chris-lau`, presets: `@facebook`, `@vercel`).
  - **30-Day Activity Filter & Highlights**: `⚡ Active (Past 30 Days)` pill filter and glowing `🔥 Active` badges on recently updated repos.
  - **Client-Side Caching**: 15-minute `sessionStorage` TTL cache prevents hitting GitHub's 60 req/hr rate limit.
  - **Tabbed Navigation**: Accessible tab control on Projects page (`📁 Featured Projects` vs `🐙 Live GitHub Activity`).
  - **Storybook Stories**: Isolated visual component workshops for `<GitHubSummary />`, `<GitHubRepoCard />`, and `<GitHubUsernameSelector />`.

- **Accessibility & UX**:
  - Top-level React **`ErrorBoundary`** component catching runtime errors and displaying graceful recovery UI.
  - Defensive `try/catch` wrappers around `localStorage` and `sessionStorage` for strict browser privacy modes (Chrome/Safari incognito).
  - Screen reader fallback markup (`.sr-only`).
  - `aria-hidden` attributes on visual ASCII framing elements.
  - Responsive mobile navigation drawer toggle (`☰`/`✕`) in `ModernLayout`.
  - Direct `mailto:contact@chrislau.dev` contact link on `/contact`.
  - Scannable skill pill/chip tags across skills snapshots.
  - Full keyboard focus indicators and semantic HTML5 layout containers (`#main-content` skip navigation).
  - Universal zero-indent bullet list alignment (`list-style-position: inside`) and Contact page label alignment (`min-width: 95px`).
  - Floating rounded glassmorphic footer card matching content container curvature (`16px`).
  - Responsive markdown table parser rendering aligned data tables across all visual themes.

- **Testing & Quality Assurance**:
  - Storybook 8 component catalog & accessibility auditing (`@storybook/addon-a11y`).
  - Vitest + `@testing-library/react` unit & component integration tests (49 passing tests).
  - Playwright real-browser end-to-end (E2E) testing across all 3 themes.

---

## 📁 Repository Structure

```text
personalWebsite/
├── README.md                          # Master project documentation
├── personal-os-project-plan.md        # Master architectural project plan
├── phase-1-implementation-plan.md     # Phase 1 execution plan & checklist
├── phase-1-summary.md                 # Phase 1 summary & completion log
├── phase-2-implementation-plan.md     # Phase 2 execution plan & checklist
├── phase-2-summary.md                 # Phase 2 summary & completion log
├── phase-3-implementation-plan.md     # Phase 3 execution plan & checklist
├── phase-3-summary.md                 # Phase 3 summary & completion log
├── phase-3.5-implementation-plan.md   # Phase 3.5 execution plan & checklist
├── phase-3.5-summary.md               # Phase 3.5 summary & completion log
├── backend/                           # Python FastAPI Backend Service
│   ├── main.py                        # FastAPI entrypoint, CORS & error handlers
│   ├── core/                          # CorrelationID & RequestLogging Middleware
│   ├── schemas/                       # Telemetry Pydantic v2 data models
│   ├── api/endpoints/                 # REST endpoints & telemetry (/health/ready)
│   ├── data/                          # Backend Guidebook JSON repositories
│   ├── tests/                         # Pytest test suite (22 tests)
│   └── Dockerfile                     # Multi-stage container build for Render
└── frontend/                          # React 18 + TypeScript SPA app
    ├── .storybook/                    # Storybook 8 configuration
    ├── e2e/                           # Playwright end-to-end tests (3 spec files)
    ├── src/
    │   ├── api/                       # REST client & telemetryApi client
    │   ├── components/                # React UI, Blog, GitHub & Monitoring Dashboard
    │   ├── context/                   # ThemeContext (Global 3-theme manager)
    │   ├── data/                      # Frontend data importers
    │   ├── hooks/                     # Custom React hooks (useGitHubData)
    │   ├── pages/                     # Page views (MonitoringPage, HowThisSiteWorksPage)
    │   ├── utils/                     # Telemetry utilities (RUM, audit & export)
    │   └── types/                     # TypeScript interfaces (monitoring.ts)
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🐍 Phase 3 — FastAPI Backend & Python API Service (COMPLETED)

Phase 3 introduces a dedicated, production-ready **Python FastAPI Backend** (`/backend`) providing a centralized REST API service, server-side caching, and client fallback handling.

Detailed summary: [phase-3-summary.md](file:///Users/chrislau/Documents/personalWebsite/phase-3-summary.md) | Implementation plan: [phase-3-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/phase-3-implementation-plan.md)

---

## 📊 Phase 3.5 — Full-Stack Operational Monitoring & Telemetry (COMPLETED)

Phase 3.5 introduces an integrated, zero-cost, zero-cookie **Full-Stack Operational Monitoring & Telemetry System** across the Python FastAPI backend, React 18 frontend, and End-to-End application topology.

### Architectural Highlights
* **Dedicated Navigation & Monitoring Page (`/monitoring`)**:
  - Standalone operational console accessible via top header navigation across all themes (**`Ops`** in Modern, **`OPS`** in ASCII, **`top.sh`** in CLI).
* **Request Correlation (`X-Request-ID`)**: Middleware generating and propagating unique UUIDv4 headers for end-to-end request tracing (`CorrelationIDMiddleware`).
* **Structured JSON Logging**: Machine-readable JSON logs output to `stdout` containing `timestamp`, `request_id`, `method`, `path`, `status_code`, `latency_ms`, `client_ip`, and `user_agent` (`RequestLoggingMiddleware`).
* **Stack Trace Error Logging**: Global 500 exception handler outputting unhandled exception stack traces to `stderr` with request correlation IDs.
* **Sub-System Health & Telemetry Endpoints**:
  - `GET /health/live` — Fast process liveness probe.
  - `GET /health/ready` — Deep sub-system readiness probe checking RAM RSS memory (MB), uptime, environment, and CORS origins.
  - `GET /api/telemetry` & `GET /api/v1/telemetry` — Live process uptime, RSS memory, cache hit/miss status, and `slowapi` rate-limit budget telemetry.
  - > ⚠️ **Note on Container Cold Starts**: Free-tier backend hosting (Render) automatically spins down instances during inactivity. Initial health probes or API requests after periods of inactivity may experience a delay of **50 seconds or longer** while the container wakes up. Subsequent requests execute in sub-50ms.
* **Frontend Real User Monitoring (RUM) & Interactive Dashboard**:
  - Navigation timing, TTFB, DOM node count, and JS heap memory (`getBrowserPerformanceMetrics`).
  - Storage byte size, active key count, and GitHub proxy cache age (`auditSessionStorage`).
  - Diagnostic JSON report exporter (`exportDiagnosticReport`).
  - `<FullStackMonitoringDashboard />` React UI component featuring live system topology map and automated 5-step synthetic diagnostic test runner.
  - Storybook component cataloging (`FullStackMonitoringDashboard.stories.tsx`).
* **Technical Observability Blog Post**:
  - *"Demystifying Full-Stack Operational Monitoring & Telemetry: Zero-Cost Observability from Browser RUM to FastAPI Middleware"*.
* **Full-Stack Test Metrics (103 / 103 Total Tests Passing)**:
  - **Backend**: **22 / 22 Pytest tests passing** (`./.venv/bin/pytest` in `backend/`).
  - **Frontend**: **72 / 72 Vitest unit tests passing** across **14 test files** (`npm test` in `frontend/`).
  - **E2E**: **9 / 9 Playwright E2E tests passing** across **3 spec files** (`npx playwright test`).

Detailed summary: [phase-3.5-summary.md](file:///Users/chrislau/Documents/personalWebsite/phase-3.5-summary.md) | Implementation plan: [phase-3.5-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/phase-3.5-implementation-plan.md)


---

## 🔑 Environment Variables

The project uses environment variables for configuring both frontend and backend environments:

### Frontend Environment Variables (`frontend/.env` / Cloudflare Pages)

| Variable | Required | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Optional | `http://localhost:8000/api` | Base URL for FastAPI backend endpoints. If unset or backend is offline, frontend automatically falls back to local data. |

### Backend Environment Variables (`backend/.env` / Render)

| Variable | Required | Default / Example | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Yes | `development` / `production` | Environment runtime flag (`development`, `production`, `test`). |
| `PORT` | Optional | `8000` (or `10000` on Render) | Port for Uvicorn web server to listen on. |
| `ALLOWED_ORIGINS` | Optional | `http://localhost:5173,https://chrislau.dev` | Comma-separated list of allowed CORS origins. |
| `RATE_LIMIT_PER_MINUTE` | Optional | `60` | Max requests per minute per IP address (`slowapi`). |
| `GITHUB_TOKEN` | Optional | `""` | Optional personal access token for higher GitHub REST API rate limits server-side. |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18+`
- **npm**: `v9+`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chris-lau/personalWebsite.git
   cd personalWebsite/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 💻 Development & Scripts

Navigate to the `frontend/` directory to run commands:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Vite development server (`http://localhost:5173`) |
| `npm run build` | Compiles TypeScript and builds production bundle in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs TypeScript compiler type check (`tsc --noEmit`) |
| `npm test` | Runs Vitest unit & component integration test suite |
| `npm run test:e2e` | Runs Playwright end-to-end browser tests |
| `npm run test:e2e:headed` | Runs Playwright tests in visible browser mode |
| `npm run test:e2e:ui` | Opens interactive Playwright Test UI runner |
| `npm run storybook` | Starts Storybook UI component workshop (`http://localhost:6006`) |
| `npm run build-storybook` | Builds static Storybook website |

---

## 🧪 Testing

### Unit & Component Tests (Vitest)
Executes component rendering, page behavior, blog engine filtering, and router integration tests:
```bash
npm test
```

### End-to-End Tests (Playwright)
Launches Chromium instances to test full user journeys, 3-theme switching persistence (`ascii`, `cli`, `modern`), tag filtering, and 404 routing:
```bash
npm run test:e2e
```

---

## 🌐 Deployment & Cloud Infrastructure

The personal website monorepo is deployed across specialized cloud providers:

| Deployment Target | Service Type | Cloud Host | Root Directory | Build Command | Output Directory | Live URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **React Frontend** | Static SPA | Cloudflare Pages | `frontend` | `npm run build` | `dist` | [https://chrislau.dev](https://chrislau.dev) |
| **Component Storybook** | UI Library | Cloudflare Pages | `frontend` | `npm run build-storybook` | `storybook-static` | [https://chris-lau-storybook.pages.dev](https://chris-lau-storybook.pages.dev) |
| **FastAPI Backend** | Docker Web Service | Render | `backend` | `docker build` (Dockerfile) | N/A (Port 10000) | `https://...onrender.com` |
| **Swagger UI / ReDoc** | OpenAPI Docs | Render (Auto) | `backend` | Auto-generated by FastAPI | `/docs` & `/redoc` | `https://...onrender.com/docs` |

---

### 1. Cloudflare Pages Settings (Frontend & Storybook)

Cloudflare Pages deploys the React SPA and Storybook component library statically:

- **Main Frontend Project (`chrislau.dev`)**:
  - **Root directory**: `frontend`
  - **Build command**: `npm run build`
  - **Build output directory**: `dist`
  - **Custom Domain**: Attached `chrislau.dev` under Custom Domains settings.

- **Storybook Project (`chris-lau-storybook.pages.dev`)**:
  - **Root directory**: `frontend`
  - **Build command**: `npm run build-storybook`
  - **Build output directory**: `storybook-static`

---

### 2. Render Docker Web Service (FastAPI Backend & Swagger UI)

- **Root directory**: `backend`
- **Runtime**: **Docker** (uses multi-stage `backend/Dockerfile`)
- **Environment Variables**:
  - `ENVIRONMENT`: `production`
  - `ALLOWED_ORIGINS`: `https://chrislau.dev`
- **Auto-Generated Swagger UI**: Served automatically at `/docs` (e.g. `https://...onrender.com/docs`) and `/redoc`.

---

### 3. SPA Routing & `_redirects` File

This project includes `frontend/public/_redirects` with the rule:
```text
/*  /index.html  200
```

Instructs Cloudflare to direct all client-side routes (`/blog`, `/projects`, `/about`, `/guidebook`) back to `index.html` with a `200` status so React Router handles navigation cleanly without 404 errors.


