# Building Modern Web Applications: A Step-by-Step Guide for Frontend Beginners

Welcome to **Building Modern Web Applications**! This book is written specifically for developers, backend engineers, technical product managers, or anyone new to modern frontend development who wants to understand not just *how* to write code, but *why* modern frontend architecture is designed the way it is.

---

## Table of Contents

1. [Chapter 1: The Modern Frontend Ecosystem & Project Setup](#chapter-1-the-modern-frontend-ecosystem--project-setup)
   - 1.1 Understanding the Stack: React, TypeScript, Vite, and Node.js
   - 1.2 The Standard 7 Boilerplate Files Explained
   - 1.3 Step-by-Step Project Initialization
2. [Chapter 2: Design Tokens & CSS Architecture](#chapter-2-design-tokens--css-architecture)
   - 2.1 What Are Design Tokens?
   - 2.2 CSS Custom Properties (`var(--token)`)
   - 2.3 Separation of Concerns: `variables.css` vs `global.css`
   - 2.4 Accessibility & Contrast Ratios (WCAG AA)
3. [Chapter 3: Data Architecture & The Repository Pattern](#chapter-3-data-architecture--the-repository-pattern)
   - 3.1 Defining Data Contracts in `src/types/`
   - 3.2 Decoupling Content with `src/data/`
   - 3.3 The Repository Pattern (`blogPosts.ts`)
   - 3.4 `.ts` vs `.tsx` File Extensions
4. [Chapter 4: React State Management & Theme Engine](#chapter-4-react-state-management--theme-engine)
   - 4.1 What Problem Does React Context Solve? (Avoiding Prop Drilling)
   - 4.2 Building a 3-Way Theme Switcher (`ThemeContext.tsx`)
   - 4.3 Persisting State with `localStorage`
5. [Chapter 5: Single Page Application (SPA) Routing](#chapter-5-single-page-application-spa-routing)
   - 5.1 Multi-Page Apps vs Single Page Applications (SPAs)
   - 5.2 The 3-Layer Routing Architecture (`react-router-dom`)
   - 5.3 Dynamic Slugs & 404 Route Fallbacks
6. [Chapter 6: Modern Testing Strategy & The Testing Pyramid](#chapter-6-modern-testing-strategy--the-testing-pyramid)
   - 6.1 The 3 Tiers of Frontend Testing (Unit, Integration, E2E)
   - 6.2 Unit & Integration Testing with Vitest + React Testing Library
   - 6.3 Isolated Component Workshops with Storybook 8 & `@storybook/addon-a11y`
   - 6.4 Real Browser End-to-End Testing with Playwright
7. [Chapter 7: Building a Dynamic Blog Engine & Content Processing](#chapter-7-building-a-dynamic-blog-engine--content-processing)
   - 7.1 Vite Raw Asset Imports (`?raw`)
   - 7.2 Markdown Content Processing & Custom Table Parsers
   - 7.3 Content Recommendations & Related Article Algorithms
8. [Chapter 8: UX Polish, Accessibility SME Rules & Cloudflare Pages Deployment](#chapter-8-ux-polish-accessibility-sme-rules--cloudflare-pages-deployment)
   - 8.1 Accessibility Skip Navigation (`#main-content`)
   - 8.2 Accessible Segmented Controls (`role="radiogroup"` & `role="radio"`)
   - 8.3 Mobile Responsive Drawers & Touch Targets
   - 8.4 Deploying SPAs to Cloudflare Pages (`_redirects` SPA Fallbacks)
9. [Chapter 9: Consuming External REST APIs & Client-Side Caching](#chapter-9-consuming-external-rest-apis--client-side-caching)
   - 9.1 Decoupling Raw API Payloads from View Models
   - 9.2 Handling Rate Limits with `sessionStorage` Caching
   - 9.3 Encapsulating Async Lifecycles in Custom React Hooks
   - 9.4 Tabbed UI Integration & Storybook Visual Workshops

---

## Chapter 1: The Modern Frontend Ecosystem & Project Setup

### 1.1 Understanding the Stack

Before writing a single line of code, let's break down the role of each tool in a modern frontend project:

- **React**: A JavaScript library for building user interfaces using declarative **Components**. Instead of manually manipulating web page elements (like in jQuery or raw HTML), you write components that re-render automatically when data changes.
- **TypeScript**: A strongly typed superset of JavaScript. It acts as an automated safety net, catching bugs (like typos, missing properties, or incorrect data types) *before* you run your code in a browser.
- **Vite** *(pronounced "veet")*: A lightning-fast modern build tool and local development server. It compiles your TypeScript code and reloads the browser in under 10 milliseconds when you save changes.
- **`npm` (Node Package Manager)**: The package manager used to install third-party libraries (like React, icons, and routers).

---

### 1.2 The Standard 7 Boilerplate Files

When initializing a modern Vite + React + TypeScript application, 7 core configuration and entry files form the backbone of the project:

| File Name | Purpose & Responsibility |
| :--- | :--- |
| **`index.html`** | The single HTML file served to the browser. Contains `<div id="root"></div>` where React mounts. |
| **`package.json`** | The project manifest file listing all installed dependencies (`react`, `vite`), dev tools, and runnable scripts (`npm run dev`, `npm test`). |
| **`tsconfig.json`** | The compiler configuration file telling TypeScript how strictly to check your code and how to parse JSX. |
| **`vite.config.ts`** | The Vite build server configuration file (sets server port, React plugins, and test environment rules). |
| **`src/main.tsx`** | The **Application Entry Point**. Connects React to the HTML DOM (`ReactDOM.createRoot`), wraps the app in top-level providers, and imports global CSS. |
| **`src/App.tsx`** | The **Root Component Shell**. Holds top-level layout containers, theme providers, and page navigation routes. |
| **`src/vite-env.d.ts`** | TypeScript type declarations for Vite environment features (e.g. `import.meta.env` and raw static imports). |

---

### 1.3 Step-by-Step Project Initialization

To create a new Vite + React + TypeScript project from scratch:

```bash
# 1. Create a new Vite app using the React-TS template
npm create vite@latest my-app -- --template react-ts

# 2. Navigate into the project folder
cd my-app

# 3. Install core dependencies
npm install react react-dom react-router-dom lucide-react

# 4. Start the local development server
npm run dev
```

Your browser will automatically open `http://localhost:3000` with instant Hot Module Replacement (HMR) enabled!

---

## Chapter 2: Design Tokens & CSS Architecture

### 2.1 What Are Design Tokens?

**Design Tokens** are central visual variables that store design decisions — such as colors, font families, container widths, and border styles — in a single location.

Instead of hardcoding raw hex values like `#181616` inside individual component stylesheets, you define named tokens:

```css
/* Hardcoded raw CSS (Avoid this!) */
.button {
  background-color: #181616;
  color: #f2e3c6;
}

/* Using Design Tokens (Best Practice) */
.button {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

---

### 2.2 CSS Custom Properties (`var(--token)`)

CSS Custom Properties allow you to define theme tokens directly in native CSS without requiring preprocessors like Sass.

By scoping tokens under `[data-theme]` attributes in `variables.css`, swapping visual themes across your entire website requires changing only **one attribute on the HTML root element**:

```css
/* Theme 1: ASCII Retro */
[data-theme="ascii"] {
  --bg-primary: #181616;
  --text-primary: #f2e3c6;
  --font-family: 'JetBrains Mono', monospace;
}

/* Theme 2: Modern Editorial */
[data-theme="modern"] {
  --bg-primary: #121316;
  --text-primary: #f4f4f6;
  --font-family: 'Inter', sans-serif;
}
```

When JavaScript sets `<html data-theme="modern">`, every element using `var(--bg-primary)` instantly updates its background color and font family!

---

### 2.3 Separation of Concerns: `variables.css` vs `global.css`

To keep your stylesheets organized, divide global CSS into two distinct files:

- **`src/styles/variables.css`**: Holds **DATA & TOKENS** (color palettes, font names, container max-widths).
- **`src/styles/global.css`**: Holds **STRUCTURAL & LAYOUT RULES** (universal CSS resets like `box-sizing: border-box`, default margins, list resets, and body defaults).

---

### 2.4 Accessibility & Contrast Ratios (WCAG AA)

Web Content Accessibility Guidelines (**WCAG 2.1 AA**) require a contrast ratio of at least **4.5:1** for standard body text against its background. 

When choosing design tokens for dark modes or custom themes, always verify color contrast ratios using browser DevTools or accessibility tools to ensure low-vision readability:

```css
/* 5.5+:1 High Contrast Warm Muted Tone (WCAG AA Compliant) */
--text-muted: #cbbfa8; 
```

---

## Chapter 3: Data Architecture & The Repository Pattern

### 3.1 Defining Data Contracts in `src/types/`

The `src/types/` directory serves as the **Single Source of Truth** for data models and shared TypeScript definitions across your application.

```ts
// src/types/portfolio.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string; // Optional property
  featured: boolean;
}
```

#### Rule of Thumb for Types:
- **Shared Types** (used across multiple components or data files) ➔ Place in `src/types/`.
- **Private Props** (only used by 1 specific component file) ➔ Keep local inside that component file.

---

### 3.2 Decoupling Content with `src/data/`

Never hardcode raw data strings directly inside React UI components! Store structured content inside typed static data files under `src/data/`:

```ts
// src/data/projects.ts
import { Project } from '../types/portfolio';

export const projectsData: Project[] = [
  {
    id: 'portfolio-site',
    title: 'Multi-Theme Personal Website',
    description: 'A responsive React + TypeScript portfolio with real-time theme toggling.',
    techStack: ['React', 'TypeScript', 'Vite'],
    featured: true,
  },
];
```

---

### 3.3 The Repository Pattern (`blogPosts.ts`)

For content that requires search, filtering, or lookups (like a blog or product catalog), co-locate **query helper functions** alongside the data in a service/repository file:

```ts
// src/data/blogPosts.ts
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsData.find((post) => post.slug === slug);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  if (!tag || tag === 'All') return blogPostsData;
  return blogPostsData.filter((post) => post.tags.includes(tag));
}
```

This pattern keeps UI components clean — instead of writing array `.filter()` loops inside React components, components simply call `getBlogPostBySlug(slug)`.

---

### 3.4 `.ts` vs `.tsx` File Extensions

- **`.ts` (TypeScript)**: Used for pure logic, data files, type definitions, and helper utilities. **Cannot contain React JSX tags (`<div />`)**.
- **`.tsx` (TypeScript + JSX)**: Used for React component files that render UI HTML elements (`<div>`, `<App />`, `<Route />`).

---

## Chapter 4: React State Management & Theme Engine

### 4.1 What Problem Does React Context Solve?

In React, data normally flows downwards from parent to child via `props`. If a deeply nested footer button needs to toggle the theme, you would have to pass the `toggleTheme` function down through every intermediate component. This problem is called **Prop Drilling**.

**React Context** provides a "teleportation channel" (global state) that allows any component anywhere in the tree to read or update state directly!

---

### 4.2 Building a 3-Way Theme Switcher (`ThemeContext.tsx`)

```tsx
// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode } from '../types/theme';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = 'portfolio_theme';
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode;
    return saved ? saved : 'modern';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme); // 4.3 Persist to localStorage!
  };

  useEffect(() => {
    // Dynamically update root HTML attribute whenever theme state changes
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## Chapter 5: Single Page Application (SPA) Routing

### 5.1 Multi-Page Apps vs Single Page Applications (SPAs)

In traditional multi-page web applications, clicking a link sends a network request to the server, resulting in a blank screen flash while a new HTML page downloads.

In a **Single Page Application (SPA)**:
1. The browser downloads **only 1 HTML file** (`index.html`).
2. JavaScript intercepts link clicks, updates the browser address bar via the HTML5 History API, and mounts/unmounts React page components in **milliseconds** without a page refresh!

---

### 5.2 The 3-Layer Routing Architecture (`react-router-dom`)

Client-side routing is wired across 3 connected layers:

1. **Router Container (`src/main.tsx`)**: `<BrowserRouter>` wraps the application at the root level to listen to URL address bar changes.
2. **Route Mapping Engine (`src/App.tsx`)**: `<Routes>` acts as a declarative switch matching URL paths to Page components:
   ```tsx
   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/about" element={<AboutPage />} />
     <Route path="/projects" element={<ProjectsPage />} />
     <Route path="/blog" element={<BlogListPage />} />
     <Route path="/blog/:slug" element={<BlogDetailPage />} /> {/* Dynamic Slug */}
     <Route path="*" element={<NotFoundPage />} />           {/* 404 Fallback */}
   </Routes>
   ```
3. **Navigation Links (`<Link to="...">`)**: Components use `<Link to="/about">` instead of HTML `<a href="/about">` tags to navigate without refreshing the browser tab.

---

## Chapter 6: Modern Testing Strategy & The Testing Pyramid

### 6.1 The 3 Tiers of Frontend Testing

A robust frontend application employs a **3-Tier Testing Pyramid**:

```text
       / \
      /   \     Tier 3: Playwright Real Browser E2E Tests
     /-----\
    /       \   Tier 2: React Router Integration Tests
   /---------\
  /           \ Tier 1: Unit Tests (Data & Components)
 /-------------\
```

---

### 6.2 Unit & Integration Testing with Vitest + React Testing Library

- **Vitest** is the fast test runner (replaces Jest).
- **React Testing Library** renders components in a simulated DOM (`happy-dom`) and queries elements by their accessible roles:

```tsx
// src/components/layout/ThemeToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

it('switches active theme on button click', () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

  const asciiBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
  fireEvent.click(asciiBtn);
  expect(asciiBtn.getAttribute('aria-checked')).toBe('true');
});
```

---

### 6.3 Storybook 8 & Accessibility Audits

**Storybook** is an isolated component workshop running on `localhost:6006`. Component `.stories.tsx` files allow developers to visual-test UI components in complete isolation.

Integrated with `@storybook/addon-a11y` and `axe-core`, Storybook automatically audits components for WCAG 2.1 AA accessibility compliance (color contrast, ARIA labels, focus states).

---

### 6.4 Real Browser End-to-End (E2E) Testing with Playwright

Playwright runs automated tests inside real headless browsers (Chromium, Firefox, Safari):

```ts
// frontend/e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test('navigates through core page routes', async ({ page }) => {
  await page.goto('/');
  await page.click('nav >> text="About"');
  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { name: 'ABOUT ME' })).toBeVisible();
});
```

---

### Summary Checklist for Frontend Excellence
- [x] Standard 7 Vite/React/TS boilerplate files configured.
- [x] Design Tokens mapped to CSS variables under `[data-theme]`.
- [x] Decoupled static data layer with typed TypeScript interfaces.
- [x] React Context global state management for theme persistence.
- [x] 3-layer SPA client-side routing with `react-router-dom`.
- [x] 3-tier testing suite (Vitest Unit/Integration + Storybook a11y + Playwright E2E).
- [x] External REST API integration with 15-minute `sessionStorage` caching & custom hook state management.

---

## Chapter 9: Consuming External REST APIs & Client-Side Caching

### 9.1 Decoupling Raw API Payloads from View Models

When integrating third-party APIs (such as GitHub's REST API `api.github.com/users/{username}`), raw JSON responses contain dozens of unused or unstable fields.

To protect UI components from API contract breakage, decouple raw API schemas from clean View Models:

```typescript
// Raw API contract matching external service schema
export interface GitHubRepoResponse {
  id: number;
  name: string;
  stargazers_count: number;
  pushed_at: string;
}

// Clean View Model consumed by React UI components
export interface GitHubRepo {
  id: number;
  name: string;
  stars: number;
  formattedLastUpdated: string;
  isRecentlyUpdated: boolean; // Precomputed: updated within last 30 days
}
```

---

### 9.2 Handling Rate Limits with `sessionStorage` Caching

Unauthenticated public API calls are often subject to strict IP rate limits (e.g. 60 req/hr on GitHub). To prevent quota exhaustion:

1. Check `sessionStorage` before firing `fetch()`.
2. Save successful JSON payloads with a timestamp and a 15-minute TTL (Time-To-Live).

```typescript
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const cacheKey = 'gh_user_' + username.toLowerCase();
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL_MS) {
      return data; // Return cached payload instantly!
    }
  }

  const response = await fetch('https://api.github.com/users/' + encodeURIComponent(username));
  const rawData = await response.json();
  const transformed = transformUser(rawData);

  sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: transformed }));
  return transformed;
}
```

---

### 9.3 Encapsulating Async Lifecycles in Custom React Hooks

Move asynchronous state management (`loading`, `error`, `data`, `refetch`) out of UI components and into reusable custom hooks:

```typescript
export function useGitHubData(initialUsername = 'chris-lau') {
  const [username, setUsername] = useState(initialUsername);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([fetchGitHubUser(username), fetchGitHubRepos(username)])
      .then(([userData, reposData]) => {
        if (isMounted) {
          setUser(userData);
          setRepos(reposData);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [username]);

  return { username, setUsername, user, repos, loading, error };
}
```

---

### 9.4 Tabbed UI Integration & Storybook Visual Workshops

1. **Accessible Tab Control**: Use `role="tablist"` and `role="tab"` buttons to switch between static curated portfolio projects and dynamic live API feeds (`<GitHubDashboard />`).
2. **Storybook Stories**: Write `.stories.tsx` files to visual-test API UI components with mock payload states across all visual themes (`Modern Editorial`, `Warm ASCII`, and `Retro CLI`).

