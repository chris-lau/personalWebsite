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
- **Consolidated Navigation & Submenus**:
  - Consolidated 10 flat navigation items down to 3 intuitive top-level categories (**About** ▾, **Work & Writing** ▾, **System & Ops** ▾) + standalone **Contact** link.
  - **Logo / Brand (`CL / Chris Lau`)**: Direct link to Home (`/`).
  - **`About` ▾**: Bio & Profile (`/about`), Experience & Career (`/experience`), What I'm Doing Now (`/now`).
  - **`Work & Writing` ▾**: Portfolio Projects (`/projects`), Technical Blog (`/blog`), Engineering Book (`/guidebook`).
  - **`System & Ops` ▾**: Site Architecture & Stack (`/how-this-site-works`), Ops Dashboard (`/monitoring`).
  - **`Contact`**: Standalone CTA link (`/contact`).
  - **Theme-Specific Submenu Adaptations**: Glassmorphism floating cards in Modern theme, Unix folder structures (`about/`, `work/`, `sys/`) in CLI theme, and ASCII border popover boxes (`+--- ABOUT ---+`) in ASCII theme.
  - **Accessibility & UX**: W3C ARIA disclosure semantics (`aria-expanded`, `aria-haspopup="true"`, `aria-controls`), keyboard `Escape` key close, auto-dismiss on outside click, and responsive mobile drawer accordion collapse.

- **Interactive Frontend Development Guidebook App (`/guidebook`)**:
  - Full 9-chapter interactive guidebook: *Building Modern Web Applications: A Step-by-Step Guide for Frontend Beginners*.
  - Features sticky Table of Contents sidebar, markdown canvas rendering, syntax-highlighted line-by-line code blocks, WCAG tables, and next/prev chapter pagination buttons.
  - Includes **Chapter 9: Consuming External REST APIs & Client-Side Caching** (decoupling API view models, 15-minute `sessionStorage` TTL caching, custom hooks, and Storybook stories).
  - **Performance & Mobile Optimization**: `useMemo` pre-parsed markdown node caching, container-relative instant scrolling (`scrollToReader()`), and CSS Grid `minmax(0, 1fr)` track sizing for responsive mobile reading without horizontal viewport overflow.

- **Full-Featured Technical Blog Engine**:
  - Modular Markdown storage in `backend/posts/`, auto-discovered at build time via Vite's `import.meta.glob` (no manual import lists to maintain).
  - Full GFM Markdown rendering via `react-markdown` + `remark-gfm` (shared `<MarkdownRenderer>` component supporting inline links, bold, code, tables, ordered/unordered lists, blockquotes with TL;DR callout detection, and images).
  - Query helpers (`getAllBlogPosts`, `getBlogPostBySlug`, `getBlogPostsByTag`, `getGroupedBlogPostsByCategory`, `getRelatedBlogPosts`).
  - **Executive Summaries**: Every article features a prominent **TL;DR** callout box for instant comprehension.
  - **Category Grouping & Discovery**: Articles organized under clear technical categories (`React Architecture & Design Systems`, `Developer Workflows & Tooling`, `Testing & Quality Assurance`) with automated **Related Articles** suggestions.
  - Includes 13 technical articles covering React architecture, SPA routing mechanics & Cloudflare hosting, scaffolding, 4-tier testing strategies, design tokens, multi-theme context, beginner GitHub workflows, Technical Product Manager (TPM) frontend learning reflections, and interactive AI pair programming workflows.

