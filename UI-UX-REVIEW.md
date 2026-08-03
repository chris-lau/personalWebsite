# UI/UX Review & Assessment

**Date:** 2026-08-02
**Scope:** Frontend UI/UX review of all three themes (Modern / ASCII / CLI), navigation, design tokens, content rendering pipeline, and primary user journeys.
**Perspective:** UI/UX Subject-Matter Expert review.

---

## Summary

The site is a distinctive, well-differentiated three-theme portfolio with a genuinely thoughtful design language (editorial-modern default + two retro variants). The visual identity is strong. However, the **content surfaces — the pages that should demonstrate communication skill — are actively degraded** by a broken markdown pipeline, and the **information architecture over-hides primary destinations** behind dropdown menus.

These two issues dominate the review. Everything else is incremental polish.

| Severity | Count |
| :--- | :--- |
| 🔴 Critical (content/intent-breaking today) | 3 |
| 🟠 High — interaction & information architecture | 4 |
| 🟡 Medium — visual hierarchy & content | 5 |
| 🟢 Low — polish | 5 |

---

## 🔴 Critical Issues

### 1. Hand-rolled markdown renderer drops inline formatting everywhere

**Location:** `frontend/src/pages/BlogDetailPage.tsx:29-159`, `frontend/src/pages/GuidebookPage.tsx:43-209`

Two separate line-based markdown parsers exist. Neither processes **inline syntax**, so across ~22 blog posts and 16 guidebook chapters:

- **Inline links** `[text](url)` → shown literally as `[text](url)`
- **Bold/italic** `**text**` / `*text*` → shown with literal asterisks
- **Inline code** `` `code` `` → shown with literal backticks
- No nested lists, no multi-line blockquotes, no task lists

The guidebook's table handling even does a crude `cell.replace(/\*\*/g, '')` — **stripping** bold rather than rendering it. This is the single highest-impact defect: the *writing* pages render broken.

**Fix:** Replace both parsers with one shared renderer using `react-markdown` + `remark-gfm`. The existing table/heading CSS classes can be mapped via the `components` prop. Collapses ~250 lines of buggy parsing into ~15 and fixes all of the above at once.

---

### 2. Invalid HTML: orphan `<li>` elements

**Location:** `frontend/src/pages/BlogDetailPage.tsx:129-134`

`<li>` is emitted directly inside `.blog-detail-content` (a `<div>`) with **no `<ul>`/`<ol>` wrapper**. Browsers do error-correction on this, but:

- Produces inconsistent DOM across browsers
- Screen readers announce it poorly ("list, 1 item" per bullet)
- Automatic Lighthouse/axe failure

The Guidebook avoids this by wrapping each `<li>` in its own `<ul>` — but that is **also wrong**: each bullet becomes its own list, so spacing/bullets are inconsistent and screen readers announce N lists of 1.

