# Implementation Plan — Phase 1: Multi-Theme Portfolio (ASCII, CLI & Modern Editorial)

Build and publish a polished, accessible, responsive, frontend-only portfolio supporting three distinct visual themes: **Warm Earthy ASCII Art Design**, **Retro Terminal CLI Design**, and **Modern Editorial Design** (inspired by Anthropic and OpenAI web aesthetics), with real-time theme toggling built using React, TypeScript, Vite, and Cloudflare Pages.

GitHub Repository: [https://github.com/chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite)

## Goals & Scope

- **Frontend-only**: React + TypeScript application built with Vite.
- **Multi-Theme Support**:
  - **Theme 1 (`ascii`)**: Warm Earthy centered single-column ASCII layout (espresso background, parchment text, terracotta/sage accents, ASCII box frames).
  - **Theme 2 (`cli`)**: Retro terminal window layout with interactive prompt (`$`), command outputs (`cat`, `ls`), and terminal tab shortcuts.
  - **Theme 3 (`modern`)**: Modern Editorial layout inspired by Anthropic & OpenAI websites (dark charcoal surface, warm ambient card glows, `Instrument Serif` headings, and `Inter` sans-serif typography).
  - **Real-Time Toggle**: Smooth 3-way theme switching using React Context (`ThemeContext.tsx`) and CSS custom property tokens (`[data-theme]`).
- **Static Data Layer**: Complete static local data layer in `frontend/src/data/` independent of UI formatting.
- **Navigation & Routing**: Client-side routed with `react-router-dom` across 8 core page areas:
  - `/` (Home)
  - `/about` (About / Résumé & Skill Matrix)
  - `/projects` (Projects Showcase)
  - `/blog` (Technical Blog Engine & Detail Views)
  - `/experience` (Work & Education Timeline)
  - `/now` (Derek Sivers style /now page)
  - `/contact` (Contact & Social Links)
  - `/how-this-site-works` (Architecture breakdown)

---

## Workspace Directory Structure

```text
personalWebsite/
├── README.md                          # Project documentation
├── personal-os-project-plan.md        # Master architectural project plan
├── phase-1-implementation-plan.md     # Phase 1 execution plan & checklist
└── frontend/
    ├── public/
    │   └── favicon.ico
    ├── e2e/
    │   └── portfolio.spec.ts         (Playwright E2E test suite)
    ├── src/
    │   ├── context/
    │   │   └── ThemeContext.tsx      (Global 3-theme state manager)
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AsciiLayout.tsx   (Centered ASCII box container)
    │   │   │   ├── CliLayout.tsx     (Terminal shell window container)
    │   │   │   ├── ModernLayout.tsx  (Modern Editorial glassmorphic nav & layout)
    │   │   │   ├── LayoutRenderer.tsx(Dynamic layout picker for ascii/cli/modern)
    │   │   │   └── ThemeToggle.tsx   (Theme switcher button)
    │   │   ├── blog/
    │   │   │   ├── BlogCard.tsx
    │   │   │   └── BlogCard.css
    │   │   └── ui/
    │   │       ├── BoxContainer.tsx  (ASCII box & Modern section container)
    │   │       ├── ProjectCard.tsx   (Project display card)
    │   │       └── TimelineItem.tsx  (Experience timeline item)
    │   ├── data/
    │   │   ├── posts/                (Markdown blog post storage - 9 articles)
    │   │   ├── profile.ts
    │   │   ├── projects.ts
    │   │   ├── experience.ts
    │   │   ├── skills.ts
    │   │   ├── blogPosts.ts
    │   │   └── now.ts
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── AboutPage.tsx
    │   │   ├── ProjectsPage.tsx
    │   │   ├── BlogListPage.tsx
    │   │   ├── BlogDetailPage.tsx
    │   │   ├── ExperiencePage.tsx
    │   │   ├── NowPage.tsx
    │   │   ├── ContactPage.tsx
    │   │   └── NotFoundPage.tsx
    │   ├── styles/
    │   │   ├── variables.css         (Theme design tokens for ascii/cli/modern)
    │   │   └── global.css            (Resets, font stacks, and global list alignment)
    │   ├── types/
    │   │   ├── theme.ts              (ThemeMode union type: 'ascii' | 'cli' | 'modern')
    │   │   └── portfolio.ts          (Data interfaces)
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## Detailed Task Breakdown for Incremental Execution

### Step 1: Project & Scaffolding Setup
- [x] Scaffolding setup in `frontend/` directory (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`).
- [x] Configure `react`, `react-dom`, `react-router-dom`, and `lucide-react`.

