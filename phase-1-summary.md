# Phase 1 Summary — Multi-Theme Portfolio (ASCII, CLI & Modern Editorial)

This document provides a comprehensive summary log of all steps executed during Phase 1 of the Personal Website portfolio project.

---

## Step 1: Project & Scaffolding Setup

---

## 1. Standard React + Vite Boilerplate Overview

The initial project setup established 7 core standard boilerplate files required for any modern React + TypeScript application built with Vite:

| Boilerplate File | Purpose & Architectural Responsibility |
| :--- | :--- |
| **[`index.html`](file:///Users/chrislau/Documents/personalWebsite/frontend/index.html)** | Single HTML template containing `<div id="root"></div>` and Google Font links (`Inter`, `Instrument Serif`). |
| **[`package.json`](file:///Users/chrislau/Documents/personalWebsite/frontend/package.json)** | Project manifest specifying runtime dependencies, dev tool packages, and npm scripts (`dev`, `build`, `lint`). |
| **[`tsconfig.json`](file:///Users/chrislau/Documents/personalWebsite/frontend/tsconfig.json)** | Consolidated TypeScript compiler configuration (`target: ES2020`, `moduleResolution: bundler`, `jsx: react-jsx`). |
| **[`vite.config.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/vite.config.ts)** | Dev server configuration (port 3000, React plugin integration) and Vitest test runner setup. |
| **[`src/main.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/main.tsx)** | Browser mounting script — calls `ReactDOM.createRoot()`, binds React to `#root`, wraps app in `<React.StrictMode>` and `<BrowserRouter>`, and imports `global.css`. |
| **[`src/App.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/App.tsx)** | Root application shell component — wraps child components in `<ThemeProvider>`, `<LayoutRenderer>`, and configures router paths. |
| **[`src/vite-env.d.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/vite-env.d.ts)** | TypeScript ambient declaration file — allows TypeScript to understand Vite client types (`import.meta.env`) and raw static imports (`*.md?raw`). |

---

## 2. Directory Structure Setup

A modern frontend directory structure was initialized under `frontend/`:

```text
personalWebsite/
└── frontend/
    ├── public/
    │   └── favicon.ico
    ├── src/
    │   ├── main.tsx          (React DOM entry point with React.StrictMode & BrowserRouter)
    │   ├── App.tsx           (Root component with router & provider wrapper)
    │   ├── vite-env.d.ts     (Vite environment & static module type declarations)
    │   └── styles/
    │       └── global.css    (Global styling resets & font setup)
    ├── index.html            (HTML template with viewport meta & font links)
    ├── package.json          (Project manifest & scripts)
    ├── tsconfig.json         (TypeScript compiler configuration)
    └── vite.config.ts        (Vite build tool configuration)
```

---

## 3. Dependency Installation

Installed runtime and dev dependencies via `npm`:

```bash
npm install react react-dom react-router-dom lucide-react
npm install -D vite typescript @types/react @types/react-dom @types/node @vitejs/plugin-react
```

This generated [`package-lock.json`](file:///Users/chrislau/Documents/personalWebsite/frontend/package-lock.json) and populated `node_modules/`.

---

## 4. Entry Point Wiring & Mounting

Created [`src/main.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/main.tsx) to mount the React application onto the DOM element `#root` using React 18 `createRoot`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

---

## Step 1 Verification Status

- [x] Standard React/Vite boilerplate files (`index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vite-env.d.ts`) configured.
- [x] Application entry point (`main.tsx`) and root component shell (`App.tsx`) initialized.
- [x] Package dependencies installed & verified.
- [x] TypeScript & Vite configurations validated.


---

## Step 2: Styling Tokens & Theme State Manager

### 1. Theme Type Definition & `src/types/` Architecture
- Created [`frontend/src/types/theme.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/types/theme.ts) exporting `ThemeMode` union type (`'ascii' | 'cli' | 'modern'`).
- **Architectural Role of `src/types/`**:
  - Serves as the single source of truth for shared data contracts, interfaces, and union types across multiple files.
  - Purely compile-time / build-time type checking and IDE autocompletion; completely erased from final production JavaScript output.
  - Used for shared models (`ThemeMode`, `BlogPost`, `SkillCategory`, `Project`), while component-private props remain co-located inside individual component files.

### 2. CSS Design Tokens & Separation of Style Concerns
- Created [`frontend/src/styles/variables.css`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/styles/variables.css):
  - **Design Tokens Implementation**: Encapsulates design decisions (color palettes, font stacks, container max-widths) into native CSS custom properties under `[data-theme="ascii"]`, `[data-theme="cli"]`, and `[data-theme="modern"]`.
  - **Contrast Optimization**: Hand-picked foreground and muted text colors to ensure high contrast ratios exceeding WCAG AA accessibility standards (5.2+:1 to 5.5+:1 ratio).
- Created [`frontend/src/styles/global.css`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/styles/global.css):
  - **Separation of Concerns**: Houses universal CSS resets (`box-sizing`, margins, body defaults) and baseline layout behavior (`ul, ol` indentation resets), delegating theme-specific aesthetics to design tokens via `var(...)`.
- **CSS File Organization Strategy**:
  - Global resets, design tokens, and accessibility classes live in `src/styles/`.
  - Component-specific CSS (e.g. `BlogCard.css`) is co-located directly next to its corresponding component (`BlogCard.tsx`) for modularity and clean refactoring.

### 3. React Theme Context & Global State Manager
- Created [`frontend/src/context/ThemeContext.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/context/ThemeContext.tsx):
  - **Architectural Role of `src/context/`**: Manages global application state (state required across multiple unrelated components) without "prop drilling".
  - **Functionality**:
    - Provides `ThemeProvider` component and custom `useTheme()` hook.
    - Manages a 3-way sequential theme cycle (`modern` ➔ `ascii` ➔ `cli` ➔ `modern`).
    - Persists user theme preference in `localStorage` (`portfolio_theme`).
    - Updates root DOM attribute (`document.documentElement.setAttribute('data-theme', theme)`), triggering instant CSS token updates across all components.

### Step 2 Verification Status
- [x] `ThemeMode` TypeScript definitions created.
- [x] CSS design tokens established for all 3 visual themes with WCAG AA contrast compliance.
- [x] Clear separation of CSS concerns established (Global Tokens vs Co-located Component CSS).
- [x] `ThemeProvider` & `useTheme()` context implemented with `localStorage` state persistence.

---

## Step 3: Static Data Layer & Type Interfaces

### 1. Portfolio Data Models (`src/types/portfolio.ts`)
Created TypeScript interfaces establishing data contracts for all core entities:
- **`Profile`**: User bio, handle, credentials (`CSPO, MBA, P.Eng.`), title (`Staff Product Manager, AI`), avatar URL, and social links.
- **`Project`**: Title, description, tech stack tags, GitHub/Live URLs, and featured flag.
- **`Experience`**: Career history and education entries (company, role, dates, description, highlights).
- **`SkillCategory`**: Categorized skill arrays (Product Leadership, Technical & Engineering, Certifications, Languages).
- **`BlogPost`**: Slug, title, description, dates, read times, tags, author, and Markdown body content.
- **`NowState`**: Current focus, active projects, reading list, and learning topics.
- **`SiteArchitectureCategory`**: Component architecture breakdown for `/how-this-site-works`.

### 2. Static Data Layer (`src/data/`)
Decoupled content data from UI components by creating typed static data modules:
- [`profile.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/profile.ts), [`projects.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/projects.ts), [`experience.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/experience.ts), [`skills.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/skills.ts), [`now.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/now.ts), [`siteArchitecture.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/data/siteArchitecture.ts).

### 3. Functional Data Query Service & Repository Pattern (`src/data/blogPosts.ts`)
- Implemented data query and lookup helper functions directly alongside blog data:
  - `getBlogPostBySlug(slug)`: Retrieves post by URL parameter.
  - `getBlogPostsByTag(tag)`: Filters posts dynamically by tag.
  - `getAllBlogTags()`: Collects and deduplicates unique tags via `Set`.
  - `getGroupedBlogPostsByCategory()`: Groups posts by category into a dictionary.
  - `getRelatedBlogPosts(currentPost, limit)`: Recommends related articles based on tag overlaps.
- **Architectural Design Pattern**: Demonstrates the Repository/Service Pattern — UI components consume clean query functions rather than writing inline `.filter()` / `.find()` logic, keeping components lean and simplifying future API or CMS migration.

### 4. Data Layer Unit Testing & CI Verification (`src/data/blogPosts.test.ts`)
- Created unit tests using **Vitest** to verify query logic, slug lookups, tag filtering, category grouping, and related post recommendations.
- **Testing Rationale**: Simple static data files (`profile.ts`) are 100% validated at compile time by TypeScript. Functional query services (`blogPosts.ts`) require runtime unit tests to prevent broken navigation or lookup errors.
- **Lifecycle Execution**: Unit tests run during local development (`vitest --watch`), before commits/builds (`npm test`), and automatically in CI/CD deployment pipelines (GitHub Actions / Cloudflare Pages) to block broken deployments.

### Step 3 Verification Status
- [x] All 7 data models defined in `src/types/portfolio.ts`.
- [x] Static data files populated in `src/data/`.
- [x] Blog data service query functions (`getBlogPostBySlug`, `getRelatedBlogPosts`, etc.) implemented.
- [x] Vitest unit test suite created (`blogPosts.test.ts`) and passing cleanly.

---

## Step 4: Presentation Wrappers & Theme Layouts

### 1. Storybook 8 & Accessibility (a11y) Workshop Setup
- Configured Storybook 8 (`.storybook/main.ts`, `.storybook/preview.tsx`) and Vitest integration (`@storybook/addon-vitest`, `@storybook/addon-a11y`).
- Created `.stories.tsx` files for isolated component visual previewing and accessibility auditing on `localhost:6006`.
- Integrated `axe-core` accessibility rules to automatically check WCAG 2.1 AA contrast and screen-reader landmark guidelines.

### 2. Multi-Theme Layout Wrappers (`src/components/layout/`)
- **`AsciiLayout.tsx`**: Centered single-column ASCII box frame container.
- **`CliLayout.tsx`**: Retro terminal shell window with command prompt (`$`), window buttons (`min`, `max`, `close`), and command tabs.
- **`ModernLayout.tsx`**: Modern glassmorphic top navigation bar with collapsible mobile hamburger menu drawer.
- **`ThemeToggle.tsx`**: Segmented button control cycling through `MODERN` ➔ `ASCII` ➔ `CLI` theme modes.
- **`LayoutRenderer.tsx`**: Dynamic layout switcher using dictionary mapping (`LAYOUT_MAP[theme]`) to re-render page layouts instantly upon theme selection in `ThemeContext`.

### 3. Component Architecture & Subfolder Structure (`src/components/`)
- Organized UI components into 3 specialized subfolders based on UI responsibility:
  - **`src/components/ui/`**: Low-level, domain-agnostic UI primitives. Contains [`BoxContainer.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/components/ui/BoxContainer.tsx) (adaptive container rendering ASCII border frames in ASCII theme and glassmorphic cards in Modern theme).
  - **`src/components/layout/`**: Structural page shells and theme wrappers (`AsciiLayout`, `CliLayout`, `ModernLayout`, `ThemeToggle`, and `LayoutRenderer`).
  - **`src/components/blog/`**: Domain-specific feature components ([`BlogCard.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/components/blog/BlogCard.tsx) for blog post preview rendering).
- **TypeScript File Extensions (`.ts` vs `.tsx`)**:
  - **`.ts`**: Contains pure TypeScript/JavaScript code (functions, interfaces, types, static data). Cannot contain React HTML/JSX tags.
  - **`.tsx`**: Contains TypeScript code **plus React JSX** (e.g. `<div>`, `<App />`, `<Route />`).

### Step 4 Verification Status
- [x] Storybook 8 workshop & WCAG AA a11y testing addons configured.
- [x] All 3 theme layouts (`AsciiLayout`, `CliLayout`, `ModernLayout`) created.
- [x] Dynamic `LayoutRenderer` switcher connected to `ThemeContext` state updates.
- [x] Universal `BoxContainer` primitive created.
- [x] Component subfolder organization (`ui/`, `layout/`, `blog/`) established.

---

## Step 5: Page Components & React Router Integration

### 1. Core Page Views (`src/pages/`)
Built 10 client-side routed page views:
- **`HomePage.tsx`**: Hero section, quick bio summary, featured projects, and skill chips.
- **`AboutPage.tsx`**: Full professional bio, values, and categorized skill matrix.
- **`ProjectsPage.tsx`**: Project archive with interactive technology tag filter buttons.
- **`ExperiencePage.tsx`**: Career & education timeline with left-aligned bullet highlights.
- **`BlogListPage.tsx` & `BlogDetailPage.tsx`**: Blog article search, category grouping, tag filtering, and full article view.
- **`GuidebookPage.tsx`**: Interactive 8-chapter reader app (*Building Modern Web Applications*) with sticky Table of Contents sidebar, pre-parsed `useMemo` rendering, WCAG AA mobile responsive layout, and container-relative instant scrolling.
- **`NowPage.tsx`**: Derek Sivers style `/now` page (current projects, reading list, focus areas).
- **`ContactPage.tsx`**: Contact information and interactive `mailto:` action button.
- **`HowThisSiteWorksPage.tsx`**: Comprehensive technical architecture breakdown.
- **`NotFoundPage.tsx`**: Custom 404 fallback page.

### 2. Client-Side Routing Wiring & SPA Architecture (`react-router-dom`)
- **Single Page Application (SPA) Mechanics**:
  - Replaces traditional full-page browser reloads with instant client-side transitions.
  - Updates URL address bar via HTML5 History API while mounting/unmounting React page components in milliseconds without sending new HTTP page requests to the server.
- **3-Layer Routing Architecture**:
  1. **Router Container (`src/main.tsx`)**: `<BrowserRouter>` wraps the app at the root, listening to address bar URL changes.
  2. **Route Mapping Engine (`src/App.tsx`)**: `<Routes>` acts as a declarative switch matching URL paths to Page components:
     ```tsx
     <ThemeProvider>
       <LayoutRenderer>
         <Routes>
           <Route path="/" element={<HomePage />} />
           <Route path="/about" element={<AboutPage />} />
           <Route path="/projects" element={<ProjectsPage />} />
           <Route path="/blog" element={<BlogListPage />} />
           <Route path="/blog/:slug" element={<BlogDetailPage />} /> {/* Dynamic URL parameter */}
           <Route path="/guidebook" element={<GuidebookPage />} />   {/* Interactive Guidebook Reader */}
           <Route path="/experience" element={<ExperiencePage />} />
           <Route path="/now" element={<NowPage />} />
           <Route path="/how-this-site-works" element={<HowThisSiteWorksPage />} />
           <Route path="/contact" element={<ContactPage />} />
           <Route path="*" element={<NotFoundPage />} />           {/* Catch-all 404 fallback */}
         </Routes>
       </LayoutRenderer>
     </ThemeProvider>
     ```
  3. **Client Navigation Link Primitive (`<Link to="...">`)**: Components use React Router's `<Link>` instead of raw `<a href="...">` tags to trigger client-side route transitions without triggering tab refreshes.

### 3. 3-Tier Testing Suite & Test Discovery Architecture
Implemented a 3-tier testing strategy covering unit, integration, and E2E browser testing across 7 Vitest test files and Playwright:

1. **Vitest Unit & Integration Tests (`npm test`)**:
   - **Framework**: Vitest + React Testing Library (`happy-dom` DOM environment).
   - **Discovery Pattern**: Scans `src/` for `*.test.ts` or `*.test.tsx` files. Configured in [`vite.config.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/vite.config.ts) with `environment: 'happy-dom'` and `exclude: ['e2e/**']`.
   - **Coverage**: 7 test files executing 35 tests in under 1s:
     - `blogPosts.test.ts` (Data queries & slug lookups)
     - `BoxContainer.test.tsx` (Adaptive container rendering)
     - `ThemeToggle.test.tsx` (Segmented button clicks)
     - `BlogCard.test.tsx` (Article card links & badges)
     - `LayoutRenderer.test.tsx` (Theme switcher dictionary mapping)
     - `Pages.test.tsx` (Page rendering & search/filter state)
     - `App.test.tsx` (Router path matching & global theme switching)
2. **Playwright Real Browser E2E Tests (`npm run test:e2e`)**:
   - **Framework**: Playwright (runs against real headless Chromium, Firefox, WebKit browsers).
   - **Discovery Pattern**: Configured in [`playwright.config.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/playwright.config.ts) via `testDir: './e2e'`. Scans `frontend/e2e/` for `*.spec.ts` files ([`frontend/e2e/portfolio.spec.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/e2e/portfolio.spec.ts)).
   - **Coverage**: Verifies real browser navigation across all 9 page routes, dynamic search filtering, 404 fallbacks, and live visual theme toggling.

### Step 5 Verification Status
- [x] All 9 page components implemented in `src/pages/`.
- [x] Single Page Application (SPA) architecture enabled via `react-router-dom` client-side routing.
- [x] 3-layer routing architecture (`BrowserRouter`, `<Routes>`, `<Link to="...">`) configured in `main.tsx` and `App.tsx`.
- [x] Dynamic slug parameters (`/blog/:slug`) and 404 fallback route (`*`) wired.
- [x] Vitest 35-test unit & integration test suite passing cleanly.
- [x] Playwright real browser E2E test suite passing across all routes & themes.






