# Modern Frontend Development: Component Architecture, Storybook, Accessibility, and Testing

*A beginner-to-intermediate guide to building a modular, multi-theme React application with TypeScript, Storybook, Vitest, Playwright, and WCAG accessibility standards.*

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [What is React-Specific Code?](#2-what-is-react-specific-code)
3. [Building Presentation Wrappers & Theme Layouts](#3-building-presentation-wrappers--theme-layouts)
4. [Component Workshop: What is Storybook & How Does it Work?](#4-component-workshop-what-is-storybook--how-does-it-work)
5. [Automated Testing: Vitest vs. Playwright](#5-automated-testing-vitest-vs-playwright)
6. [Why Colocation (Colocating Stories & Tests) Matters](#6-why-colocation-colocating-stories--tests-matters)
7. [Accessibility (a11y): Making Retro UI Inclusive](#7-accessibility-a11y-making-retro-ui-inclusive)
8. [Conclusion & Takeaways](#8-conclusion--takeaways)

---

## 1. Introduction

When building a modern web application, one of the biggest challenges for developers is structuring code so it remains clean, testable, and maintainable. 

In this article, we’ll explore how we built a multi-theme website supporting **Modern Editorial Design**, **Warm Earthy ASCII Art Design**, and **Retro Terminal CLI Design**. We'll cover fundamental React concepts, how to isolate component previews with **Storybook**, how to write fast unit tests with **Vitest**, how to perform end-to-end browser testing with **Playwright**, and how to ensure custom interfaces remain **100% accessible (a11y)** to screen reader users.

---

## 2. What is React-Specific Code?

A common question from developers transitioning to React is: *“Which parts of the code are plain TypeScript/JavaScript, and which parts are React-specific?”*

Let's look at a concrete component from our portfolio project:

```tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'ascii' ? 'cli' : 'ascii';

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${nextTheme.toUpperCase()} theme`}
      aria-pressed={theme === 'cli'}
      type="button"
    >
      <span aria-hidden="true">[ MODE: {theme.toUpperCase()} ]</span>
      <span className="sr-only">Current theme is {theme}. Click to switch to {nextTheme}.</span>
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
| `theme === 'ascii' ? ...` | **Plain JavaScript/TypeScript** | Standard ternary operator for conditional logic. |

---

## 3. Building Presentation Wrappers & Theme Layouts

To support switching between an **ASCII Box** layout and a **Retro Terminal CLI** layout without rewriting our page content, we decoupled our UI into presentation wrapper components:

### The ASCII Box Wrapper (`AsciiBox.tsx`)

```tsx
import React from 'react';
import './AsciiBox.css';

export interface AsciiBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'single' | 'double';
}

export const AsciiBox: React.FC<AsciiBoxProps> = ({ title, children, variant = 'single' }) => {
  const borderChar = variant === 'double' ? '=' : '-';

  return (
    <div className={`ascii-box ascii-box-${variant}`}>
      <div className="ascii-box-header-row" aria-hidden="true">
        <span className="corner">+</span>
        {title ? (
          <>
            <span className="border-line">--</span>
            <span className="box-title">[ {title} ]</span>
            <span className="border-line flex-fill">{borderChar}</span>
          </>
        ) : (
          <span className="border-line flex-fill">{borderChar}</span>
        )}
        <span className="corner">+</span>
      </div>

      {/* Screen reader fallback heading */}
      {title && <h3 className="sr-only">{title}</h3>}

      <div className="ascii-box-content">{children}</div>

      <div className="ascii-box-footer-row" aria-hidden="true">
        <span className="corner">+</span>
        <span className="border-line flex-fill">{borderChar}</span>
        <span className="corner">+</span>
      </div>
    </div>
  );
};
```

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

### Writing Stories (`AsciiBox.stories.tsx` & `BlogCard.stories.tsx`)
```tsx
// frontend/src/components/ui/AsciiBox.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AsciiBox } from './AsciiBox';

const meta: Meta<typeof AsciiBox> = {
  title: 'UI/AsciiBox',
  component: AsciiBox,
  args: {
    title: 'Featured Projects',
    children: 'This box includes a title embedded in the top ASCII border line.',
  },
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

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('[ MODE: ASCII ]');

    // Click to toggle state
    fireEvent.click(button);
    expect(button.textContent).toContain('[ MODE: CLI ]');
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
├── AsciiBox.tsx          <-- Component logic
├── AsciiBox.css          <-- Styles
├── AsciiBox.stories.tsx  <-- Visual Storybook preview
└── AsciiBox.test.tsx     <-- Automated unit test
```

### Benefits of Colocation:
* **High Discoverability**: Everything required to understand, style, preview, and test a component is in one folder.
* **Refactor Safety**: When you move or delete a component, you don't leave orphaned test files in a distant `src/__tests__/` directory.

---

## 7. Accessibility (a11y): Making Retro UI Inclusive

Retro interfaces (ASCII borders like `+-----+`, terminal prompts like `$`, cursor blinks) look great visually, but can cause major problems for screen readers if not handled properly.

### 1. Screen Reader Utility Class (`.sr-only`)
We hide visual ASCII decorations from screen readers using `aria-hidden="true"`, while providing hidden descriptive text for screen readers:

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

### 2. Hiding Visual ASCII Decoration
```tsx
{/* Hides pure decorative ASCII characters from screen readers */}
<div className="ascii-box-header-row" aria-hidden="true">
  +-----------------------+
</div>

{/* Provides clean screen-reader accessible heading */}
<h3 className="sr-only">Featured Projects</h3>
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
5. **Enforce accessibility (a11y)** using `aria-hidden` and `.sr-only` text.

You create a codebase that is scalable, easy to test, and enjoyable to build upon!
