# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.ts >> Portfolio E2E Tests >> navigates through all core page routes
- Location: e2e/portfolio.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'FRONTEND DEVELOPMENT GUIDEBOOK' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'FRONTEND DEVELOPMENT GUIDEBOOK' })

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- banner:
  - link "CL / Chris Lau":
    - /url: /
  - radiogroup "Theme Mode Selection":
    - radio "Set theme to MODERN" [checked]: MODERN
    - radio "Set theme to ASCII": ASCII
    - radio "Set theme to CLI": CLI
  - navigation "Main Navigation":
    - list:
      - listitem:
        - link "Home":
          - /url: /
      - listitem:
        - link "About":
          - /url: /about
      - listitem:
        - link "Projects":
          - /url: /projects
      - listitem:
        - link "Blog":
          - /url: /blog
      - listitem:
        - link "Book":
          - /url: /guidebook
      - listitem:
        - link "Experience":
          - /url: /experience
      - listitem:
        - link "Now":
          - /url: /now
      - listitem:
        - link "Stack":
          - /url: /how-this-site-works
      - listitem:
        - link "Contact":
          - /url: /contact
- main:
  - heading "SOFTWARE ENGINEERING GUIDEBOOK SERIES" [level=3]
  - 'heading "Volume 1: Building Modern Web Applications" [level=1]'
  - paragraph: A Step-by-Step Architecture Guide for Frontend Beginners, TPMs & Engineers
  - paragraph:
    - text: Written by
    - strong: Chris Lau
    - text: — Staff Product Manager, AI & Enterprise Systems. This interactive guidebook series breaks down modern full-stack web architecture, TypeScript patterns, Python FastAPI REST design, Pydantic schemas, server-side caching, testing strategies, and containerized cloud deployments.
  - tablist "Guidebook volume selection":
    - 'tab "📘 Vol 1: Frontend Architecture (Ch 1–9)" [selected]'
    - 'tab "🐍 Vol 2: FastAPI Backend Engine (Ch 1–7)"'
  - complementary "Table of Contents":
    - heading "> VOL 1 TABLE OF CONTENTS" [level=2]
    - navigation:
      - list:
        - listitem:
          - button "Ch 1. The Modern Frontend Ecosystem & Project Setup"
          - list:
            - listitem: "1.1 Understanding the Stack: React, TypeScript, Vite, and Node.js"
            - listitem: 1.2 The Standard 7 Boilerplate Files Explained
            - listitem: 1.3 Step-by-Step Project Initialization
        - listitem:
          - button "Ch 2. Design Tokens & CSS Architecture"
        - listitem:
          - button "Ch 3. Data Architecture & The Repository Pattern"
        - listitem:
          - button "Ch 4. React State Management & Theme Engine"
        - listitem:
          - button "Ch 5. Single Page Application (SPA) Routing"
        - listitem:
          - button "Ch 6. Modern Testing Strategy & The Testing Pyramid"
        - listitem:
          - button "Ch 7. Building a Dynamic Blog Engine & Content Processing"
        - listitem:
          - button "Ch 8. UX Polish, Accessibility SME Rules & Cloudflare Pages Deployment"
        - listitem:
          - button "Ch 9. Consuming External REST APIs & Client-Side Caching"
  - main:
    - heading "CHAPTER 1 of 9" [level=3]
    - text: Volume 1 — Chapter 1
    - heading "The Modern Frontend Ecosystem & Project Setup" [level=2]
    - 'heading "Chapter 1: The Modern Frontend Ecosystem & Project Setup" [level=2]'
    - heading "1.1 Understanding the Stack" [level=3]
    - paragraph: "Before writing a single line of code, let's break down the role of each tool in a modern frontend project:"
    - list:
      - listitem: "**React**: A JavaScript library for building user interfaces using declarative **Components**. Instead of manually manipulating web page elements (like in jQuery or raw HTML), you write components that re-render automatically when data changes."
    - list:
      - listitem: "**TypeScript**: A strongly typed superset of JavaScript. It acts as an automated safety net, catching bugs (like typos, missing properties, or incorrect data types) *before* you run your code in a browser."
    - list:
      - listitem: "**Vite** *(pronounced \"veet\")*: A lightning-fast modern build tool and local development server. It compiles your TypeScript code and reloads the browser in under 10 milliseconds when you save changes."
    - list:
      - listitem: "**`npm` (Node Package Manager)**: The package manager used to install third-party libraries (like React, icons, and routers)."
    - separator
    - heading "1.2 The Standard 7 Boilerplate Files" [level=3]
    - paragraph: "When initializing a modern Vite + React + TypeScript application, 7 core configuration and entry files form the backbone of the project:"
    - table:
      - rowgroup:
        - row "File Name Purpose & Responsibility":
          - columnheader "File Name"
          - columnheader "Purpose & Responsibility"
      - rowgroup:
        - 'row "`index.html` The single HTML file served to the browser. Contains `<div id=\"root\"></div>` where React mounts."':
          - 'cell "`index.html`"'
          - 'cell "The single HTML file served to the browser. Contains `<div id=\"root\"></div>` where React mounts."'
        - 'row "`package.json` The project manifest file listing all installed dependencies (`react`, `vite`), dev tools, and runnable scripts (`npm run dev`, `npm test`)."':
          - 'cell "`package.json`"'
          - 'cell "The project manifest file listing all installed dependencies (`react`, `vite`), dev tools, and runnable scripts (`npm run dev`, `npm test`)."'
        - 'row "`tsconfig.json` The compiler configuration file telling TypeScript how strictly to check your code and how to parse JSX."':
          - 'cell "`tsconfig.json`"'
          - cell "The compiler configuration file telling TypeScript how strictly to check your code and how to parse JSX."
        - 'row "`vite.config.ts` The Vite build server configuration file (sets server port, React plugins, and test environment rules)."':
          - 'cell "`vite.config.ts`"'
          - cell "The Vite build server configuration file (sets server port, React plugins, and test environment rules)."
        - 'row "`src/main.tsx` The Application Entry Point. Connects React to the HTML DOM (`ReactDOM.createRoot`), wraps the app in top-level providers, and imports global CSS."':
          - 'cell "`src/main.tsx`"'
          - 'cell "The Application Entry Point. Connects React to the HTML DOM (`ReactDOM.createRoot`), wraps the app in top-level providers, and imports global CSS."'
        - 'row "`src/App.tsx` The Root Component Shell. Holds top-level layout containers, theme providers, and page navigation routes."':
          - 'cell "`src/App.tsx`"'
          - cell "The Root Component Shell. Holds top-level layout containers, theme providers, and page navigation routes."
        - 'row "`src/vite-env.d.ts` TypeScript type declarations for Vite environment features (e.g. `import.meta.env` and raw static imports)."':
          - 'cell "`src/vite-env.d.ts`"'
          - 'cell "TypeScript type declarations for Vite environment features (e.g. `import.meta.env` and raw static imports)."'
    - separator
    - heading "1.3 Step-by-Step Project Initialization" [level=3]
    - paragraph: "To create a new Vite + React + TypeScript project from scratch:"
    - code: "# 1. Create a new Vite app using the React-TS template npm create vite@latest my-app -- --template react-ts # 2. Navigate into the project folder cd my-app # 3. Install core dependencies npm install react react-dom react-router-dom lucide-react # 4. Start the local development server npm run dev"
    - paragraph: "Your browser will automatically open `http://localhost:3000` with instant Hot Module Replacement (HMR) enabled!"
    - navigation "Chapter Pagination":
      - 'button "Ch 2: Design Tokens & CSS Architecture →"'
