# personalWebsite — Feedback

Review of [chris-lau/personalWebsite](https://github.com/chris-lau/personalWebsite), live at [chrislau.dev](https://chrislau.dev).

## Code Review

### Issues

**1. `navItems` defined inside the component** (`frontend/src/components/layout/ModernLayout.tsx`)

Recreated on every render since it's declared inside the functional component body. Move it to a module-level `const` outside `ModernLayout`.

**2. Theme validation duplicates the `ThemeMode` type** (`frontend/src/context/ThemeContext.tsx`)

```tsx
// current — theme names listed twice (once here, once in the ThemeMode type)
if (savedTheme === 'cli' || savedTheme === 'modern' || savedTheme === 'ascii') {
```

Extract to a constant array and use `.includes()`:

```tsx
const VALID_THEMES: ThemeMode[] = ['modern', 'ascii', 'cli'];
const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode;
return VALID_THEMES.includes(savedTheme) ? savedTheme : 'modern';
```

**3. `LayoutRenderer` if-else chain** (`frontend/src/components/layout/LayoutRenderer.tsx`)

Consider a lookup map instead of the if/else-if chain, so adding a new theme only touches one map rather than a branch:

```tsx
const LAYOUT_MAP: Record<ThemeMode, React.FC<{ children: React.ReactNode }>> = {
  ascii: AsciiLayout,
  cli: CliLayout,
  modern: ModernLayout,
};

export const LayoutRenderer: React.FC<LayoutRendererProps> = ({ children }) => {
  const { theme } = useTheme();
  const Layout = LAYOUT_MAP[theme] ?? ModernLayout;
  return <Layout>{children}</Layout>;
};
```

**4. Unnecessary `import React from 'react'`**

The project is on Vite + React 18 with the new JSX transform, so these imports (seen at the top of `App.tsx`, `ModernLayout.tsx`, etc.) are dead weight. Safe to remove across the codebase.

### Content

**5. `title` field is overloaded** (`frontend/src/data/profile.ts`)

```ts
title: 'Staff Product Manager, AI at Global Relay | CSPO, MBA, P.Eng. (Non-Practising)'
```

This renders as one dense line in the hero (`{profileData.title} • {profileData.location}`). Split into `title` (role only) and a separate `credentials` field so each theme/layout can decide how to present them.

**6. `avatarUrl: '/favicon.ico'`** looks like a placeholder standing in as a profile image. Either omit the field or set it to `null` so consuming code can render an intentional fallback.

### What's already good

- Skip-to-content link in `ModernLayout` — solid accessibility habit
- `rel="noopener noreferrer"` on all external links
- `end` prop on the root `NavLink` so it's not always marked active
- Theme persisted to `localStorage` with validation before use
- `useTheme` throws a clear error when used outside its provider

---

## UX / UI Review (live site, all three themes)

*Note: reviewed via accessibility tree + CSS tokens, not rendered screenshots (browser pane didn't composite frames in this session) — pixel-level polish (spacing rhythm, animation feel) wasn't verified.*

### Strengths

- **Consistent IA across all three themes.** Same regions, same nav destinations, same content — switching themes is a skin change, not a different site.
- **Distinct theme voices**, not just recolored: nav labels change per persona (`Projects` → `projects/` → `[PROJECTS]`).
- **High-contrast dark palettes** in all three themes — generally strong baseline readability.

### Issues

**1. Mobile nav has no clear affordance (biggest issue).**
At 375px width, the 8-item nav doesn't collapse into a hamburger/drawer:
- Modern theme: nav becomes horizontally scrollable with no visual cue (arrow, fade, scrollbar) that it scrolls.
- CLI theme: nav wraps to multiple lines, pushing content down below the fold.

A first-time mobile visitor has no signal that `Now`, `Stack`, `Contact` exist off-screen. Recommend a hamburger/drawer pattern or, at minimum, a scroll-fade indicator.

**2. Contact page doesn't function as a distinct destination.**
`/contact` shows the same two links (LinkedIn, GitHub) already on the homepage hero — no email, no form, no differentiation. For someone in a PM/recruiting-facing role, this is a missed conversion point. Even a `mailto:` link would help.

**3. Hero information density is high before any hierarchy kicks in.**
*"Staff Product Manager, AI at Global Relay | CSPO, MBA, P.Eng. (Non-Practising) • Greater Vancouver Metropolitan Area"* flattens job title, employer, three credentials, and location into one line — reads as a résumé header rather than a hook. Consider: name → one-line role → credentials as a smaller secondary line or tags.

**4. Skills snapshot is a wall of comma-separated text.**
Each category is a dense paragraph-like string, scannable to a machine but not to a human skimming for "does this person know X." Chip/pill styling (reusing the tech-tag pattern already built for Projects) would make this scannable.

**5. Possible content redundancy between Home and About/Experience** — not fully confirmed, but the homepage already carries bio, skills, and featured projects, which may duplicate what dedicated About/Experience/Projects pages exist to show.

**6. Theme toggle has no explanatory label on first load** — a first-time visitor may not immediately register that Modern/ASCII/CLI are themes rather than content filters.

### Accessibility

- Skip link and `aria-label="Main Navigation"` are already in place — good.
- Verify contrast on muted/secondary text tokens against their backgrounds — flagged as likely borderline for WCAG AA at small sizes:
  - ASCII theme muted text `#b8aa93` on background `#181616`
  - CLI theme slate blue `#8394ca` on background `#0c0d10`

### Suggested priority

1. Fix mobile nav discoverability
2. Give the Contact page a real reason to exist (email/form)
3. Convert skills list to tags/chips
4. Simplify hero subtitle hierarchy
