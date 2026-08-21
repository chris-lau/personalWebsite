# Amazon Seller Tooling Suite — Project Tracker & Roadmap

This tracking document logs the development progress, architecture, and feature status for the **Amazon Seller Opportunity & Trend Discovery Suite** on `chrislau.dev`.

---

## 📊 Overview

- **Target Route**: `/amazon-tools`
- **Navigation Location**: Work & Writing ▾ -> Amazon Seller Tools (`amazon-tools.sh` in CLI, `AMZ-TOOLS` in ASCII)
- **Supported Themes**: Modern Editorial, Warm Earthy ASCII, Retro Terminal CLI
- **Core Goals**:
  1. Help Amazon sellers discover high-growth, low-competition product trends.
  2. Provide precise unit economics & FBA/FBM profit calculators with 2026 fee schedules & Low-Price FBA support.
  3. Offer competitor review gap scanning and AI listing prompt generation.
  4. Enable cross-tool data transfer (1-click preset loader) and Markdown export for sourcing agents.

---

## 🚦 Feature Roadmap & Checklist

### Phase 1: Data Models & Core Utilities
- [x] Create Amazon 2026 category referral fee schedules & Low-Price FBA rules (`amazonData.ts`).
- [x] Create FBA fulfillment tier fee calculation logic with dimensional weight support.
- [x] Define Niche Trend & Opportunity Score algorithm (0-100 score based on demand velocity, competition, review barrier, price sweet spot).
- [x] Create sample curated micro-niche datasets with pre-populated economics.
- [x] Add unit tests for calculation engine (`AmazonCalculators.test.ts`).

### Phase 2: Core Components Development
- [x] Build **Opportunity Finder Component** (`OpportunityFinder.tsx`) with search, filter controls, velocity badges, and "Simulate Economics" 1-click bridge.
- [x] Build **Unit Economics & Margin Calculator** (`UnitEconomicsCalculator.tsx`) with interactive sliders, referral fee dropdowns, FBA tier selector, Low-Price FBA toggle, margin breakdown visuals, and Markdown clipboard export.
- [x] Build **Competitor Review Gap Scanner** (`ReviewGapScanner.tsx`) with complaint category highlights and AI prompt generator.

### Phase 3: Page & Theme Integration
- [x] Create `/amazon-tools` page container (`AmazonToolsPage.tsx`) with cross-tool state bridge and SEO metadata.
- [x] Create theme-aware styles (`AmazonToolsPage.css`) supporting Modern, ASCII, and CLI aesthetics.
- [x] Add lazy-loaded route in `App.tsx`.
- [x] Update navigation submenus in `navConfig.ts`.

### Phase 4: Quality Assurance & Verification
- [x] Run unit & component integration tests (`AmazonToolsPage.test.tsx` + `AmazonCalculators.test.ts`).
- [x] Verify full TypeScript compilation & Vite production build (`npm run build`).
- [x] Cross-tool data transfer verified (Opportunity Finder -> Unit Economics Calculator).

### Phase 5: Real Live Marketplace & Trend Data Proxy
- [x] Create backend FastAPI live search proxy (`/api/amazon/search`) parsing live Amazon HTML for real prices, ratings, ASINs, review counts, and Prime status.
- [x] Create live ASIN / URL product inspector endpoint (`/api/amazon/asin/{asin}`) extracting exact title, category, dimensions, weight, and price.
- [x] Create live demand trends proxy (`/api/amazon/trends`) querying real Amazon autocomplete suggestions and search momentum velocity.
- [x] Implement in-memory TTL caching (15 min) and request rate limiting.
- [x] Upgrade **Opportunity Finder** with live search submission, autocomplete suggestion pills, loading skeletons, and real-time opportunity scoring.
- [x] Upgrade **Unit Economics Calculator** with live ASIN / product URL inspector form and auto-fill.
- [x] Authored backend pytest suite (`backend/tests/test_amazon_api.py`) and frontend vitest suite.

### Phase 6: AI Companion Mode & Grounded Copilot
- [x] Add toggleable, split-canvas **AI Companion Mode** (`AmazonToolsPage.tsx`) side-by-side with tool canvas.
- [x] Add dynamic tab-aware starter questions (`starters.ts`) for Trends, Unit Economics, and Review Gaps.
- [x] Add 1-click **"Ask AI Copilot"** trigger buttons in Opportunity Finder cards/modal, Unit Economics Calculator, and Review Gap Scanner.
- [x] Ground backend chat system prompt on 2026 FBA unit economics, fee schedules, formulas, and `site_architecture.json`.
- [x] Support `/amazon-tools` in markdown route allowlist and coordinate floating `ChatWidget` visibility.
- [x] Comprehensive unit testing in `AmazonToolsPage.test.tsx` and `test_chat.py`.

---

## 📈 Status Summary
- **Overall Status**: 🟢 AI Companion Mode Integration Complete & Verified (68/68 backend tests, 196/196 frontend tests passing)
- **Completed Date**: August 21, 2026

