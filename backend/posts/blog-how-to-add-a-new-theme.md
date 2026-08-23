# Retheming a React & TypeScript App: Design Tokens, One Layout, and Dark Mode

This site began life with **three novelty themes** — a Warm Earthy ASCII look, a Retro Terminal CLI, and a Modern Editorial skin — precisely so I would be forced to learn token-driven CSS. It has since been consolidated into **one design system** (Light Crisp) rendered in **light and dark modes**, and the consolidation itself became the best argument for the architecture: swapping the entire visual identity of the site touched exactly one CSS file.

In this guide, I'll walk through how the current theming system works and what it takes to either **restyle the whole site** or **add a new color mode** — with real code from this repository.

> **TL;DR**: Restyling is a one-file change: every visual decision is a CSS custom property in `variables.css` (`:root` holds the light palette, one `[data-theme="dark"]` block flips the whole site). Adding a new mode means duplicating that block under a new selector, extending the `ThemeMode` union type, and adding the value to `VALID_THEMES` in `ThemeContext`. There is exactly **one layout** — no per-theme components exist anymore.

---

## Why Our Architecture Makes Restyling Effortless

Before diving into code, let's examine the pillars that make theme changes cheap:

### 1. Semantic CSS Design Tokens (`variables.css`)
UI components never hardcode HEX colors, radii, or font names. They consume semantic CSS variables like `var(--bg-primary)`, `var(--text-primary)`, `var(--accent-primary)`, and `var(--radius-md)`. A restyle is therefore an edit to token *values*, not to components.

### 2. One Token Block Per Mode
The light palette lives at `:root`; the dark palette lives in a single `[data-theme="dark"]` block. Flipping the mode flips every token at once — no per-component dark styles, no `dark:` prefixes scattered through the codebase.

### 3. Single Source of Truth Theme Context (`ThemeContext.tsx`)
A centralized React Context broadcasts the mode app-wide, persists it to `localStorage`, and applies `data-theme` to `document.documentElement`. Visitors who saved a legacy value from the three-theme era (`'modern'`, `'ascii'`, `'cli'`) are migrated to `'light'` automatically.

### 4. One Layout, Shared Editorial Grammar
There is no `AsciiLayout` or `CliLayout` anymore. A single `ModernLayout` (rendered through the `LayoutRenderer` seam) frames every page, and content follows one grammar — numbered `Section` heads and `work-row` lists — so a restyle never has to be applied page-by-page.

---

## The Token File: `src/styles/variables.css`

This is the only file that decides what the site looks like:

```css
:root {
  /* Surfaces — Light Crisp: white ground, gray hairlines */
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #0a0a0a;
  --text-muted: #475467; /* 5.8:1 on white — WCAG AA */

  /* Accent — restrained: one blue, near-black fills */
  --accent-primary: #175cd3;
  --border-color: #d0d5dd;
  --border-muted: #e4e7ec;

  /* Typography & shape */
  --font-family: 'Inter', -apple-system, sans-serif;
  --radius-chip: 6px;  /* badges, tags, chips — chip shape sitewide */
  --radius-md: 8px;    /* buttons */

  --container-max-width: 1040px;
}

/* Dark variant — Light Crisp Dark. One block flips the whole site;
   every component reads tokens only. */
[data-theme="dark"] {
  --bg-primary: #101013;
  --bg-secondary: #16181c;
  --text-primary: #f4f5f7;
  --text-muted: #9aa1ad;
  --accent-primary: #7cb0ff;
  --border-color: rgba(255, 255, 255, 0.16);
  --border-muted: rgba(255, 255, 255, 0.09);
}
```

Because components only reference token *names*, updating values here instantly restyles the entire site — backgrounds, text, links, chips, buttons, hairlines, shadows, all of it.

Shape is controlled the same way: want rounder chips everywhere? Change `--radius-chip` in one place. This is what "make sure the styling can be updated easily" looks like in practice.

---

## The State Layer: `src/context/ThemeContext.tsx`

```typescript
// src/types/theme.ts
export type ThemeMode = 'light' | 'dark';
```

```typescript
// src/context/ThemeContext.tsx (essentials)
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

const toggleTheme = () => {
  setTheme(theme === 'light' ? 'dark' : 'light');
};

// Sync DOM data-theme attribute whenever theme state changes
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

The header renders a single Sun/Moon button (`ThemeToggle.tsx`) whose accessible name flips with the mode: `Switch to dark mode` / `Switch to light mode`.

---

## How to Restyle the Whole Site

1. Open `src/styles/variables.css`.
2. Edit token values in `:root` (and the dark block if you want the dark mode to move with the new identity).
3. Done. No component, page, or data file changes.

That is the entire procedure that was used for the Light Crisp reskin of this site — white ground, near-black ink, gray hairlines, a single restrained blue — which replaced the previous zinc-and-indigo skin by touching values, not structure.

## How to Add a New Color Mode

If you want a third mode (say, a high-contrast `'contrast'`), the change is three small edits:

1. **`src/styles/variables.css`** — duplicate the token block under a new selector:
   ```css
   [data-theme="contrast"] {
     --bg-primary: #000000;
     --text-primary: #ffffff;
     /* ... */
   }
   ```
2. **`src/types/theme.ts`** — extend the union:
   ```typescript
   export type ThemeMode = 'light' | 'dark' | 'contrast';
   ```
3. **`src/context/ThemeContext.tsx`** — add `'contrast'` to `VALID_THEMES` so persistence accepts it, and wire it into the toggle control.

TypeScript enforces the rest: any switch statement or localStorage read that misses the new value fails to compile.

---

## Verify & Test End-to-End

The theme contract is pinned by a Playwright test that asserts the `data-theme` attribute on `<html>`:

```typescript
// e2e/portfolio.spec.ts
test('toggles between light and dark modes', async ({ page }) => {
  await page.goto('/');

  // First visit defaults to light.
  const htmlElement = page.locator('html');
  await expect(htmlElement).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.modern-layout-container')).toBeVisible();

  // Toggle to dark — same layout, dark token set.
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.modern-layout-container')).toBeVisible();

  // And back to light.
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(htmlElement).toHaveAttribute('data-theme', 'light');
});
```

Note what the test asserts about the architecture: the layout container is identical in both modes. Only the tokens change.

---

## Conclusion

The three-theme experiment taught the lesson the hard way: every additional layout multiplied the QA surface (three sets of e2e assertions, three sets of layout CSS, drift between skins). The consolidated architecture — **semantic tokens, one block per mode, one layout, type-safe mode union** — delivers the same flexibility with a fraction of the surface. Restyling the site is now a one-file change, and adding a mode is three small edits with compiler-enforced completeness.

That's the real payoff of design tokens: not the ability to have many themes, but the ability to *change your mind* cheaply.