- **AI Chat Widget ("Chat with Chris")**:
  - **Retrieval-Grounded Q&A**: A visitor-facing chat widget that answers questions using the site's blog posts, guidebooks, and profile as context — no hallucination about unrelated topics.
  - **Streaming Replies (SSE)**: Replies stream token-by-token over Server-Sent Events for a responsive UX.
  - **Multi-Provider, One SDK**: A single OpenAI-compatible client (`POST /api/chat`) serves Gemini, DeepSeek, and OpenAI behind a UI model switcher — only providers with a configured key appear in the dropdown.
  - **Defensive Boundaries**: Strict system prompt resists prompt injection; per-IP rate limit (`CHAT_RATE_LIMIT_PER_MINUTE`) plus daily caps (`CHAT_DAILY_GLOBAL_LIMIT` / `CHAT_DAILY_PER_IP_LIMIT`) and bounded conversation history control cost/abuse.
  - **Chat Observability (Backend — Phases 1–2 Complete)**: The SSE stream now emits structured event dicts (`token`, `meta`, `meta_server`, `usage`, `done`, `error`) instead of raw strings. Real token usage (`prompt_tokens`/`completion_tokens`) is reported for OpenAI and DeepSeek via provider-aware `stream_options` (Gemini is correctly excluded). Two server-side timing segments (`server_pre_llm_ms` for routing/prompt-build overhead, `server_llm_to_first_token_ms` for LLM inference to first token) enable TTFT decomposition: `ttft_client_ms ≈ network_rtt + server_pre_llm_ms + server_llm_to_first_token_ms`. Frontend types (`ChatMessageMetrics`, `ChatSessionSummary`, `StreamProgress`) and a pricing table (`MODEL_PRICING` with `Object.freeze` + `Readonly`) define the typed contract for upcoming observability UI phases (data layer, `useChat` hook, observability panel, companion layout).

- **Live GitHub Activity & Repository Dashboard (`/projects`)**:
  - **Backend GitHub Proxy**: Server-side proxy endpoint (`GET /api/github-summary`) using `httpx` + optional `GITHUB_TOKEN` (5000 req/hr authenticated vs 60 req/hr unauthenticated), with a 15-minute in-memory TTL cache. Frontend calls the proxy and falls back to direct GitHub API if the backend is offline.
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
  - Responsive mobile navigation drawer toggle (`☰`/`✕`) in `ModernLayout` (hidden on desktop viewports).
  - Direct `mailto:contact@chrislau.dev` contact link on `/contact`.
  - Scannable skill pill/chip tags across skills snapshots.
  - Full keyboard focus indicators and semantic HTML5 layout containers (`#main-content` skip navigation).
  - Universal zero-indent bullet list alignment (`list-style-position: inside`) and Contact page label alignment (`min-width: 95px`).
  - Floating rounded glassmorphic footer card matching content container curvature (`16px`).
  - Responsive markdown table parser rendering aligned data tables across all visual themes.

- **Testing & Quality Assurance**:
  - Storybook 8 component catalog & accessibility auditing (`@storybook/addon-a11y`).
  - Vitest + `@testing-library/react` unit & component integration tests (**138 / 138 passing tests** across 20 test files).
  - Playwright real-browser end-to-end (E2E) testing across all 3 themes (**9 / 9 passing tests** across 3 spec files).
  - Pytest backend unit & integration tests (**60 / 60 passing tests**).

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
├── phase-4-implementation-plan.md     # Phase 4 execution plan & checklist
├── phase-4-summary.md                 # Phase 4 summary & completion log
├── ai-chat-implementation-plan.md     # AI chat widget implementation plan
├── ai-chat-plan-review.md             # AI chat plan review report
├── backend/                           # Python FastAPI Backend Service
│   ├── main.py                        # FastAPI entrypoint, CORS & error handlers
│   ├── core/                          # DB configuration, models, middleware & rate limiting
│   ├── schemas/                       # Pydantic v2 data models (incl. GitHub proxy)
│   ├── api/endpoints/                 # REST endpoints, GitHub proxy, chat (SSE), telemetry & health
│   ├── data/                          # Backend data (blog posts JSON, Guidebook repos)
│   ├── migrations/                    # Alembic database migration revisions
│   ├── seed.py                        # Idempotent database seeding pipeline
│   ├── tests/                         # Pytest test suite (60 tests)
│   └── Dockerfile                     # Multi-stage container build (non-root) for Render
└── frontend/                          # React 18 + TypeScript SPA app
    ├── .storybook/                    # Storybook 8 configuration
    ├── e2e/                           # Playwright end-to-end tests (3 spec files)
    ├── src/
    │   ├── api/                       # REST clients, chat SSE, config (MODEL_PRICING), telemetryApi
    │   ├── components/                # UI, Blog, Chat, Markdown, GitHub & Monitoring Dashboard
    │   ├── context/                   # ThemeContext (Global 3-theme manager)
    │   ├── data/                      # Frontend data importers (import.meta.glob)
    │   ├── hooks/                     # Custom React hooks (useGitHubData, useChat, useNavDropdown)
    │   ├── pages/                     # Page views (lazy-loaded, code-split)
    │   ├── utils/                     # Telemetry utilities (RUM, audit & export)
    │   └── types/                     # TypeScript interfaces (monitoring.ts, chat.ts)
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

