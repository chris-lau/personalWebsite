# Personal OS Portfolio (Dual-Theme ASCII & CLI)

A modern, responsive, accessible, frontend-only personal portfolio website supporting both a **Warm Earthy ASCII Art Design** and a **Retro Terminal CLI Design** with real-time theme switching.

Built with **React 18**, **TypeScript**, **Vite**, **React Router 6**, **Storybook 8**, **Vitest**, and **Playwright**.

---

## 🎨 Key Features

- **Dual-Theme Support**:
  - **`ascii` Mode**: Warm Earthy single-column layout (espresso background, parchment text, terracotta/sage accents, ASCII box frames).
  - **`cli` Mode**: Retro terminal window layout with interactive command prompt ($), tab navigation, and terminal output aesthetic.
  - **Real-Time Toggle**: Global state management via `ThemeContext` with `localStorage` persistence.
- **Client-Side Navigation**:
  - `/` — Home (Hero bio, featured projects, quick skill overview)
  - `/about` — About & Résumé (Detailed background, core values, technical stack)
  - `/projects` — Projects Showcase (Interactive filterable list by technology tag)
  - `/experience` — Work & Education Timeline
  - `/now` — Current Activities & Reading List (Derek Sivers style `/now` page)
  - `/contact` — Contact details & Social links
  - `/architecture` — Technical Architecture & Design System showcase
- **Accessibility & UX**:
  - Screen reader fallback markup (`.sr-only`).
  - `aria-hidden` attributes on visual ASCII framing elements.
  - Full keyboard focus indicators and semantic HTML5 layout containers.
- **Testing & Quality Assurance**:
  - Storybook 8 component catalog & accessibility auditing (`@storybook/addon-a11y`).
  - Vitest + `@testing-library/react` unit & component integration tests.
  - Playwright real-browser end-to-end (E2E) testing.

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
    │   │   ├── layout/                # AsciiLayout, CliLayout, LayoutRenderer, ThemeToggle
    │   │   └── ui/                    # AsciiBox, ProjectCard, TimelineItem
    │   ├── context/                   # ThemeContext (Global theme provider)
    │   ├── data/                      # Static data layer (profile, projects, experience, etc.)
    │   ├── pages/                     # Page views (Home, About, Projects, Experience, etc.)
    │   ├── styles/                    # Design tokens (variables.css) and reset (global.css)
    │   ├── types/                     # TypeScript interfaces
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
   git clone https://github.com/your-username/personalWebsite.git
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
Executes component rendering, page behavior, and router integration tests:
```bash
npm test
```

### End-to-End Tests (Playwright)
Launches Chromium instances to test full user journeys, theme switching persistence, tag filtering, and 404 routing:
```bash
npm run test:e2e
```

---

## 🌐 Deployment

The application is prepared for single-page app (SPA) hosting on platforms like **Cloudflare Pages**, **Vercel**, or **Netlify**.

Build output directory: `frontend/dist/`
