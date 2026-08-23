# Chris Lau // AI & Product Leadership Website (Light Crisp Design System)

A modern, responsive, accessible personal portfolio website and blog engine with a **single token-driven design system (Light Crisp)** rendered in **light and dark modes**, a retrieval-grounded AI chat ("Ask this site"), a full FastAPI backend with PostgreSQL, and live operational telemetry.

Built with **React 18**, **TypeScript**, **Vite 5**, **React Router 6**, **Storybook 10**, **Vitest**, **Playwright**, and a **Python FastAPI** backend.

Live Website: [https://chrislau.dev](https://chrislau.dev)  
Live Component Storybook: [https://chris-lau-storybook.pages.dev](https://chris-lau-storybook.pages.dev)  
GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

---

## 🎨 Key Features

- **Light Crisp Design System (One Design, Two Modes)**:
  - **Token-Driven Styling**: Every visual decision — colors, typography, radii, shadows, borders — is a CSS custom property in `frontend/src/styles/variables.css`. Components consume semantic tokens (`var(--bg-primary)`, `var(--accent-primary)`, `var(--radius-md)`); restyling the whole site is a one-file change.
  - **Light & Dark Modes**: The `:root` block defines the light palette; a single `[data-theme="dark"]` block flips the entire site. `ThemeContext` persists the mode to `localStorage` and automatically migrates legacy values from the retired three-theme era (`modern`/`ascii`/`cli` → `light`).
  - **One-Point Shape Control**: Chip/badge shape sitewide is set by `--radius-chip`; buttons by `--radius-md`.
  - **Consistent Component Grammar**: Five normalized button species (primary, default, ghost, chip, tab), numbered-section heads (`Section` component: index chip → title → hairline rule), editorial `work-row` lists for experience/work items, and boxed `BoxContainer` panels reserved for operational surfaces (chat, monitoring).
  - **One Layout**: A single `ModernLayout` rendered through the `LayoutRenderer` seam — no per-theme layout components.

- **Chat-First Home Page ("Ask this site")**:
  - **Two-Column Hero**: A statement headline, status line, and direct exploration dock (About · Projects · Experience · Blog · Now · GitHub · LinkedIn) on the left; the interactive **Ask this site** chat column on the right, above the fold (stacks cleanly on mobile).
  - **One-Click Starter Prompts**: Curated intent chips ("What is Chris's biggest project?", "What is his core tech stack?", …) stream answers with zero typing.
  - **Programmatic Chat API**: `openChat({ starter })` (via `chatControl.ts`) lets any page open the chat panel with a pre-seeded question; on `/` it scrolls to the in-page chat column instead.
  - **Single Chat Surface**: The floating launcher pill hides itself on `/` and `/amazon-tools` where dedicated in-page chat interfaces operate.
  - **Router-Aware Markdown Links**: Assistant replies render site-relative "Read more:" links as React Router `<Link>`s (no hard reload).

- **AI Chat Widget ("Chat with Chris")**:
  - **Retrieval-Grounded Q&A**: Answers questions using the site's blog posts, guidebooks, profile, projects, skills, site architecture, and current focus as context (~71K tokens) — no hallucination about unrelated topics.
  - **Streaming Replies (SSE)**: Replies stream token-by-token over Server-Sent Events.
  - **Multi-Provider, One SDK**: A single OpenAI-compatible client (`POST /api/chat`) serves Gemini, DeepSeek, and OpenAI behind a UI model switcher — only providers with a configured key appear in the dropdown.
  - **Defensive Boundaries**: Strict system prompt resists prompt injection; per-IP rate limit plus daily caps and bounded conversation history control cost/abuse.
  - **Chat Observability (Complete — All 7 Phases)**: Structured SSE events (`token`, `meta`, `meta_server`, `usage`, `done`, `error`), real token usage for OpenAI/DeepSeek, two-segment server timing for TTFT decomposition (`ttft_client_ms ≈ network_rtt + server_pre_llm_ms + server_llm_to_first_token_ms`), typed frontend contracts (`ChatMessageMetrics`, `MODEL_PRICING`), and a companion observability panel (session summary, latency sparkline, per-message metrics with segmented TTFT bar, model comparison).

- **Interactive Dual Engineering Guidebook (`/guidebook`)**:
  - **Dual Interactive Books (16 Chapters Total)**: *Frontend Foundations* (9 chapters: React fundamentals, component design, state management, SPA routing, API caching, testing strategies) and *Production-Ready Backend Engineering* (7 chapters: REST design, Pydantic schemas, middleware, database integration, Alembic migrations, SSE streaming, Docker containerization).
  - Dynamic book toggle switcher, collapsible mobile Table of Contents, syntax-highlighted code blocks, WCAG tables, and next/prev chapter pagination.

- **Full-Featured Technical Blog Engine (`/blog`)**:
  - Modular Markdown storage in `backend/posts/`, mapped through `backend/data/blog_posts.json` and rendered by a shared `<MarkdownRenderer>` (`react-markdown` + `remark-gfm`: links, tables, lists, blockquotes with TL;DR callout detection).
  - Query helpers (`getAllBlogPosts`, `getBlogPostBySlug`, `getBlogPostsByTag`, `getGroupedBlogPostsByCategory`, `getRelatedBlogPosts`).
  - **22 technical articles** organized under 4 categories (`Backend Architecture & Security`, `React Architecture & Design Systems`, `Developer Workflows & Tooling`, `Testing & Quality Assurance`) with automated Related Articles suggestions and prominent TL;DR callouts.

- **Amazon Seller Intelligence & Opportunity Suite (`/amazon-tools`)**:
  - **Live Product Search & Scraping Proxy**: FastAPI backend proxy (`GET /api/amazon/search`, `GET /api/amazon/asin/{asin}`) parsing live Amazon marketplace HTML with in-memory TTL caching, plus autocomplete/demand-velocity proxies (`GET /api/amazon/trends`).
  - **Opportunity Finder**: 12+ product micro-niches with automated 0–100 Opportunity Scores.
  - **2026 FBA Unit Economics Calculator**: 2026 Amazon fee schedules, Low-Price FBA breaks, referral tiers, dimensional weight, and Markdown sourcing export.
  - **Review Gap & AI Listing Scanner**, **Keyword Velocity Explorer**, and **AI Companion Mode** (split-screen copilot with tab-aware starters and 1-click ask actions, grounded in 2026 FBA economics).
  - **Truthful Data Flagging**: Live marketplace data is differentiated from simulated benchmarks (`is_live` flags, source discriminators, warning pills).

- **Full-Stack Operational Monitoring & Telemetry (`/monitoring`)**:
  - Request correlation (`X-Request-ID` UUIDv4), structured JSON logging, sub-system health/readiness probes (`/health/live`, `/health/ready`), and process/DB telemetry (`/api/telemetry`).
  - Browser Real User Monitoring (navigation timing, TTFB, DOM nodes, JS heap), storage audits, and a diagnostic JSON exporter.
  - `<FullStackMonitoringDashboard />` with a 4-node live topology map (Cloudflare SPA → FastAPI → PostgreSQL → GitHub API), database health metrics, and an automated 5-step synthetic diagnostic runner.

- **Live GitHub Activity & Repository Dashboard (`/projects`)**:
  - Server-side GitHub proxy (`GET /api/github-summary`) with optional `GITHUB_TOKEN` (5000 req/hr) and a 15-minute in-memory TTL cache; client falls back to direct GitHub API if the backend is offline.
  - Interactive username switcher, 30-day activity filter with Active badges, client-side `sessionStorage` caching, and accessible tabbed navigation.

- **Accessibility, Mobile Responsiveness & UX**:
  - Dynamic viewport units (`100dvh`) for full-bleed sticky header; standardized 640/768/900px breakpoint hierarchy.
  - Touch targets ≥ 40–44px; 16px base input sizing prevents iOS zoom.
  - Semantic Lucide SVG icons, WCAG 2.1 AA contrast via token values, decorative chrome hidden with `aria-hidden`, full keyboard focus indicators, `#main-content` skip navigation.
  - Top-level `ErrorBoundary` and defensive `try/catch` around `localStorage`/`sessionStorage`.

- **Testing & Quality Assurance**:
  - Vitest + React Testing Library unit & component integration tests (**215 / 215 passing** across 26 test files).
  - Playwright real-browser end-to-end tests (**19 / 19 passing** across 6 spec files), including light/dark mode toggle persistence.
  - Pytest backend unit & integration tests (**69 / 69 passing**).
  - Storybook 10 component catalog & accessibility auditing (`@storybook/addon-a11y`).

---

## 📁 Repository Structure

```text
personalWebsite/
├── README.md                          # Master project documentation (this file)
├── personal-os-project-plan.md        # Master architectural roadmap (Phase 5 auth pending)
├── phase-5-implementation-plan.md     # Next up: auth & draft posts (not yet implemented)
├── backend/                           # Python FastAPI Backend Service
│   ├── main.py                        # FastAPI entrypoint, CORS & error handlers
│   ├── core/                          # DB configuration, models, middleware & rate limiting
│   ├── schemas/                       # Pydantic v2 data models (incl. GitHub proxy)
│   ├── api/endpoints/                 # REST endpoints, GitHub proxy, chat (SSE), telemetry & health
│   ├── data/                          # Structured data (blog index, guidebooks, Amazon knowledge)
│   ├── posts/                         # Blog & guidebook markdown sources
│   ├── migrations/                    # Alembic database migration revisions
│   ├── seed.py                        # Idempotent database seeding pipeline
│   ├── tests/                         # Pytest test suite (69 tests)
│   └── Dockerfile                     # Multi-stage container build (non-root) for Render
└── frontend/                          # React 18 + TypeScript SPA app
    ├── .storybook/                    # Storybook 10 configuration
    ├── e2e/                           # Playwright end-to-end tests (6 spec files)
    ├── src/
    │   ├── api/                       # REST clients, chat SSE, config (MODEL_PRICING), telemetryApi
    │   ├── components/                # UI, Blog, Chat, Markdown, GitHub & Monitoring Dashboard
    │   ├── context/                   # ThemeContext (light/dark manager + legacy migration)
    │   ├── data/                      # Frontend data importers
    │   ├── hooks/                     # Custom React hooks (useGitHubData, useChat, useNavDropdown)
    │   ├── pages/                     # Page views (lazy-loaded, code-split)
    │   ├── styles/                    # variables.css (design tokens — single source of truth)
    │   ├── utils/                     # Telemetry utilities (RUM, audit & export)
    │   └── types/                     # TypeScript interfaces (theme.ts, chat.ts, monitoring.ts)
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🐍 FastAPI Backend & Database

The backend (`/backend`) is a production-ready Python FastAPI service providing REST APIs, server-side caching, and client fallback handling.

- **Environment-Aware Dual Database**: Zero-config SQLite locally (`sqlite:///./personal_os.db`); managed free-tier Aiven PostgreSQL in production (`DATABASE_URL`). SQLAlchemy 2.0 ORM models (`Project`, `Technology`, `NowEntry`, `ReadingItem`) with Alembic schema migrations.
- **Resilient Fallback**: Idempotent JSON-to-SQL seeding (`seed.py`) plus API fallback handlers returning static local data if the database is unreachable or unseeded — the website stays up regardless.
- **Pydantic v2 Schemas**: Strict input/output validation across all endpoints; auto-generated OpenAPI docs at `/docs` (Swagger UI) and `/redoc`.
- **Automated 6-Hour Keep-Alive**: GitHub Actions workflow (`.github/workflows/keep-alive.yml`) pings `/health/ready` every 6 hours to keep cloud PostgreSQL active.
- **Server-Side GitHub Proxy**: Async HTTPX fetch with 15-minute TTL cache to eliminate client-side rate limits.

> ⚠️ **Note on Container Cold Starts**: Free-tier backend hosting (Render) spins down during inactivity. Initial API requests may take ~50s to wake the container; subsequent requests run in <50ms.

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

> **Local chat note**: with no LLM keys in `backend/.env`, the chat widget runs in "limited mode" (no streaming answers) — everything else works fully offline of AI providers.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18+`
- **npm**: `v9+`
- **Python**: `3.11+` (for the backend)

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

3. (Optional) Backend: create a virtualenv in `backend/`, `pip install -r requirements.txt`, then run `uvicorn main:app --reload`.

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
Executes component rendering, page behavior, blog engine filtering, and router integration tests (215 tests across 26 files):
```bash
npm test
```

### End-to-End Tests (Playwright)
Launches Chromium instances to test full user journeys — navigation, light/dark mode toggle persistence, tag filtering, chat launcher behavior, and 404 routing (19 tests across 6 spec files):
```bash
npm run test:e2e
```

### Backend Tests (Pytest)
Runs the FastAPI test suite (69 tests) from `backend/`:
```bash
python -m pytest
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

### 1. Cloudflare Pages Settings (Frontend & Storybook)

- **Main Frontend Project (`chrislau.dev`)**: Root directory `frontend`, build `npm run build`, output `dist`, `VITE_API_URL` set to `https://personalwebsite-w1mp.onrender.com/api`, custom domain `chrislau.dev` attached.
- **Storybook Project (`chris-lau-storybook.pages.dev`)**: Root directory `frontend`, build `npm run build-storybook`, output `storybook-static`.

### 2. Render Docker Web Service (FastAPI Backend & Swagger UI)

- **Root directory**: `backend` — **Runtime**: Docker (multi-stage `backend/Dockerfile`)
- **Environment Variables**: `ENVIRONMENT=production`, `DATABASE_URL` (Aiven PostgreSQL), `ALLOWED_ORIGINS=https://chrislau.dev,https://www.chrislau.dev,https://personalwebsite-8i8.pages.dev`
- **Health & Telemetry**: `/health/live`, `/health/ready`, `/api/telemetry`; automated 6-hour keep-alive cron.
- **Auto-Generated Swagger UI**: `/docs` and `/redoc`.

### 3. SPA Routing & `_redirects` File

`frontend/public/_redirects` contains:
```text
/*  /index.html  200
```

This directs all client-side routes (`/blog`, `/projects`, `/about`, `/guidebook`) back to `index.html` with a `200` status so React Router handles navigation cleanly without 404 errors.