- contentinfo:
  - text: CL / Chris Lau — Staff Product Manager, AI
  - paragraph: © 2026 Chris Lau. All rights reserved.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Portfolio E2E Tests', () => {
  4   |   test('navigates through all core page routes', async ({ page }) => {
  5   |     // 1. Home page
  6   |     await page.goto('/');
  7   |     await expect(page.getByRole('heading', { name: 'WELCOME' })).toBeVisible();
  8   | 
  9   |     // 2. About page
  10  |     await page.click('nav.modern-nav >> text="About"');
  11  |     await expect(page.getByRole('heading', { name: 'ABOUT ME' })).toBeVisible();
  12  |     await expect(page).toHaveURL('/about');
  13  | 
  14  |     // 3. Projects page
  15  |     await page.click('nav.modern-nav >> text="Projects"');
  16  |     await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();
  17  |     await expect(page).toHaveURL('/projects');
  18  | 
  19  |     // 4. Blog page
  20  |     await page.click('nav.modern-nav >> text="Blog"');
  21  |     await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();
  22  |     await expect(page).toHaveURL('/blog');
  23  | 
  24  |     // 4b. Book / Guidebook page
  25  |     await page.click('nav.modern-nav >> text="Book"');
> 26  |     await expect(page.getByRole('heading', { name: 'FRONTEND DEVELOPMENT GUIDEBOOK' })).toBeVisible();
      |                                                                                         ^ Error: expect(locator).toBeVisible() failed
  27  |     await expect(page).toHaveURL('/guidebook');
  28  | 
  29  |     // 5. Experience page
  30  |     await page.click('nav.modern-nav >> text="Experience"');
  31  |     await expect(page.getByRole('heading', { name: 'CAREER & EXPERIENCE' })).toBeVisible();
  32  |     await expect(page).toHaveURL('/experience');
  33  | 
  34  |     // 6. Now page
  35  |     await page.click('nav.modern-nav >> text="Now"');
  36  |     await expect(page.getByRole('heading', { name: "WHAT I'M DOING NOW" })).toBeVisible();
  37  |     await expect(page).toHaveURL('/now');
  38  | 
  39  |     // 7. Stack / How this site works page
  40  |     await page.click('nav.modern-nav >> text="Stack"');
  41  |     await expect(page.getByRole('heading', { name: 'HOW THIS SITE WORKS' })).toBeVisible();
  42  |     await expect(page).toHaveURL('/how-this-site-works');
  43  | 
  44  |     // 8. Contact page
  45  |     await page.click('nav.modern-nav >> text="Contact"');
  46  |     await expect(page.getByRole('heading', { name: 'GET IN TOUCH' })).toBeVisible();
  47  |     await expect(page).toHaveURL('/contact');
  48  |   });
  49  | 
  50  |   test('searches and navigates to blog post detail view', async ({ page }) => {
  51  |     await page.goto('/blog');
  52  |     await expect(page.getByRole('heading', { name: 'TECHNICAL BLOG' })).toBeVisible();
  53  | 
  54  |     // Type in search box
  55  |     const searchInput = page.getByPlaceholder('Search posts by keyword or topic...');
  56  |     await searchInput.fill('Architecture');
  57  | 
  58  |     // Click on the matching blog post title
  59  |     await page.click('text=Demystifying Modern React Architecture');
  60  |     await expect(page).toHaveURL(/\/blog\/demystifying-react-architecture-and-dev-tools/);
  61  | 
  62  |     // Verify blog detail header
  63  |     await expect(page.getByRole('heading', { name: /Demystifying Modern React Architecture/ })).toBeVisible();
  64  |     await expect(page.locator('text=By Chris Lau')).toBeVisible();
  65  | 
  66  |     // Click back link
  67  |     await page.click('text=← Back to all blog posts');
  68  |     await expect(page).toHaveURL('/blog');
  69  |   });
  70  | 
  71  | 
  72  |   test('toggles theme between MODERN, ASCII, and CLI modes', async ({ page }) => {
  73  |     await page.goto('/');
  74  |     
  75  |     // Check initial state has data-theme attribute
  76  |     const htmlElement = page.locator('html');
  77  |     await expect(htmlElement).toHaveAttribute('data-theme', 'modern');
  78  |     await expect(page.locator('.modern-layout-container')).toBeVisible();
  79  | 
  80  |     // Click theme segment button to switch to ASCII
  81  |     await page.click('button[aria-label="Set theme to ASCII"]');
  82  |     await expect(htmlElement).toHaveAttribute('data-theme', 'ascii');
  83  |     await expect(page.locator('.ascii-layout-container')).toBeVisible();
  84  | 
  85  |     // Click theme segment button to switch to CLI
  86  |     await page.click('button[aria-label="Set theme to CLI"]');
  87  |     await expect(htmlElement).toHaveAttribute('data-theme', 'cli');
  88  |     await expect(page.locator('.cli-layout-container')).toBeVisible();
  89  | 
  90  |     // Switch back to MODERN
  91  |     await page.click('button[aria-label="Set theme to MODERN"]');
  92  |     await expect(htmlElement).toHaveAttribute('data-theme', 'modern');
  93  |   });
  94  | 
  95  | 
  96  |   test('filters projects by technology tag and switches to Live GitHub Activity tab', async ({ page }) => {
  97  |     await page.goto('/projects');
  98  |     await expect(page.getByRole('heading', { name: 'FEATURED PORTFOLIO PROJECTS' })).toBeVisible();
  99  | 
  100 |     // Click React tag filter button
  101 |     const reactBtn = page.getByRole('button', { name: '#React' });
  102 |     if (await reactBtn.isVisible()) {
  103 |       await reactBtn.click();
  104 |       await expect(reactBtn).toHaveClass(/active/);
  105 |     }
  106 | 
  107 |     // Switch to Live GitHub Activity tab
  108 |     await page.click('role=tab[name="🐙 Live GitHub Activity"]');
  109 |     await expect(page.getByRole('heading', { name: 'LIVE GITHUB ACTIVITY & REPOSITORIES' })).toBeVisible();
  110 |     await expect(page.getByPlaceholder('Lookup any GitHub user / org...')).toBeVisible();
  111 |   });
  112 | 
  113 |   test('handles 404 routes correctly', async ({ page }) => {
  114 |     await page.goto('/unknown-page');
  115 |     await expect(page.getByRole('heading', { name: 'ERROR 404' })).toBeVisible();
  116 | 
  117 |     // Click return home link
  118 |     await page.click('text=Return Home');
  119 |     await expect(page).toHaveURL('/');
  120 |     await expect(page.getByRole('heading', { name: 'WELCOME' })).toBeVisible();
  121 |   });
  122 | });
  123 | 
```