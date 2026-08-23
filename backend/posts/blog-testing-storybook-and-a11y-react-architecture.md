# Modern Frontend Development: Component Architecture, Storybook, Accessibility, and Testing

*A beginner-to-intermediate guide to building a modular React application with TypeScript, Storybook, Vitest, Playwright, and WCAG accessibility standards.*

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [What is React-Specific Code?](#2-what-is-react-specific-code)
3. [Building Presentation Wrappers](#3-building-presentation-wrappers)
4. [Component Workshop: What is Storybook & How Does it Work?](#4-component-workshop-what-is-storybook--how-does-it-work)
5. [Automated Testing: Vitest vs. Playwright](#5-automated-testing-vitest-vs-playwright)
6. [Why Colocation (Colocating Stories & Tests) Matters](#6-why-colocation-colocating-stories--tests-matters)
7. [Accessibility (a11y): Making Decorative UI Inclusive](#7-accessibility-a11y-making-decorative-ui-inclusive)
8. [Conclusion & Takeaways](#8-conclusion--takeaways)

---

## 1. Introduction

When building a modern web application, one of the biggest challenges for developers is structuring code so it remains clean, testable, and maintainable. 

In this article, we’ll explore how we built a token-driven website with a single Light Crisp design system rendered in **light and dark modes**. We'll cover fundamental React concepts, how to isolate component previews with **Storybook**, how to write fast unit tests with **Vitest**, how to perform end-to-end browser testing with **Playwright**, and how to ensure custom interfaces remain **100% accessible (a11y)** to screen reader users.

---

## 2. What is React-Specific Code?

A common question from developers transitioning to React is: *“Which parts of the code are plain TypeScript/JavaScript, and which parts are React-specific?”*

Let's look at a concrete component from our portfolio project:

```tsx
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  );
};
```

### Breakdown:

| Code Element | Is it React-Specific? | Explanation |
| :--- | :--- | :--- |
| `import React from 'react'` | **React-Specific** | Imports the React runtime and TypeScript definitions. |
| `React.FC` | **React-Specific** | Short for `React.FunctionComponent`. Tells TypeScript that this function returns React UI elements. |
| `React.ReactNode` | **React-Specific** | A React type representing anything React can render (elements, text, strings, nested children). |
| `useTheme()` | **React-Specific** | React Hook. Functions starting with `use` allow components to subscribe to state or context. |
| `<button className="...">` | **React-Specific (JSX)** | HTML-like markup in JS (`.tsx`). `className` is used instead of standard HTML `class`. |
| `onClick={toggleTheme}` | **React-Specific** | React synthetic event handler syntax for listening to click events. |
| `theme === 'dark' ? ...` | **Plain JavaScript/TypeScript** | Standard ternary operator for conditional logic. |

---

## 3. Building Presentation Wrappers

To keep page content independent of presentation structure — and to restyle the whole site without touching page components — we decoupled our UI into presentation wrapper components:

### The Open Section Wrapper (`Section.tsx`)

```tsx
import { ReactNode } from 'react';
import './Section.css';

interface SectionProps {
  title: string;
  /** Optional mono index chip (e.g. '01') shown before the title. */
  index?: string;
  /** Renders the section as a full-width tinted band (homepage rhythm). */
  tint?: boolean;
  children: ReactNode;
}

export const Section = ({ title, index, tint = false, children }: SectionProps) => (
  <section className={`page-section ${tint ? 'page-section--tint' : ''}`}>
    <div className="page-section__head">
      {index && <span className="page-section__index" aria-hidden="true">{index}</span>}
      <h2 className="page-section__title">{title}</h2>
      <span className="page-section__rule" aria-hidden="true" />
    </div>
    <div className="page-section__body">{children}</div>
  </section>
);
```

Operational surfaces (the chat widget, the monitoring dashboard) use a sibling wrapper, `BoxContainer` — a flat panel for things you *operate*, while `Section` frames things you *read*.

---

## 4. Component Workshop: What is Storybook & How Does it Work?

When developing components, running the entire web application and navigating through pages every time you want to tweak a button or container box is slow. 

### What is Storybook?
**Storybook** is an isolated component workshop that runs on its own local port (`http://localhost:6006`). It allows developers to render and visually inspect UI components in isolation without launching the full web app.

### Specifying Ports & Scripts
Port `6006` is defined in `package.json` under npm scripts:
```json
"scripts": {
  "dev": "vite",
  "storybook": "storybook dev -p 6006"
}
```

### Writing Stories (`BoxContainer.stories.tsx` & `BlogCard.stories.tsx`)
```tsx
// frontend/src/components/ui/BoxContainer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BoxContainer } from './BoxContainer';

const meta: Meta<typeof BoxContainer> = {
  title: 'UI/BoxContainer',
  component: BoxContainer,
};
```

---

## 5. Automated Testing: Vitest vs. Playwright

A common point of confusion is understanding the roles of **Vitest**, **Testing Library**, and **Playwright**:

```
┌─────────────────────────────────────────────────────────┐
│                       Vitest                            │
│                 (The Test Runner & Manager)              │
└───────────────────────────┬─────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  React Testing Library             Playwright
 (Component & DOM Logic)       (Real Browser Engine)
   Environment: happy-dom       Chromium / WebKit / Firefox
```

### 1. Vitest (The Test Runner)
Vitest executes your test files, manages assertions (`expect(x).toBe(y)`), and outputs test results.

### 2. React Testing Library (`@testing-library/react`)
Provides methods like `render()`, `screen.getByText()`, and `fireEvent.click()` to test component behavior as a user sees it.

Here is how we test our `<ThemeToggle />` component:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

describe('ThemeToggle Component', () => {
  it('renders correctly and toggles theme state', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });

    // Click to toggle state
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });
});
```

### 3. Playwright (Real Browser End-to-End Testing)
While Vitest + `happy-dom` tests individual components in node memory, **Playwright** launches real headless browser windows to test complete end-to-end user flows (such as clicking page routes or verifying theme persistence across reloads).

---

## 6. Why Colocation (Colocating Stories & Tests) Matters

Notice how our file structure organizes files:

```text
src/components/ui/
├── BoxContainer.tsx          <-- Component logic
├── BoxContainer.css          <-- Styles
├── BoxContainer.stories.tsx  <-- Visual Storybook preview
└── BoxContainer.test.tsx     <-- Automated unit test
```

### Benefits of Colocation:
* **High Discoverability**: Everything required to understand, style, preview, and test a component is in one folder.
* **Refactor Safety**: When you move or delete a component, you don't leave orphaned test files in a distant `src/__tests__/` directory.

---

## 7. Accessibility (a11y): Making Decorative UI Inclusive

Decorative interface elements (section index chips like `01`, hairline rules, icon-only buttons) look great visually, but can cause major problems for screen readers if not handled properly.

### 1. Screen Reader Utility Class (`.sr-only`)
We hide purely visual decorations from screen readers using `aria-hidden="true"`, while providing real accessible names and hidden descriptive text for screen readers:

```css
/* Screen Reader Only Utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 2. Hiding Decorative Chrome
```tsx
{/* The index chip and hairline rule are decoration — hidden from screen readers */}
<span className="page-section__index" aria-hidden="true">01</span>
<h2 className="page-section__title">FEATURED WORK</h2>
<span className="page-section__rule" aria-hidden="true" />

{/* Icon-only buttons carry an aria-label instead of visible text */}
<button aria-label="Switch to dark mode" onClick={toggleTheme}>
  <Moon size={16} aria-hidden="true" />
</button>
```

### 3. Keyboard Focus Indicators
Ensure clear keyboard focus outlines so keyboard-only users can navigate controls:

```css
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}
```

---

## 8. Conclusion & Takeaways

By following these architecture principles:
1. **Decouple visual presentation** using layout wrappers.
2. **Use Storybook** for isolated component development.
3. **Write resilient component tests** using Vitest + React Testing Library.
4. **Colocate component files, stories, and tests** in the same directory.
5. **Enforce accessibility (a11y)** using `aria-hidden`, accessible names, and `.sr-only` text.

You create a codebase that is scalable, easy to test, and enjoyable to build upon!