### Step 2: Styling Tokens & Theme State Manager
- [x] `frontend/src/types/theme.ts`: Define `ThemeMode` type (`'ascii' | 'cli' | 'modern'`).
- [x] `frontend/src/styles/variables.css`: Define design tokens for `[data-theme="ascii"]`, `[data-theme="cli"]`, and `[data-theme="modern"]` (including Google Fonts `Instrument Serif` & `Inter`).
- [x] `frontend/src/styles/global.css`: CSS resets, monospace & serif Google Fonts, and universal zero-indent bullet list alignment (`ul, ol { padding-left: 0; margin-left: 0; list-style-position: inside; }`).
- [x] `frontend/src/context/ThemeContext.tsx`: React global state manager to toggle and persist theme preference across all 3 modes in `localStorage`.

### Step 3: TypeScript Interfaces & Static Data Layer
- [x] `frontend/src/types/portfolio.ts`: `Profile`, `Project`, `Experience`, `SkillCategory`, `BlogPost`, and `NowState` interface definitions.
- [x] `frontend/src/data/profile.ts`: Bio, avatar path, social links, location.
- [x] `frontend/src/data/projects.ts`: Featured & general project list.
- [x] `frontend/src/data/experience.ts`: Work & education history entries.
- [x] `frontend/src/data/skills.ts`: Grouped skill categories.
- [x] `frontend/src/data/now.ts`: Current activities, reading list, current focus.

### Step 4: Presentation Wrappers & Theme Layouts
- [x] Storybook 8 & Vitest + Testing Library setup (`.storybook/` config, `happy-dom` test environment).
- [x] Accessibility (a11y) foundational primitives (`.sr-only` utility, `aria-hidden` on ASCII border art, focus visible styles).
- [x] `frontend/src/components/ui/BoxContainer.tsx`: Adaptive container supporting ASCII border boxes and Modern clean section cards.
- [x] `frontend/src/components/layout/ThemeToggle.tsx`: Header toggle button cycling through `[ MODE: ASCII ]` -> `[ MODE: CLI ]` -> `[ MODE: MODERN ]`.
- [x] `frontend/src/components/layout/AsciiLayout.tsx`: Centered single-column ASCII box frame layout.
- [x] `frontend/src/components/layout/CliLayout.tsx`: Retro terminal shell window layout.
- [x] `frontend/src/components/layout/ModernLayout.tsx`: Glassmorphic Anthropic/OpenAI-inspired editorial layout.
- [x] `frontend/src/components/layout/LayoutRenderer.tsx`: Dynamic renderer selecting layout based on active global theme.
- [x] Component `.stories.tsx` files for isolated Storybook previewing & Vitest unit tests.

### Step 5: Page Components & React Router Integration
- [x] `frontend/src/pages/HomePage.tsx`: Hero section, quick bio, featured projects, skill summary.
- [x] `frontend/src/pages/AboutPage.tsx`: Full bio, values, Skill Matrix.
- [x] `frontend/src/pages/ProjectsPage.tsx`: All projects grid with tech tag filters.
- [x] `frontend/src/pages/ExperiencePage.tsx`: Experience and education timeline with left-aligned bullet highlights.
- [x] `frontend/src/pages/NowPage.tsx`: What I'm currently working on and reading.
- [x] `frontend/src/pages/ContactPage.tsx`: Contact information and social platforms.
- [x] `frontend/src/pages/HowThisSiteWorksPage.tsx`: Technical architecture, design system, and testing stack breakdown.
- [x] `frontend/src/pages/NotFoundPage.tsx`: 404 page output.
- [x] `frontend/src/App.tsx`: React Router configuration wrapped with `ThemeProvider` and `LayoutRenderer`.
- [x] `frontend/src/main.tsx`: Client-side `BrowserRouter` root integration.
- [x] `frontend/src/pages/Pages.test.tsx`: Vitest component unit tests for all pages & tag filtering.
- [x] `frontend/src/App.test.tsx`: Comprehensive router integration unit tests for 3-theme switching.
- [x] `frontend/e2e/portfolio.spec.ts`: Playwright real browser E2E tests for routing, 3-theme switching, and tag filters.