**Fix:** Resolved automatically by adopting `react-markdown` (see #1), which emits valid list structures.

---

### 3. Two divergent parsers = double maintenance and visual drift

**Location:** same as #1

Blog and Guidebook render tables differently (`blog-table` vs `reader-table`), handle lists differently, and treat `---` differently. Content authored for one surface won't render correctly in the other.

**Fix:** Consolidate into one shared markdown component used by both pages.

---

## 🟠 High — Interaction & Information Architecture

### 4. Navigation hides primary destinations behind dropdowns

**Location:** `frontend/src/config/navConfig.ts`

Every meaningful destination lives inside one of three dropdowns (About ▾, Work & Writing ▾, System & Ops ▾); only "Contact" is a direct link. For a portfolio, the things recruiters and hiring managers most want — **Projects, Blog, Experience** — each require two clicks, and the open-on-hover interaction does not exist on touch devices.

**Suggested fix:** Promote 2–3 top destinations to top-level links.

```
[ About ▾ | Projects | Blog | Experience | System ▾ | Contact ]
```

Keep dropdowns only for genuinely grouped secondary items.

---

### 5. Hover-to-open dropdowns with no touch fallback and a hover/click conflict

**Location:** `frontend/src/components/layout/ModernLayout.tsx:118`

Dropdowns open on `onMouseEnter` (guarded by `!mobileMenuOpen`), but the click handler `toggleDropdown` toggles the *same* `activeDropdown` state. On desktop this creates a classic hover/click conflict: hover opens it, then the first click intended to select an item can instead close it. On touch (≥768px tablets) there is **no hover**, so dropdowns rely solely on the toggle button — but the affordance doesn't communicate "tap to open."

**Fix:** Pick one model. Pure-click is recommended for accessibility — it works everywhere and is keyboard-friendly. Pure hover-on-desktop is hostile to keyboard users despite the `aria-expanded` attributes.

---

### 6. "System & Ops" is a confusing top-level grouping

**Location:** `frontend/src/config/navConfig.ts` (system group)

"Site Architecture" and "Ops Dashboard" are *meta* content (how the site is built / its live telemetry). Grouping them as a peer to "About" and "Work & Writing" gives them equal visual weight they don't deserve, and "System & Ops" is insider jargon most visitors will never open.

**Fix:** Demote both to the **footer**, where "Built with X / View source / Status" links naturally live. This declutters primary nav and follows convention.

---

### 7. Theme switcher placement and discoverability

**Location:** `frontend/src/components/layout/ThemeToggle.tsx`

- A segmented `[ MODERN | ASCII | CLI ]` control occupies permanent header real estate for a feature most users will try once. The all-caps labels with no icon give no hint what each theme *is*.
- Default is `modern`, persisted in `localStorage` — good. But there is no respect for `prefers-color-scheme` or reduced motion, and the high-contrast phosphor-on-black CLI/ASCII themes can be inaccessible to some users with no clear path back to "default" other than clicking MODERN.

**Fix:** Move theme switching into a small settings/menu affordance (gear icon) or footer. Keep MODERN as the unambiguous default. Optionally add a one-time "Try the retro themes" prompt instead of a permanent 3-button control.

---

## 🟡 Medium — Visual Hierarchy & Content

### 8. Homepage hero has no primary call-to-action

**Location:** `frontend/src/pages/HomePage.tsx:13-37`

The hero shows name, title, credentials, bio, then a row of equally-weighted social buttons. There is **no single dominant CTA** — a visitor lands and isn't told what to do next. The implicit goal of a portfolio is to get the visitor to look at work or make contact.

**Fix:** Add one primary CTA (e.g. "View my work →" → `/projects`) using the existing `.link-button.primary`, and demote socials to secondary/icon-only. The 3rem serif hero title is good — lean into it with a clearer next step.

---

### 9. Featured Projects grid forces 2 columns even with an odd count

**Location:** `frontend/src/pages/Pages.css:216-226`

`.project-grid` is `repeat(2, 1fr)` at ≥640px. If `featured` flags yield an odd number, the orphan card stretches half-width with awkward whitespace.

**Fix:** Cap featured at an even count, or switch to `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` so the grid reflows gracefully.

---

### 10. Skills Snapshot is a wall of chips with no proficiency signal

**Location:** `frontend/src/pages/HomePage.tsx:72-89`

Every skill is rendered as an equal-weight chip. With no proficiency or recency indicator, a recruiter scanning it gets no signal about what is genuinely strong vs. merely touched.

**Fix:** Group by tier (Core / Familiar), or lead each category with the top 3 highlighted.

---

### 11. Design tokens are duplicated — `:root` and `[data-theme="modern"]` are identical

**Location:** `frontend/src/styles/variables.css:1-21` and `:68-88`

The full token set is defined at `:root` **and again** under `[data-theme="modern"]` with the same values. This is fragile — change one, forget the other, and the "default" drifts from "modern."

**Fix:** Keep tokens at `:root` as the single source of truth (modern *is* the default). Themes should only override values that actually differ.

---

### 12. Pages.css mixes two different token vocabularies (phantom indigo palette)

**Location:** `frontend/src/pages/Pages.css` (throughout)

The file references `--color-primary`, `--color-text-muted`, `--color-border-subtle`, `--font-mono`, `--surface-button`, `--border-radius-sm` — **none of which are defined** in `variables.css` (which uses `--accent-primary`, `--text-muted`, `--border-color`, `--font-family`, etc.). Every reference falls back to its CSS fallback value (e.g. `var(--color-primary, #6366f1)` → indigo), which means **base/unthemed page elements render in a completely different indigo palette** than the theme system. This is why `projects-tab-btn.active` is indigo regardless of theme.

**Fix:** Audit and rename all `--color-*` / `--font-mono` references to the real tokens defined in `variables.css`.

---

## 🟢 Low — Polish

### 13. `window.scrollTo({ behavior: 'instant' })` is non-standard

**Location:** `frontend/src/pages/GuidebookPage.tsx:26`

Valid values are `'auto'` and `'smooth'`. `'instant'` works in Chromium but not consistently elsewhere. Use `'auto'`.

---

### 14. Guidebook volume tabs use emoji inside button text

**Location:** `frontend/src/pages/GuidebookPage.tsx:242,250`

The 📘 / 🐍 emoji render as literal text in some terminal-font themes and are read verbatim by screen readers ("snake Vol 2"). Prefer an icon from `lucide-react` (already a dependency) with `aria-hidden`.

---

### 15. Confirm NotFoundPage offers recovery links

**Location:** `frontend/src/pages/NotFoundPage.tsx`

A good 404 on a portfolio should surface 3–4 deep links (Projects, Blog, Home), not just "404". Verify it offers recovery paths.

---

### 16. Verify loading / error / empty states for backend-dependent surfaces

**Locations:** `GitHubDashboard`, `MonitoringPage`

The site gracefully falls back to local data (good resilience), but if a user is online and the backend is slow, there is no skeleton or progressive disclosure — and these two surfaces are the most likely to feel empty. Verify each has explicit loading, error, and empty states. Lock them in via the existing Storybook stories.

---

### 17. `backdrop-filter: blur()` is stacked across many surfaces

**Locations:** header, dropdowns, footer card, project cards

On lower-end hardware this causes scroll jank. It's fine in the header; consider dropping it from the footer card and project cards where the background isn't actually visible behind them.

---

## Closing Note

The markdown issue (#1–3) is the one to tackle immediately — it's the difference between "this person writes well" and "this site looks broken." Everything else is incremental polish on what is otherwise a thoughtful, distinctive three-theme design.

See **`UI-UX-ACTION-TRACKER.md`** for a prioritized, effort-sized implementation plan.
