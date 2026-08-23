# Testing Modern React Applications: From In-Memory Unit Tests to Real Browser Playwright E2E

*A practical guide to building a comprehensive, multi-tier testing strategy using Vitest, React Testing Library, and Playwright E2E.*

---

## Table of Contents
1. [Introduction](#introduction)
2. [The Testing Pyramid: Choosing the Right Tool for the Job](#the-testing-pyramid-choosing-the-right-tool-for-the-job)
3. [Unit & Component Testing with Vitest + React Testing Library + happy-dom](#unit--component-testing-with-vitest--react-testing-library--happy-dom)
4. [Routing & Integration Testing in Memory](#routing--integration-testing-in-memory)
5. [End-to-End (E2E) Browser Testing with Playwright](#end-to-end-e2e-browser-testing-with-playwright)
6. [Why Keep Unit Tests in `happy-dom` while E2E runs in Playwright?](#why-keep-unit-tests-in-happy-dom-while-e2e-runs-in-playwright)
7. [Visual E2E Debugging: Headed Mode & Playwright UI Runner](#visual-e2e-debugging-headed-mode--playwright-ui-runner)
8. [Conclusion](#conclusion)

---

## Introduction

When building web applications, developers frequently ask:
- *"Are unit tests enough, or do I need full browser E2E tests?"*
- *"Should I test components in an in-memory DOM like `happy-dom` or launch real browsers for everything?"*
- *"How do I test client-side routing, tag filters, and global theme state without slow test suites?"*

In this article, we will examine the multi-tiered testing setup built for our personal portfolio site using **Vitest**, **React Testing Library**, and **Playwright**.

We will cover:
1. Fast in-memory component unit testing.
2. In-memory client-side route & integration testing.
3. Real browser Playwright E2E testing for user flows, themes, and interactive filters.
4. Interactive visual debugging with Playwright's UI mode.

---

## The Testing Pyramid: Choosing the Right Tool for the Job

A robust frontend testing strategy relies on two complementary testing layers:

| Test Tier | Tool | Execution Speed | Scope |
| :--- | :--- | :--- | :--- |
| **Unit / Component Tests** | Vitest + `happy-dom` | **Sub-second** (~1.5s total) | Tests individual React components, static data binding, and local state in simulated DOM memory. |
| **End-to-End (E2E) Tests** | Playwright | **Seconds** (~5.2s total) | Spins up a local Vite dev server and automates real Chromium/Webkit browser interactions (clicks, route changes, localStorage persistence). |

---

## Unit & Component Testing with Vitest + React Testing Library + happy-dom

### Component Isolation Testing

For individual page components like `HomePage` or `ProjectsPage`, we want fast feedback without launching heavy browser instances.

We configure Vitest in `vite.config.ts` using `happy-dom` as our light DOM environment:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    exclude: ['e2e/**', 'node_modules/**']
  }
});
```

### Testing Static Data & Interactive Filtering (`Pages.test.tsx`)

In `Pages.test.tsx`, we render page components in memory and assert DOM content and state changes:

```tsx
// src/pages/Pages.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectsPage } from './ProjectsPage';

describe('Page Components Unit Tests', () => {
  it('renders ProjectsPage and handles tag filtering', () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    // Verify initial rendering
    expect(screen.getByText('PROJECT ARCHIVE')).toBeDefined();
    
    // Verify default active tag filter
    const allButton = screen.getByRole('button', { name: '[All]' });
    expect(allButton.className).toContain('active');

    // Simulate clicking a tech filter button
    const reactTag = screen.queryByRole('button', { name: '#React' });
    if (reactTag) {
      fireEvent.click(reactTag);
      expect(reactTag.className).toContain('active');
    }
  });
});
```

---

## Routing & Integration Testing in Memory

### Testing React Router in `App.test.tsx`

Before opening a real browser, we test our `<App />` router configuration using React Router's `<MemoryRouter>`:

```tsx
// src/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Router Integration', () => {
  it('renders home page by default at route "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('WELCOME')).toBeDefined();
  });

  it('renders 404 page for unknown route "/invalid-route"', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('ERROR 404')).toBeDefined();
  });

  it('navigates to another page when clicking nav links in header', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const projectsLink = screen.getByRole('link', { name: '[PROJECTS]' });
    fireEvent.click(projectsLink);

    expect(screen.getByText('PROJECT ARCHIVE')).toBeDefined();
  });

  it('filters blog posts by search query in BlogListPage', () => {
    render(
      <MemoryRouter initialEntries={['/blog']}>
        <App />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText(/Search posts/i);
    fireEvent.change(searchInput, { target: { value: 'Building' } });

    expect(screen.getByText(/Building a Full-Featured Blog Engine/i)).toBeDefined();
  });
});
```

This catches broken routes, missing links, bad imports, and state query failures in milliseconds.


---

## End-to-End (E2E) Browser Testing with Playwright

Unit tests verify that components *should* work; Playwright E2E tests verify that the app *actually* works in real web browsers.

### Setting Up `playwright.config.ts`

Playwright can automatically spin up your Vite dev server (`npm run dev`) before executing test specs:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Real Browser Test Spec (`portfolio.spec.ts`)

Our E2E test suite checks multi-page navigation, theme switching state (`data-theme`), and interactive features:

```typescript
// e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio E2E Tests', () => {
  test('navigates through all core page routes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'WELCOME' })).toBeVisible();

    await page.click('text=[ABOUT]');
    await expect(page.getByRole('heading', { name: 'ABOUT ME' })).toBeVisible();
    await expect(page).toHaveURL('/about');

    await page.click('text=[STACK]');
    await expect(page.getByRole('heading', { name: 'HOW THIS SITE WORKS' })).toBeVisible();
    await expect(page).toHaveURL('/how-this-site-works');
  });

  test('toggles between light and dark modes', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('data-theme', 'light');

    // Switch to dark mode
    await page.click('button[aria-label*="dark"]');
    await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  });
});
```

---

## Why Keep Unit Tests in `happy-dom` while E2E runs in Playwright?

A common question is: *"Why not run unit tests inside Playwright as well?"*

1. **Speed & Efficiency**:
   `happy-dom` executes unit tests in sub-seconds. If all 22 unit tests ran inside real Playwright browser contexts, test suite execution times would balloon from 1.5 seconds to 15+ seconds.
2. **Clear Responsibility Split**:
   - **`npm test` (Vitest + happy-dom)**: Developer inner feedback loop (runs on every file save).
   - **`npm run test:e2e` (Playwright)**: Pre-commit / CI deployment validation ensuring browser compatibility.

---

## Visual E2E Debugging: Headed Mode & Playwright UI Runner

Playwright provides built-in tools for visual debugging:

### 1. Headed Mode (`npm run test:e2e:headed`)

Runs tests inside an open, visible Chrome browser window:
```bash
npm run test:e2e:headed
```

### 2. Interactive Playwright UI Runner (`npm run test:e2e:ui`)

Launches Playwright's visual dashboard with time-travel snapshots, DOM inspection, and step-by-step test execution:
```bash
npm run test:e2e:ui
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Conclusion

Combining **Vitest for fast in-memory unit testing** with **Playwright for real browser E2E verification** creates a comprehensive, resilient testing pipeline that catches bugs instantly while ensuring end-user browser functionality.