### Step 6: Blog Engine & Technical Articles
- [x] `frontend/src/types/portfolio.ts`: Added `BlogPost` interface definition (`id`, `slug`, `title`, `description`, `updatedDate`, `readTime`, `tags`, `author`, `content`, `category`, `featured`).
- [x] `frontend/src/data/posts/`: Created dedicated modular markdown posts directory housing technical articles (`blog-*.md`).
- [x] `frontend/src/data/blogPosts.ts`: Refactored static data module to use Vite raw imports (`?raw`), housing query helpers (`getAllBlogPosts`, `getBlogPostBySlug`, `getBlogPostsByTag`, `getGroupedBlogPostsByCategory`, `getRelatedBlogPosts`).
- [x] Prominent **TL;DR** callout blocks added to the top of all 10 technical articles.
- [x] Published 10 technical blog posts:
  - `blog-how-to-push-project-to-github.md` (Beginner guide on git init, .gitignore, commits, and pushing via GitHub CLI/Web)
  - `blog-how-to-add-a-new-theme.md` (Step-by-step guide to adding design tokens, layouts, context, and tests for new themes)
  - `blog-building-a-full-featured-react-blog-engine.md`
  - `blog-demystifying-react-architecture-and-dev-tools.md`
  - `blog-modular-react-architecture-and-design-tokens.md`
  - `blog-testing-storybook-and-a11y-react-architecture.md`
  - `blog-testing-strategy-vitest-happy-dom-and-playwright.md`
  - `blog-frontend-foundations-q-and-a.md`
  - `blog-demystifying-react-scaffolding.md`
  - `blog-master-frontend-testing-strategy.md` (Deep dive into 4-tier testing pyramid: Vitest, RTL, Storybook, Playwright)
- [x] `frontend/src/components/blog/BlogCard.tsx`: Reusable blog card component with CSS design token support and `Updated: YYYY-MM-DD` timestamp.
- [x] `frontend/src/pages/BlogListPage.tsx`: Interactive blog list page with keyword search bar, tag filtering pills, category section grouping, and post grid.
- [x] `frontend/src/pages/BlogDetailPage.tsx`: Article detail view page with breadcrumbs, headers, tags, structured markdown rendering, custom markdown table parser, prominent TL;DR callout styling, and automated Related Articles section.

### Step 7: UX/UI & Accessibility SME Design Polish
- [x] Standardized design tokens across `a11y.css`, `Pages.css`, and `variables.css`.
- [x] Fixed `#main-content` target across `AsciiLayout`, `CliLayout`, and `ModernLayout` for consistent skip navigation.
- [x] Refactored `ThemeToggle` accessibility with explicit multi-state `aria-label` guidance.
- [x] Added active tactile click feedback (`transform: translateY(1px)`) to all buttons and tag filters.
- [x] Redesigned `ModernLayout` footer to use a floating glassmorphic card container with rounded corners (`16px`), matching `.box-container` cards.
- [x] Universal Contact page label alignment (`min-width: 95px`) across ASCII, CLI, and Modern themes.
- [x] Custom markdown table parser and responsive `.blog-table-container` CSS rendering column-aligned tables across all 3 themes.
- [x] Universal zero-indent bullet list alignment (`list-style-position: inside`, `padding-left: 0`) ensuring bullets align flush left with paragraphs.


### Step 8: Version Control & GitHub Publishing
- [x] Initialized Git repository on `main` branch.
- [x] Configured `.gitignore` excluding generated assets (`node_modules`, `dist`, `.env`).
- [x] Staged and committed initial portfolio codebase and blog articles.
- [x] Created public GitHub repository and pushed code to `https://github.com/chris-lau/personalWebsite`.

---

## Verification Plan

### Automated Verification
- Run TypeScript compiler (`npx tsc --noEmit`) to verify strict typing.
- Run `npm test` (`vitest --run`) to execute automated component rendering, data layer, & routing unit tests (33/33 tests passed).
- Run `npm run test:e2e` (`playwright test`) to execute end-to-end browser tests in Chromium across ASCII, CLI, and Modern Editorial modes (5/5 tests passed).
- Run `npm run build` (`tsc && vite build`) to verify clean production build output.

### Manual Verification
- Test all page routes (`/`, `/about`, `/projects`, `/blog`, `/blog/:slug`, `/experience`, `/now`, `/contact`, `/how-this-site-works`, and unknown 404 paths).
- Test switching between **ASCII**, **CLI**, and **Modern Editorial** themes using the header toggle button and verify selection persists across page refreshes.
- Verify universal zero-indent bullet list alignment across all sections (Career & Experience, Skill Matrix, Now Page, Blog Detail View).
- Verify responsive mobile and desktop layout rendering.
