# Building a Scalable React Architecture: Design Tokens, Global State, and Type Contracts

*A step-by-step developer's guide to building modular, multi-theme web applications with React, TypeScript, and CSS Custom Properties.*

> **TL;DR**: Build scalable multi-theme React apps by decoupling design tokens into CSS variables (`[data-theme]`), managing theme persistence in React `ThemeContext`, enforcing TypeScript data contracts for data layers, and wrapping pages in layout components (`AsciiLayout`, `CliLayout`, `ModernLayout`).

---


## Table of Contents
1. [Introduction](#introduction)
2. [The Core Problem: Tight Coupling](#the-core-problem-tight-coupling)
3. [Design Tokens: CSS Custom Properties & Theme Swapping](#design-tokens-css-custom-properties--theme-swapping)
4. [State Architecture: Local State vs. React Global Context](#state-architecture-local-state-vs-react-global-context)
5. [TypeScript Data Contracts & Interfaces](#typescript-data-contracts--interfaces)
6. [Component Wrappers: Decoupling Page Content from Presentation](#component-wrappers-decoupling-page-content-from-presentation)
7. [How to Add a New Theme in 3 Easy Steps](#how-to-add-a-new-theme-in-3-easy-steps)
8. [Conclusion](#conclusion)

---

## Introduction

When building a modern web application, beginner developers often fall into a common architectural trap: **coupling visual styling tightly with core data and page logic**.

What happens when you decide to change your site's aesthetic from a **Warm Earthy ASCII Art** look to a **Retro Terminal CLI** interface or a **Modern Glassmorphism** design? If your colors, borders, and fonts are hardcoded inside components, you end up having to rewrite dozens of files across your entire project.

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
/* Theme 1: Warm Earthy ASCII Retro Terminal */
[data-theme="ascii"] {
  --bg-primary: #181616;          /* Matte espresso background */
  --bg-secondary: #222020;        /* Card container fill */
  --text-primary: #e8d8b8;        /* Warm parchment text */
  --accent-primary: #c86446;      /* Terracotta highlight */
  --accent-secondary: #7a9a60;    /* Sage green border */
  --font-family: 'JetBrains Mono', monospace;
  --container-max-width: 820px;
}

/* Theme 2: Retro Terminal CLI */
[data-theme="cli"] {
  --bg-primary: #0c0d10;          /* Deep terminal black background */
  --bg-secondary: #14161c;
  --text-primary: #ffb86c;        /* Warm amber phosphor text */
  --accent-primary: #f1fa8c;      /* Soft yellow prompt */
  --accent-secondary: #8be9fd;    /* Soft cyan command */
  --font-family: 'JetBrains Mono', monospace;
  --container-max-width: 900px;
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

When a user switches themes, changing the top-level HTML attribute `<html data-theme="cli">` instantly updates the color palette of every single component across the entire website!

---

## State Architecture: Local State vs. React Global Context

In React, **State** represents data that changes over time and triggers re-renders when updated.

### Local State vs. Global State:
- **Local State** (`useState` inside a single component): Belongs exclusively to one component. *Example*: A dropdown knowing whether it is currently open or closed.
- **Global State**: Accessible by **any component on any page**. *Example*: The currently active theme (`'ascii'` vs `'cli'`).

### Implementing Global Theme Context (`ThemeContext.tsx`)

Without a global state manager, if a user clicks `[ Switch Theme ]` in the navigation header, the rest of the page won't know the theme changed. 

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
const VALID_THEMES: ThemeMode[] = ['modern', 'ascii', 'cli'];
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Read saved theme preference from localStorage on startup with validation
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode;
    return VALID_THEMES.includes(savedTheme) ? savedTheme : 'modern';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'ascii' ? 'cli' : 'ascii');
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

To support both **Centered ASCII Box** and **Retro CLI Terminal** layouts, we use presentation wrappers.

Instead of writing ASCII border logic directly inside page components, we create a reusable `<AsciiBox>` container:

```tsx
// src/components/ui/AsciiBox.tsx
import React from 'react';

interface AsciiBoxProps {
  title?: string;
  children: React.ReactNode;
}

export const AsciiBox: React.FC<AsciiBoxProps> = ({ title, children }) => {
  return (
    <div className="ascii-box">
      {title && <div className="ascii-box-title">+---[ {title} ]---+</div>}
      <div className="ascii-box-content">{children}</div>
    </div>
  );
};
```

Then, a central `<LayoutRenderer>` component listens to `ThemeContext` and wraps page routes with the active layout:

```tsx
// src/components/layout/LayoutRenderer.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AsciiLayout } from './AsciiLayout';
import { CliLayout } from './CliLayout';

export const LayoutRenderer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  return theme === 'cli' ? (
    <CliLayout>{children}</CliLayout>
  ) : (
    <AsciiLayout>{children}</AsciiLayout>
  );
};
```

---

## How to Add a New Theme in 3 Easy Steps

Because of this decoupled architecture, if you want to add a 3rd layout in the future (e.g. `'glassmorphism'`), you only touch **3 files**:

1. **`src/types/theme.ts`**: Add `'glassmorphism'` to the TypeScript union type:
   ```typescript
   export type ThemeMode = 'ascii' | 'cli' | 'glassmorphism';
   ```
2. **`src/styles/variables.css`**: Define design tokens under `[data-theme="glassmorphism"]`.
3. **`src/components/layout/LayoutRenderer.tsx`**: Add a new case statement to render `<GlassLayout>{children}</GlassLayout>`.

**Zero data files, page routes, or core component code need to be changed!**

---

## Conclusion

By combining **CSS Design Tokens**, **React Context Global State**, **TypeScript Data Contracts**, and **Presentation Layout Wrappers**, we achieved a modular frontend architecture that is scalable, type-safe, accessible, and easily themeable.

Happy coding!
