# How to Add a New Theme to a Modern React & TypeScript App: Design Tokens, Layouts, and Context

In modern web development, supporting flexible user themes—whether retro ASCII terminals, sleek dark modes, or editorial designs inspired by Anthropic and OpenAI—requires a clean, scalable architecture.

When designed correctly, adding an entirely new visual theme should take **minutes rather than days**, without refactoring existing page components or duplicating React code.

In this guide, we'll explore how our application's modular architecture makes theme expansion effortless, and walk through the exact steps to add a **Modern Editorial** theme alongside existing **ASCII Retro** and **CLI Terminal** themes.

---

## Why Our Architecture Makes Adding Themes Effortless

Before diving into code, let's examine the key architectural pillars that enable friction-free theme expansion:

### 1. Decoupled Data & Presentation Layers
Static data (`profile.ts`, `projects.ts`, `experience.ts`, `skills.ts`) is stored as pure TypeScript objects completely independent of UI components or formatting. Adding or tweaking a theme never requires touching your data layer.

### 2. Semantic CSS Design Tokens (`variables.css`)
UI components never hardcode HEX colors or specific font names. Instead, components consume semantic CSS variables like `var(--bg-primary)`, `var(--text-primary)`, `var(--font-family)`, and `var(--accent-primary)`. Creating a new theme is as simple as scoping new variables under a `[data-theme="theme-name"]` selector.

### 3. Single Source of Truth Theme Context (`ThemeContext.tsx`)
A centralized React Context broadcasts theme state app-wide and applies `data-theme` to `document.documentElement`. Any component or stylesheet automatically inherits the active theme without prop-drilling.

### 4. Layout Abstraction Layer (`LayoutRenderer.tsx`)
High-level layout shells (`AsciiLayout`, `CliLayout`, `ModernLayout`) manage structural chrome (headers, footers, navigation bars), allowing individual page components (`HomePage`, `ProjectsPage`, `BlogListPage`) to remain 100% theme-agnostic.

---

## Step-by-Step: Adding the 'Modern Editorial' Theme

### Step 1: Type Safety First — Define Theme Union Types

Add the new theme name to your central type definition (`src/types/theme.ts`):

```typescript
// src/types/theme.ts
export type ThemeMode = 'ascii' | 'cli' | 'modern';
```

Adding `'modern'` to the union type ensures TypeScript immediately enforces type checking across React Context, localStorage persistence, and theme toggling buttons.

---

### Step 2: Declare CSS Design Tokens & Typography

Map your theme's visual tokens (colors, font stacks, container widths, card backgrounds) to `[data-theme="modern"]` in `src/styles/variables.css`:

```css
/* Theme 3: Modern Editorial (Anthropic & OpenAI Inspired) */
[data-theme="modern"] {
  --bg-primary: #121316;
  --bg-secondary: #1a1b20;
  --bg-card: rgba(28, 30, 36, 0.7);
  --text-primary: #f4f4f6;
  --text-muted: #a1a1aa;
  
  --header-color: #f4f4f6;
  --accent-primary: #f4ab6a;   /* Warm Amber Glow */
  --accent-secondary: #a78bfa; /* Soft Lavender Glow */

  --border-color: rgba(255, 255, 255, 0.15);
  --border-muted: rgba(255, 255, 255, 0.08);
  
  --font-family: 'Inter', -apple-system, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, serif;
  --container-max-width: 1040px;
}
```

Because your components already consume these CSS variable names, updating `variables.css` instantly updates 80% of your site's visual appearance!

---

### Step 3: Manage Theme State with React Context & LocalStorage

Update your `ThemeContext` provider to handle saved theme validation and n-way theme cycling:

```typescript
// src/context/ThemeContext.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('portfolio_theme') as ThemeMode;
    return saved === 'cli' || saved === 'modern' ? saved : 'ascii';
  });

  const toggleTheme = () => {
    if (theme === 'ascii') setThemeState('cli');
    else if (theme === 'cli') setThemeState('modern');
    else setThemeState('ascii');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

### Step 4: Component Overrides via CSS Selectors

Instead of writing new React components for existing UI elements, leverage CSS attribute selectors (`[data-theme="modern"] .component`) to adapt existing React UI components dynamically:

```css
/* Clean editorial heading & container override for BoxContainer */
[data-theme="modern"] .box-container {
  border-radius: 16px;
  border: 1px solid var(--border-muted);
  background: var(--bg-card);
  padding: 1.75rem 2rem;
}

[data-theme="modern"] .ascii-box-header-row,
[data-theme="modern"] .ascii-box-footer-row {
  display: none; /* Hide retro ASCII lines */
}

[data-theme="modern"] .box-section-heading {
  font-family: var(--font-serif);
  font-size: 1.85rem;
  color: var(--header-color);
  border-bottom: 1px solid var(--border-muted);
}
```

---

### Step 5: Verify & Test End-to-End

Finally, add unit tests in Vitest and E2E tests in Playwright to verify state toggles and theme layout rendering:

```typescript
test('toggles theme between ASCII, CLI, and MODERN modes', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');

  await page.click('button[aria-label*="Switch to CLI theme"]');
  await expect(html).toHaveAttribute('data-theme', 'cli');

  await page.click('button[aria-label*="Switch to MODERN theme"]');
  await expect(html).toHaveAttribute('data-theme', 'modern');
  await expect(page.locator('.modern-layout-container')).toBeVisible();
});
```

---

## Conclusion

By enforcing **type safety**, **semantic design tokens**, **centralized Context**, and **modular layout renderers**, adding a new visual design becomes a predictable, clean process. 

This architecture allows developers to experiment with radical design variations—from retro terminals to high-end editorial layouts—without accumulating technical debt or breaking existing features!
