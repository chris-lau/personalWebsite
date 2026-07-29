# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: monitoring.spec.ts >> Operational Monitoring Dashboard E2E Tests >> navigates to /how-this-site-works and renders Full-Stack Monitoring Dashboard
- Location: e2e/monitoring.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD')
Expected: visible
Error: strict mode violation: getByText('FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD') resolved to 2 elements:
    1) <span class="box-title">[ FULL-STACK OPERATIONAL MONITORING & TELEMETRY D…</span> aka getByText('[ FULL-STACK OPERATIONAL')
    2) <h3 class="box-section-heading">FULL-STACK OPERATIONAL MONITORING & TELEMETRY DAS…</h3> aka getByRole('heading', { name: 'FULL-STACK OPERATIONAL' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to main content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e5]:
    - generic [ref=e6]:
      - link "CL / Chris Lau" [ref=e7] [cursor=pointer]:
        - /url: /
        - generic [ref=e8]: CL
        - generic [ref=e9]: /
        - generic [ref=e10]: Chris Lau
      - radiogroup "Theme Mode Selection" [ref=e12]:
        - radio "Set theme to MODERN" [checked] [ref=e13] [cursor=pointer]: MODERN
        - radio "Set theme to ASCII" [ref=e14] [cursor=pointer]: ASCII
        - radio "Set theme to CLI" [ref=e15] [cursor=pointer]: CLI
      - navigation "Main Navigation" [ref=e16]:
        - list [ref=e17]:
          - listitem [ref=e18]:
            - link "Home" [ref=e19] [cursor=pointer]:
              - /url: /
          - listitem [ref=e20]:
            - link "About" [ref=e21] [cursor=pointer]:
              - /url: /about
          - listitem [ref=e22]:
            - link "Projects" [ref=e23] [cursor=pointer]:
              - /url: /projects
          - listitem [ref=e24]:
            - link "Blog" [ref=e25] [cursor=pointer]:
              - /url: /blog
          - listitem [ref=e26]:
            - link "Book" [ref=e27] [cursor=pointer]:
              - /url: /guidebook
          - listitem [ref=e28]:
            - link "Experience" [ref=e29] [cursor=pointer]:
              - /url: /experience
          - listitem [ref=e30]:
            - link "Now" [ref=e31] [cursor=pointer]:
              - /url: /now
          - listitem [ref=e32]:
            - link "Stack" [ref=e33] [cursor=pointer]:
              - /url: /how-this-site-works
          - listitem [ref=e34]:
            - link "Contact" [ref=e35] [cursor=pointer]:
              - /url: /contact
  - main [ref=e36]:
    - generic [ref=e39]:
      - generic [ref=e40]:
        - heading "HOW THIS SITE WORKS" [level=3] [ref=e41]
        - generic [ref=e42]:
          - paragraph [ref=e43]: This portfolio is built as a lightweight, stateful, full-stack application showcasing modern frontend architectural principles, strict typing, dynamic theming, multi-tier testing strategies, operational telemetry, and a Python FastAPI backend.
          - generic [ref=e44]:
            - heading "> LIVE EXPLORERS & API INTERFACES" [level=3] [ref=e45]
            - generic [ref=e46]:
              - link "🎨 Live Storybook UI" [ref=e47] [cursor=pointer]:
                - /url: https://chris-lau-storybook.pages.dev
              - link "⚡ FastAPI Swagger UI (/docs)" [ref=e48] [cursor=pointer]:
                - /url: http://localhost:8000/docs
              - link "📖 ReDoc Specs (/redoc)" [ref=e49] [cursor=pointer]:
                - /url: http://localhost:8000/redoc
              - link "📋 OpenAPI Schema" [ref=e50] [cursor=pointer]:
                - /url: http://localhost:8000/openapi.json
          - generic [ref=e51]:
            - generic [ref=e52]:
              - heading "> CORE ARCHITECTURE & FRAMEWORK" [level=3] [ref=e53]
              - generic [ref=e54]:
                - generic [ref=e55]:
                  - heading "* React 18 & TypeScript (Strict Mode)" [level=4] [ref=e56]
                  - paragraph [ref=e57]: Built with strongly typed interfaces (Profile, Project, Experience, SiteArchitectureCategory, ThemeMode) ensuring compile-time safety and zero any types.
                - generic [ref=e58]:
                  - heading "* Vite 5 Build Engine" [level=4] [ref=e59]
                  - paragraph [ref=e60]: Configured with lightning-fast HMR and optimized production bundle chunking (< 180kB JS / 9kB CSS).
                - generic [ref=e61]:
                  - heading "* React Router 6 (Client-Side SPA Routing)" [level=4] [ref=e62]
                  - paragraph [ref=e63]: Declarative routing with <Routes> and <Route> wrapped in a global LayoutRenderer context.
                - generic [ref=e64]:
                  - heading "* GitHub REST API Integration & sessionStorage Caching Layer" [level=4] [ref=e65]
                  - paragraph [ref=e66]: Real-time GitHub activity integration fetching user profile & repository metrics (api.github.com), 15-minute per-username sessionStorage TTL caching, custom React hook (useGitHubData), and 30-day activity highlight filters.
            - generic [ref=e67]:
              - heading "> DESIGN SYSTEM & DYNAMIC THEMING" [level=3] [ref=e68]
              - generic [ref=e69]:
                - generic [ref=e70]:
                  - heading "* Multi-Theme Architecture (Modern Editorial, ASCII Box & CLI Terminal)" [level=4] [ref=e71]
                  - paragraph [ref=e72]: Stateful 3-way theme switching using React Context (ThemeContext) with localStorage persistence and CSS variable design tokens (data-theme="modern", "ascii", and "cli").
                - generic [ref=e73]:
                  - heading "* Pure Vanilla CSS & Monospace Typography" [level=4] [ref=e74]
                  - paragraph [ref=e75]: Custom CSS resets, responsive grid/flexbox layouts, Google JetBrains Mono font loading, and retro terminal styling without heavy UI library dependencies.
            - generic [ref=e76]:
              - heading "> TESTING & QUALITY ASSURANCE" [level=3] [ref=e77]
              - generic [ref=e78]:
                - generic [ref=e79]:
                  - heading "* Vitest + React Testing Library + happy-dom" [level=4] [ref=e80]
                  - paragraph [ref=e81]: In-memory unit tests for component rendering, static data layers, router navigation, and interactive tag filtering.
                - generic [ref=e82]:
                  - heading "* Playwright E2E Integration Testing" [level=4] [ref=e83]
                  - paragraph [ref=e84]: Automated real Chrome browser tests verifying user navigation flows, theme toggle persistence, interactive filtering, and 404 page fallback.
                - generic [ref=e85]:
                  - heading "* Storybook 10 & Accessibility (a11y) Audits" [level=4] [ref=e86]
                  - paragraph [ref=e87]: Isolated component visual development and @storybook/addon-a11y accessibility validation (.sr-only utility, ARIA landmark roles, and high contrast visible focus rings).
            - generic [ref=e88]:
              - heading "> FASTAPI BACKEND & SWAGGER API EXPLORER" [level=3] [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - heading "* Python 3.11 & FastAPI REST Microservice" [level=4] [ref=e92]
                  - paragraph [ref=e93]: Decoupled backend API service serving profile details, curated projects, reading entries, and server-side GitHub stats proxy.
                - generic [ref=e94]:
                  - heading "* Pydantic v2 Schemas & Data Contracts" [level=4] [ref=e95]
                  - paragraph [ref=e96]: Strict input and output validation models ensuring type-safe JSON API contracts across all endpoints.
                - generic [ref=e97]:
                  - heading "* Server-Side GitHub Proxy & 15-Minute Cache" [level=4] [ref=e98]
                  - paragraph [ref=e99]: Async HTTPX service fetching GitHub stats server-side with a 15-minute in-memory TTL cache to eliminate client-side rate limits.
                - generic [ref=e100]:
                  - heading "* Interactive Swagger UI & ReDoc Documentation" [level=4] [ref=e101]
                  - paragraph [ref=e102]: Auto-generated OpenAPI 3.0 documentation available at /docs and /redoc for testing and API discovery.
            - generic [ref=e103]:
              - heading "> PRODUCTION DEPLOYMENTS & CLOUD INFRASTRUCTURE" [level=3] [ref=e104]
              - generic [ref=e105]:
                - generic [ref=e106]:
                  - heading "* React Frontend SPA (https://chrislau.dev)" [level=4] [ref=e107]
                  - paragraph [ref=e108]: "Deployed statically on Cloudflare Pages (Root: frontend, Build: npm run build, Output: dist) with global CDN distribution and SSL."
                - generic [ref=e109]:
                  - heading "* Live Component Storybook (https://chris-lau-storybook.pages.dev)" [level=4] [ref=e110]
                  - paragraph [ref=e111]: "Deployed on Cloudflare Pages (Root: frontend, Build: npm run build-storybook, Output: storybook-static) providing a live isolated UI library."
                - generic [ref=e112]:
                  - heading "* FastAPI Backend & Interactive Swagger UI (/docs)" [level=4] [ref=e113]
                  - paragraph [ref=e114]: "Containerized multi-stage Docker deployment on Render (Root: backend, python:3.11-slim) serving REST endpoints and live Swagger UI at /docs."
      - generic [ref=e116]:
        - heading "FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD" [level=3] [ref=e117]
        - generic [ref=e118]:
          - generic [ref=e119]:
            - generic [ref=e120]:
              - generic [ref=e121]: "● SYSTEM STATUS: OFFLINE"
              - generic [ref=e122]: "⚡ RTT: 12ms"
              - generic [ref=e123]: "🕒 Last Updated: 8:30:19 PM"
            - generic [ref=e124]:
              - button "🔄 Ping Health" [ref=e125] [cursor=pointer]
              - button "🔬 Run Full E2E Diagnostic Test" [ref=e126] [cursor=pointer]
              - button "🧹 Flush Cache" [ref=e127] [cursor=pointer]
              - button "🔌 Simulate Offline Mode" [ref=e128] [cursor=pointer]
              - button "📥 Export Diagnostic Log (.json)" [ref=e129] [cursor=pointer]
          - generic [ref=e130]:
            - heading "> 1. LIVE FULL-STACK ARCHITECTURE TOPOLOGY" [level=3] [ref=e131]
            - generic [ref=e132]:
              - generic [ref=e133]:
                - generic [ref=e134]: 🌐
                - generic [ref=e135]: React 18 SPA
                - generic [ref=e136]: Cloudflare Pages
                - generic [ref=e137]: HEALTHY
              - generic [ref=e138]:
                - generic [ref=e140]: 12ms RTT
                - generic [ref=e141]: ►
              - generic [ref=e142]:
                - generic [ref=e143]: 🐍
                - generic [ref=e144]: FastAPI Backend
                - generic [ref=e145]: Render (Docker)
                - generic [ref=e146]: OFFLINE
              - generic [ref=e147]:
                - generic [ref=e149]: 15-Min TTL Proxy
                - generic [ref=e150]: ►
              - generic [ref=e151]:
                - generic [ref=e152]: 🐙
                - generic [ref=e153]: GitHub REST API
                - generic [ref=e154]: api.github.com
                - generic [ref=e155]: CACHED
          - generic [ref=e156]:
            - generic [ref=e157]:
              - heading "> 2. BACKEND PROCESS TELEMETRY" [level=4] [ref=e158]
              - paragraph [ref=e160]: ⚠️ FastAPI Backend Service Offline / Operating on Graceful Local Fallback Data.
            - generic [ref=e161]:
              - heading "> 3. FRONTEND BROWSER RUM & CACHE" [level=4] [ref=e162]
              - generic [ref=e163]:
                - generic [ref=e164]:
                  - generic [ref=e165]: "Time To First Byte (TTFB):"
                  - generic [ref=e166]: 28 ms
                - generic [ref=e167]:
                  - generic [ref=e168]: "DOM Interactive:"
                  - generic [ref=e169]: 72 ms
                - generic [ref=e170]:
                  - generic [ref=e171]: "Total DOM Nodes:"
                  - generic [ref=e172]: 212 elements
                - generic [ref=e173]:
                  - generic [ref=e174]: "JS Heap Memory:"
                  - generic [ref=e175]: 9.54 MB
                - generic [ref=e176]:
                  - generic [ref=e177]: "SessionStorage Size:"
                  - generic [ref=e178]: 0 bytes (0 keys)
                - generic [ref=e179]:
                  - generic [ref=e180]: "GitHub Cache Status:"
                  - generic [ref=e181]: EMPTY / INACTIVE
  - contentinfo [ref=e182]:
    - generic [ref=e183]:
      - generic [ref=e184]:
        - generic [ref=e185]: CL
        - generic [ref=e186]: /
        - generic [ref=e187]: Chris Lau
        - generic [ref=e188]: — Staff Product Manager, AI
      - paragraph [ref=e189]: © 2026 Chris Lau. All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Operational Monitoring Dashboard E2E Tests', () => {
  4  |   test('navigates to /how-this-site-works and renders Full-Stack Monitoring Dashboard', async ({ page }) => {
  5  |     // 1. Navigate to /how-this-site-works
  6  |     await page.goto('/how-this-site-works');
  7  |     await expect(page.getByRole('heading', { name: 'HOW THIS SITE WORKS' })).toBeVisible();
  8  | 
  9  |     // 2. Verify Monitoring Dashboard Container
  10 |     await expect(
  11 |       page.getByText('FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD')
> 12 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  13 | 
  14 |     // 3. Verify Topology Nodes
  15 |     await expect(page.getByText('React 18 SPA')).toBeVisible();
  16 |     await expect(page.getByText('FastAPI Backend')).toBeVisible();
  17 |     await expect(page.getByText('GitHub REST API')).toBeVisible();
  18 | 
  19 |     // 4. Verify Interactive Action Buttons
  20 |     await expect(page.getByRole('button', { name: '🔄 Ping Health' })).toBeVisible();
  21 |     await expect(page.getByRole('button', { name: /Run Full E2E Diagnostic Test/i })).toBeVisible();
  22 |     await expect(page.getByRole('button', { name: '🧹 Flush Cache' })).toBeVisible();
  23 |     await expect(page.getByRole('button', { name: /Simulate Offline Mode/i })).toBeVisible();
  24 |     await expect(page.getByRole('button', { name: /Export Diagnostic Log/i })).toBeVisible();
  25 |   });
  26 | 
  27 |   test('runs automated synthetic diagnostic suite on user interaction', async ({ page }) => {
  28 |     await page.goto('/how-this-site-works');
  29 |     
  30 |     // Click diagnostic test button
  31 |     const diagBtn = page.getByRole('button', { name: /Run Full E2E Diagnostic Test/i });
  32 |     await diagBtn.click();
  33 | 
  34 |     // Assert synthetic diagnostics checklist renders items
  35 |     await expect(page.getByText('> 4. AUTOMATED SYNTHETIC DIAGNOSTICS')).toBeVisible();
  36 |     await expect(page.getByText('Client Storage & Cache Integrity')).toBeVisible();
  37 |     await expect(page.getByText('Network RTT & CORS Validation')).toBeVisible();
  38 |   });
  39 | 
  40 |   test('toggles simulated offline mode toggle button', async ({ page }) => {
  41 |     await page.goto('/how-this-site-works');
  42 | 
  43 |     const toggleBtn = page.getByRole('button', { name: /Simulate Offline Mode/i });
  44 |     await toggleBtn.click();
  45 | 
  46 |     await expect(page.getByRole('button', { name: '⚙️ Simulated Offline: ON' })).toBeVisible();
  47 | 
  48 |     await toggleBtn.click();
  49 |     await expect(page.getByRole('button', { name: '🔌 Simulate Offline Mode' })).toBeVisible();
  50 |   });
  51 | });
  52 | 
```