# Chris Lau // AI & Product Leadership Website (Triple-Theme ASCII, CLI & Modern Editorial)

A modern, responsive, accessible, frontend-only personal portfolio website and blog engine supporting three distinct visual themes: **Warm Earthy ASCII Art Design**, **Retro Terminal CLI Design**, and **Modern Editorial Design** (inspired by Anthropic and OpenAI web aesthetics) with real-time theme toggling.

Built with **React 18**, **TypeScript**, **Vite**, **React Router 6**, **Storybook 8**, **Vitest**, and **Playwright**.

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
  - `/experience` — Work & Education Timeline
  - `/now` — Current Activities & Learning Focus (Derek Sivers style `/now` page)
  - `/contact` — Contact details & Social links
  - `/how-this-site-works` — Technical Architecture & Design System showcase
- **Full-Featured Technical Blog Engine**:
  - Modular Markdown storage in `frontend/src/data/posts/`.
  - Vite raw static imports (`?raw`) with query helpers (`getAllBlogPosts`, `getBlogPostBySlug`, `getBlogPostsByTag`, `getGroupedBlogPostsByCategory`, `getRelatedBlogPosts`).
  - **Executive Summaries**: Every article features a prominent **TL;DR** callout box for instant comprehension.
  - **Category Grouping & Discovery**: Articles organized under clear technical categories (`React Architecture & Design Systems`, `Developer Workflows & Tooling`, `Testing & Quality Assurance`) with automated **Related Articles** suggestions.
  - Includes 13 technical articles covering React architecture, SPA routing mechanics & Cloudflare hosting, scaffolding, 4-tier testing strategies, design tokens, multi-theme context, beginner GitHub workflows, Technical Product Manager (TPM) frontend learning reflections, and interactive AI pair programming workflows.



- **Accessibility & UX**:
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
  - Vitest + `@testing-library/react` unit & component integration tests (35 passing tests).
  - Playwright real-browser end-to-end (E2E) testing across all 3 themes.

---

## 📁 Repository Structure

```text
personalWebsite/
├── README.md                          # Project documentation
├── personal-os-project-plan.md        # Master architectural project plan
├── phase-1-implementation-plan.md     # Phase 1 execution plan & checklist
└── frontend/                          # React + TypeScript SPA app
    ├── .storybook/                    # Storybook 8 configuration
    ├── e2e/                           # Playwright end-to-end tests
    │   └── portfolio.spec.ts
    ├── src/
    │   ├── components/
    │   │   ├── blog/                  # BlogCard & styling
    │   │   ├── layout/                # AsciiLayout, CliLayout, ModernLayout, LayoutRenderer, ThemeToggle
    │   │   └── ui/                    # BoxContainer, ProjectCard, TimelineItem
    │   ├── context/                   # ThemeContext (Global 3-theme manager)
    │   ├── data/                      # Static data layer & markdown blog posts
    │   │   ├── posts/                 # Markdown blog post storage (10 articles)
    │   │   ├── blogPosts.ts           # Blog engine static data layer & helpers
    │   │   ├── profile.ts
    │   │   ├── projects.ts
    │   │   ├── experience.ts
    │   │   ├── skills.ts
    │   │   └── now.ts
    │   ├── pages/                     # Page views (Home, About, Projects, Blog, Experience, Now, Contact, Architecture)
    │   ├── styles/                    # Design tokens (variables.css for 3 themes) and reset (global.css)
    │   ├── types/                     # TypeScript interfaces (theme.ts, portfolio.ts)
    │   ├── App.tsx                    # React Router configuration
    │   └── main.tsx                   # Entry point
    ├── package.json
    ├── playwright.config.ts
    ├── vite.config.ts
    └── tsconfig.json
```

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

## 🌐 Deployment & Cloudflare Pages

The application is prepared for single-page app (SPA) static deployment on **Cloudflare Pages**, **Vercel**, or **Netlify**.

### Cloudflare Pages Setup

Cloudflare Pages deploys the React SPA statically using **Build System v3** (zero-config environment):

| Setting | Value | Explanation |
| :--- | :--- | :--- |
| **Build system version** | `V3` | Cloudflare's modern build environment (includes Node 20+ by default) |
| **Root directory** | `frontend` | Root directory containing `package.json` |
| **Build command** | `npm run build` | Compiles TypeScript & Vite assets into `dist/` |
| **Build output directory** | `dist` | Production static build destination |

> **Note on Node version & `.nvmrc`**: With Cloudflare Pages **Build System v3**, modern Node.js versions are included natively, so `.nvmrc` and custom `NODE_VERSION` environment variables are not required.

### SPA Routing & `_redirects` File

This project includes `frontend/public/_redirects` with the following rule:
```text
/*  /index.html  200
```

**Why is this file needed?**
In a React Single Page Application (SPA), routing (`/blog`, `/projects`, `/about`) is handled client-side in the browser. When a user directly visits or refreshes a sub-page, Cloudflare Pages will look for a physical file at that path and return a `404 Not Found` error if missing. The `_redirects` rule instructs Cloudflare to direct all requests (`/*`) back to `index.html` with a `200` status, enabling React Router to render the requested page correctly.