Detailed summary: [phase-3.5-summary.md](file:///Users/chrislau/Documents/personalWebsite/phase-3.5-summary.md) | Implementation plan: [phase-3.5-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/phase-3.5-implementation-plan.md)

---

## 🗄️ Phase 4 — PostgreSQL Database & CRUD Integration (COMPLETED)

Phase 4 transitions the backend from static JSON loading to a persistent relational database using SQLAlchemy 2.0 ORM and Alembic migrations.

### Architectural Highlights
* **Environment-Aware Dual Database Setup**:
  - **Local Development:** Zero-config file-based SQLite database (`sqlite:///./personal_os.db`).
  - **Production:** Managed free-tier Aiven PostgreSQL instance (`DATABASE_URL`).
* **SQLAlchemy 2.0 & Alembic Migrations**:
  - Relational database models for `Project`, `Technology`, `NowEntry`, and `ReadingItem` in `backend/core/models.py`.
  - Schema version management via Alembic (`0101177364df_initial_schema_migration.py`).
* **Data Seeding & Resilience Pipeline**:
  - Idempotent seed script (`seed.py`) converting legacy JSON data into database rows.
  - Automatic fallback handler in `/api/projects` and `/api/now` returning static local JSON if the database is unreachable or unseeded, guaranteeing 100% website uptime.
* **Full Test Metrics (211 / 211 Total Tests Passing)**:
  - **Backend**: **60 / 60 Pytest unit tests passing** (including `tests/test_database.py`, `tests/test_chat.py`).
  - **Frontend**: **142 / 142 Vitest unit tests passing** across **20 test files**.
  - **E2E**: **9 / 9 Playwright E2E tests passing**.

Detailed summary: [phase-4-summary.md](file:///Users/chrislau/Documents/personalWebsite/phase-4-summary.md) | Implementation plan: [phase-4-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/phase-4-implementation-plan.md)

---

## 🤖 AI Chat Widget + Chat Observability

### AI Chat Widget ("Chat with Chris") — IMPLEMENTED

A visitor-facing RAG chat widget answering questions grounded in the site's blog posts, guidebooks, and profile (~71K token context — no vector DB needed). Streams replies token-by-token over Server-Sent Events via a single OpenAI-compatible SDK wrapper supporting Gemini, DeepSeek, and OpenAI behind a UI model switcher.

**Implementation plan:** [ai-chat-implementation-plan.md](file:///Users/chrislau/Documents/personalWebsite/ai-chat-implementation-plan.md) | **Review:** [ai-chat-plan-review.md](file:///Users/chrislau/Documents/personalWebsite/ai-chat-plan-review.md)

### Chat Observability — IN PROGRESS (Phases 1–2 Complete, Phases 3–6 Remaining)

A real-time observability dashboard transforming the chat widget into a companion-mode split-panel layout (chat left, observability right). The backend emits structured SSE events with token usage and server-side timing; the frontend measures TTFT, streaming throughput, and per-message cost.

**Full plan:** [PLAN-chat-observability.md](file:///Users/chrislau/Documents/personalWebsite/PLAN-chat-observability.md)

| Phase | Status | What Ships |
|---|---|---|
| 1. Backend SSE | ✅ Complete | Structured event dicts, provider-aware `stream_options`, two-segment `meta_server` timing |
| 2. Frontend Types | ✅ Complete | `ChatMessageMetrics`, `ChatSessionSummary`, `StreamProgress`, `MODEL_PRICING` table |
| 3. Data Layer | 🔲 Pending | Timed, metric-emitting `sendChatMessage` with SSE parsing, fallback token estimation |
| 4. `useChat` Hook | 🔲 Pending | `metricsMap`, `streamProgress`, ref-based chunk counting, cleanup on abort/clear |
| 5. Observability Panel | 🔲 Pending | Session summary card, latency sparkline, live streaming indicator, per-message metrics with segmented TTFT bar |
| 6. Companion Layout | 🔲 Pending | Split-panel UX, mobile tabs, companion-class on `<section>`, localStorage toggle persistence |
| 7. Tests | 🔲 Pending | Backend event-shape/stream_options/usage tests; frontend SSE parsing, chunk honesty, clearChat reset, companion-class regression |

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
| `DATABASE_URL` | Optional | `sqlite:///./personal_os.db` | Connection URI for PostgreSQL (Aiven) or SQLite database. |
| `ALLOWED_ORIGINS` | Optional | `http://localhost:5173,https://chrislau.dev` | Comma-separated list of allowed CORS origins. |
| `RATE_LIMIT_PER_MINUTE` | Optional | `60` | Max requests per minute per IP address (`slowapi`). |
| `GITHUB_TOKEN` | Optional | `""` | Optional personal access token for higher GitHub REST API rate limits server-side. |
| `GEMINI_API_KEY` | Optional | `""` | Gemini API key. Enables Gemini models in the chat widget. |
| `DEEPSEEK_API_KEY` | Optional | `""` | DeepSeek API key. Enables DeepSeek models in the chat widget. |
| `OPENAI_API_KEY` | Optional | `""` | OpenAI API key. Enables GPT models in the chat widget. |
| `CHAT_DEFAULT_MODEL` | Optional | `gemini-2.5-flash` | Default model id when the visitor doesn't pick one. |
| `CHAT_RATE_LIMIT_PER_MINUTE` | Optional | `10` | Stricter per-IP rate limit for `POST /api/chat` (separate from `RATE_LIMIT_PER_MINUTE`). |
| `CHAT_DAILY_GLOBAL_LIMIT` | Optional | `200` | Total chat requests allowed per UTC day across all visitors (cost/abuse backstop; in-memory, resets at midnight). `0` disables. |
| `CHAT_DAILY_PER_IP_LIMIT` | Optional | `30` | Per-IP daily chat request cap (fairness backstop). `0` disables. |

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
| **FastAPI Backend** | Docker Web Service | Render | `backend` | `docker build` (Dockerfile) | N/A (Port 10000) | [https://personalwebsite-w1mp.onrender.com](https://personalwebsite-w1mp.onrender.com) |
| **Swagger UI / ReDoc** | OpenAPI Docs | Render (Auto) | `backend` | Auto-generated by FastAPI | `/docs` & `/redoc` | [https://personalwebsite-w1mp.onrender.com/docs](https://personalwebsite-w1mp.onrender.com/docs) |

---

### 1. Cloudflare Pages Settings (Frontend & Storybook)

Cloudflare Pages deploys the React SPA and Storybook component library statically:

- **Main Frontend Project (`chrislau.dev`)**:
  - **Root directory**: `frontend`
  - **Build command**: `npm run build`
  - **Build output directory**: `dist`
  - **Environment Variables**: `VITE_API_URL` set to `https://personalwebsite-w1mp.onrender.com/api`
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
  - `DATABASE_URL`: Managed Aiven PostgreSQL Connection String
  - `ALLOWED_ORIGINS`: `https://chrislau.dev,https://www.chrislau.dev,https://personalwebsite-8i8.pages.dev`
- **Health Check & Telemetry Endpoints**:
  - Liveness Probes: `/health/live` & `/api/health/live`
  - Readiness & DB Probes: `/health/ready` & `/api/health/ready`
  - Telemetry Metrics: `/api/telemetry`
- **Auto-Generated Swagger UI**: Served automatically at `/docs` ([https://personalwebsite-w1mp.onrender.com/docs](https://personalwebsite-w1mp.onrender.com/docs)) and `/redoc`.

---

### 3. SPA Routing & `_redirects` File

This project includes `frontend/public/_redirects` with the rule:
```text
/*  /index.html  200
```

Instructs Cloudflare to direct all client-side routes (`/blog`, `/projects`, `/about`, `/guidebook`) back to `index.html` with a `200` status so React Router handles navigation cleanly without 404 errors.


