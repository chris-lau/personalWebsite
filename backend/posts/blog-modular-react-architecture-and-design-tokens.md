# Building a Scalable React Architecture: Design Tokens, Global State, and Type Contracts

*A step-by-step developer's guide to building modular, themable web applications with React, TypeScript, and CSS Custom Properties.*

> **TL;DR**: Build scalable themable React apps by decoupling design tokens into CSS variables (`:root` for light, `[data-theme="dark"]` for dark), managing mode persistence in React `ThemeContext`, enforcing TypeScript data contracts for data layers, and wrapping page content in presentation components (`Section`, `BoxContainer`).

---


## Table of Contents
1. [Introduction](#introduction)
2. [The Core Problem: Tight Coupling](#the-core-problem-tight-coupling)
3. [Design Tokens: CSS Custom Properties & Theme Swapping](#design-tokens-css-custom-properties--theme-swapping)
4. [State Architecture: Local State vs. React Global Context](#state-architecture-local-state-vs-react-global-context)
5. [TypeScript Data Contracts & Interfaces](#typescript-data-contracts--interfaces)
6. [Component Wrappers: Decoupling Page Content from Presentation](#component-wrappers-decoupling-page-content-from-presentation)
7. [How to Restyle the Site or Add a New Mode](#how-to-restyle-the-site-or-add-a-new-mode)
8. [Conclusion](#conclusion)

---

## Introduction

When building a modern web application, beginner developers often fall into a common architectural trap: **coupling visual styling tightly with core data and page logic**.

What happens when you decide to change your site's aesthetic from a warm earthy look to a glassmorphism design—or flip every surface between light and dark mode? If your colors, borders, and fonts are hardcoded inside components, you end up having to rewrite dozens of files across your entire project.

In this tutorial, we will explore how to architect a production-ready personal portfolio in **React 18** and **TypeScript** that makes theme-swapping painless. 

We will answer 4 fundamental architectural questions:
1. **How do Design Tokens work, and why do they decouple styling from components?**
2. **What is the difference between Local Component State and React Global State (`Context`)?**
3. **Why do we define TypeScript interfaces for our data before building UI components?**
4. **How do presentation wrappers allow adding new site layouts without touching page logic?**

---

## The Core Problem: Tight Coupling

Consider a typical React component where hex colors and inline styling are hardcoded:

```tsx
// ❌ HARDCODED & TIGHTLY COUPLED
export function ProjectCard({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ backgroundColor: '#181616', color: '#e8d8b8', border: '1px solid #7a9a60' }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

If you have 30 components built like this and want to introduce a dark/light mode toggle or a retro green CLI theme, you have to find and replace every instance of `#181616` and `#7a9a60`. 

Instead, we need **Design Tokens**.

---

## Design Tokens: CSS Custom Properties & Theme Swapping

### What is a Design Token?

A **design token** is a named variable that stores a single visual decision—such as a color, font family, border radius, or spacing amount—instead of hardcoding raw values.

In our project, design tokens are stored as **CSS Custom Properties** inside [`src/styles/variables.css`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/styles/variables.css):

```css
/* Mode 1: Light Crisp (light) — the default at :root */
:root {
  --bg-primary: #ffffff;          /* White ground */
  --bg-secondary: #fafafa;        /* Sunken surface */
  --text-primary: #0a0a0a;        /* Near-black ink */
  --text-muted: #475467;          /* WCAG AA muted gray */
  --accent-primary: #175cd3;      /* Single restrained blue */
  --border-color: #d0d5dd;        /* Gray hairlines */
  --radius-md: 8px;               /* Button corner radius */
  --container-max-width: 1040px;
}

/* Mode 2: Light Crisp Dark — one block flips the whole site */
[data-theme="dark"] {
  --bg-primary: #101013;
  --bg-secondary: #16181c;
  --text-primary: #f4f5f7;
  --text-muted: #9aa1ad;
  --accent-primary: #7cb0ff;
  --border-color: rgba(255, 255, 255, 0.16);
}
```

### Why components love Design Tokens:

Components write `var(--bg-primary)` and `var(--text-primary)` instead of raw colors:

```css
/* src/styles/global.css */
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-family);
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

When a user switches modes, changing the top-level HTML attribute `<html data-theme="dark">` instantly updates the color palette of every single component across the entire website!

---

## State Architecture: Local State vs. React Global Context

In React, **State** represents data that changes over time and triggers re-renders when updated.

### Local State vs. Global State:
- **Local State** (`useState` inside a single component): Belongs exclusively to one component. *Example*: A dropdown knowing whether it is currently open or closed.
- **Global State**: Accessible by **any component on any page**. *Example*: The currently active mode (`'light'` vs `'dark'`).

### Implementing Global Theme Context (`ThemeContext.tsx`)

Without a global state manager, if a user clicks the light/dark toggle button in the navigation header, the rest of the page won't know the mode changed. 

We implement [`ThemeContext.tsx`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/context/ThemeContext.tsx) using React Context to manage and persist theme state globally:

```tsx
// src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode } from '../types/theme';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'portfolio_theme';
const VALID_THEMES: ThemeMode[] = ['light', 'dark'];
/** Legacy layout-theme values from before the Light Crisp consolidation. */
const LEGACY_THEMES = ['modern', 'ascii', 'cli'];

const readInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved as ThemeMode)) return saved as ThemeMode;
    if (saved && LEGACY_THEMES.includes(saved)) return 'light';
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return 'light';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Sync DOM data-theme attribute whenever theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
```

---

## TypeScript Data Contracts & Interfaces

Before creating UI components or writing data objects, we define strict TypeScript **interfaces** in [`src/types/portfolio.ts`](file:///Users/chrislau/Documents/personalWebsite/frontend/src/types/portfolio.ts).

A TypeScript interface acts as a **contract or blueprint** that specifies the exact shape and types an object must have:

```typescript
// src/types/portfolio.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  isFeatured: boolean;
}
```

### Why define interfaces first? (3 Key Benefits):
1. **Compile-Time Safety**: If you misspell `description` as `descripion` in your data file, TypeScript immediately catches the bug before your code ever runs.
2. **Editor Autocomplete**: As soon as you type `project.`, your code editor displays instant autocompletion for all valid properties.
3. **Data Independence**: Data objects stored in `src/data/projects.ts` remain pure static JavaScript objects with zero HTML markup or styling logic attached.

---

## Component Wrappers: Decoupling Page Content from Presentation

To keep page content independent of presentation structure, we use presentation wrappers.

Instead of writing section-heading markup (index chips, hairline rules) directly inside page components, we create a reusable `<Section>` container:

```tsx
// src/components/ui/Section.tsx
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

Then, a central `<LayoutRenderer>` component wraps page routes with the site chrome (header, navigation, footer):

```tsx
// src/components/layout/LayoutRenderer.tsx
import { ReactNode } from 'react';
import { ModernLayout } from './ModernLayout';

/** Single-layout site since the Light Crisp consolidation; kept as a seam
 *  so pages never render outside the site chrome. */
export const LayoutRenderer = ({ children }: LayoutRendererProps) => (
  <ModernLayout>{children}</ModernLayout>
);
```

An earlier iteration of this site shipped three full layout themes (`AsciiLayout`, `CliLayout`, `ModernLayout`) selected by `ThemeContext`. The lesson learned: three layouts tripled the QA surface and drifted apart visually. The consolidation kept the wrapper seam but collapsed it to one layout — pages never noticed the change.

---

## How to Restyle the Site or Add a New Mode

Because of this decoupled architecture, restyling is a **one-file change**, and adding a new color mode (e.g. `'contrast'`) touches **2 files + 1 list**:

1. **`src/styles/variables.css`**: To *restyle*, edit token values in `:root` — every component updates automatically. To *add a mode*, duplicate the token block under a new selector:
   ```css
   [data-theme="contrast"] {
     --bg-primary: #000000;
     --text-primary: #ffffff;
     /* ... */
   }
   ```
2. **`src/types/theme.ts`**: Extend the TypeScript union type:
   ```typescript
   export type ThemeMode = 'light' | 'dark' | 'contrast';
   ```
3. **`src/context/ThemeContext.tsx`**: Add `'contrast'` to `VALID_THEMES` so persistence accepts it, and wire it into the toggle.

**Zero data files, page routes, or page component code need to be changed!**

---

## Conclusion

By combining **CSS Design Tokens**, **React Context Global State**, **TypeScript Data Contracts**, and **Presentation Layout Wrappers**, we achieved a modular frontend architecture that is scalable, type-safe, accessible, and easily themeable.

Happy coding!
