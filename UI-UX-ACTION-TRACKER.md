# UI/UX Action Tracker

**Date:** 2026-08-02
**Companion to:** `UI-UX-REVIEW.md`
**Purpose:** Prioritized, effort-sized implementation plan derived from the UI/UX SME review.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

> **Progress (2026-08-03):** Priority 1 fully complete (markdown renderer shipped). Priority 2.1 (promote Projects to top-level nav), 2.2 (pure-click dropdowns), 2.4 (compact theme switcher — icon + dropdown) done. Priority 3.1 (homepage primary CTA), 3.2 (phantom token sweep), 3.3 (token de-dup), 3.4 (project grid reflow) done. Priority 4.1/4.2 (scroll behavior + emoji→icons), 4.3 (404 recovery links), 4.4 (loading/error/empty states for GitHub + monitoring dashboards), 4.5 (backdrop-filter cleanup) done. **Remaining open:** 2.3 (System & Ops to footer — deferred per owner decision), 3.5 (skills proficiency signal). Verified: `tsc --noEmit` clean, `vite build` succeeds, 101/101 tests pass, zero phantom `var()` references remain.

---

## Priority 1 — Do First (high impact, content-breaking)

These three are the single highest-impact fix and are self-contained.

- [x] **1.1 — Adopt `react-markdown` + `remark-gfm`** *(Medium effort · 🔴 Critical)*
  - Add deps: `react-markdown`, `remark-gfm`
  - Create `frontend/src/components/markdown/MarkdownRenderer.tsx`
  - Map existing CSS classes (`blog-heading-2`, `blog-table`, `blog-code-block`, `reader-*`, etc.) via the `components` prop
  - Refs: `UI-UX-REVIEW.md` §1

- [x] **1.2 — Replace `BlogDetailPage` hand-rolled parser** *(Low effort · 🔴 Critical)*
  - Delete `renderMarkdownLines` in `BlogDetailPage.tsx:29-159`
  - Render `<MarkdownRenderer>{post.content}</MarkdownRenderer>` instead
  - Fixes orphan `<li>` (§2) and inline link/code/bold rendering automatically
  - Refs: `UI-UX-REVIEW.md` §1, §2

- [x] **1.3 — Replace `GuidebookPage` hand-rolled parser** *(Low effort · 🔴 Critical)*
  - Delete the `useMemo` parser in `GuidebookPage.tsx:43-210`
  - Use the same shared `<MarkdownRenderer>`
  - Refs: `UI-UX-REVIEW.md` §1, §3

**Estimated total:** ~half a day. Collapses ~250 lines into ~15 and fixes all of §1–3.

---

## Priority 2 — Information Architecture & Navigation (high impact, low effort)

- [x] **2.1 — Promote primary destinations to top-level nav** *(Low effort · 🟠 High)*
  - Promoted Projects to a direct top-level link in `navConfig.ts`; Work & Writing dropdown now contains Blog + Book/Guidebook (2 items)
  - Final nav: `[ About ▾ | Projects | Work & Writing ▾ | System & Ops ▾ | Contact ]`
  - Refs: `UI-UX-REVIEW.md` §4

- [x] **2.2 — Fix dropdown hover/click conflict; pick one model** *(Low effort · 🟠 High)*
  - Removed `onMouseEnter` hover handlers in all 3 layouts (Modern, ASCII, CLI); dropdowns now open by click only — works identically on desktop, touch, and keyboard
  - Refs: `UI-UX-REVIEW.md` §5

- [ ] **2.3 — Demote "System & Ops" to the footer** *(Low effort · 🟠 High)*
  - Move Site Architecture + Ops Dashboard out of primary nav
  - Add to footer as "Built with / Status" style links
  - Refs: `UI-UX-REVIEW.md` §6

- [x] **2.4 — Rethink theme switcher placement** *(Low effort · 🟠 High)*
  - Replaced the 150px 3-button segmented control with a ~36px icon button + dropdown menu (Modern/ASCII/CLI as direct-select options with active check). Resting footprint shrinks dramatically while preserving one-click access to any theme
  - Refs: `UI-UX-REVIEW.md` §7

---

## Priority 3 — Visual Hierarchy & Content (medium impact)

- [x] **3.1 — Add a primary CTA to the homepage hero** *(Low effort · 🟡 Medium)*
  - Added a primary "View my work →" CTA (`/projects`) ahead of the social links; socials remain as secondary buttons
  - Refs: `UI-UX-REVIEW.md` §8

- [x] **3.2 — Fix phantom indigo palette (token vocabulary mismatch)** *(Medium effort · 🟡 Medium)*
  - Audited all CSS: found 17 undefined tokens across 5 files (`Pages.css`, `BlogCard.css`, `BoxContainer.css`, `FullStackMonitoringDashboard.css`, `GitHubComponents.css`) totaling ~80 usages
  - Mapped each phantom to a real token (`--color-primary`→`--accent-primary`, `--color-text-muted`→`--text-muted`, `--card-bg`/`--surface-*`→`--bg-secondary`, `--font-mono`→`--font-family`, etc.); radii hardcoded to their intended literals; `--border-style` (which had no fallback → invisible border) replaced with `1px solid var(--border-muted)`
  - Elements previously locked to indigo `#6366f1` now follow the active theme
  - Refs: `UI-UX-REVIEW.md` §12

- [x] **3.3 — De-duplicate `:root` vs `[data-theme="modern"]` tokens** *(Trivial · 🟡 Medium)*
  - In `variables.css`, keep tokens at `:root` only; the `[data-theme="modern"]` block is now an empty (documented) shell
  - Modern is the default and overrides nothing
  - Refs: `UI-UX-REVIEW.md` §11

- [x] **3.4 — Make Featured Projects grid reflow gracefully** *(Trivial · 🟡 Medium)*
  - Switched `.project-grid` from fixed `repeat(2, 1fr)` to `repeat(auto-fit, minmax(280px, 1fr))` so orphan cards no longer stretch half-width
  - Refs: `UI-UX-REVIEW.md` §9

- [x] **3.5 — Add proficiency signal to Skills Snapshot** *(Medium effort · 🟡 Medium)*
  - Added `detailedSkills` schema to `backend/data/skills.json` with `level: 'core' | 'proficient'`.
  - Updated `SkillCategory` interface in `frontend/src/types/portfolio.ts`.
  - Enhanced `HomePage.tsx` and `AboutPage.tsx` with star indicator icons (`★`), highlighted border styling for Core skills, and clear `[Core / Proficient]` badge tags.
  - Refs: `UI-UX-REVIEW.md` §10


---

## Priority 4 — Polish (low impact, quick wins)

- [x] **4.1 — Replace `behavior: 'instant'` with `'auto'`** *(Trivial · 🟢 Low)*
  - `GuidebookPage.tsx` — done
  - Refs: `UI-UX-REVIEW.md` §13

- [x] **4.2 — Replace emoji in volume tabs with lucide icons** *(Trivial · 🟢 Low)*
  - `GuidebookPage.tsx` — swapped 📘 / 🐍 for `BookOpen` / `Server` icons with `aria-hidden="true"`; added flex alignment to `.projects-tab-btn`
  - Refs: `UI-UX-REVIEW.md` §14

- [x] **4.3 — Confirm NotFoundPage offers recovery links** *(Trivial · 🟢 Low)*
  - Added Projects, Blog, and Experience deep links alongside "Return Home" in a `.not-found-recovery` link group
  - Refs: `UI-UX-REVIEW.md` §15

- [x] **4.4 — Verify loading/error/empty states for data surfaces** *(Medium effort · 🟢 Low)*
  - **GitHubDashboard**: split the empty state into two cases — a user with 0 public repos now shows "This user has no public repositories." (no misleading "Clear Filters" button), while filtered-to-0 keeps the existing message + button. Loading (spinner) and error (retry/reset) states already existed and are unchanged.
  - **FullStackMonitoringDashboard**: added an `isInitialLoad` gate so the dashboard shows a centered "Connecting to backend…" spinner until the first probe completes (also fixes the "initial HEALTHY badge before any probe" lie). Added a top-level dismissible error banner with Retry/Dismiss that surfaces when the backend is truly unreachable (`!rtt.isOnline && telemetry.isFallback`); auto-clears when the backend recovers on a later poll. The existing per-card `.offline-fallback-notice` stays as the granular signal.
  - Refs: `UI-UX-REVIEW.md` §16

- [x] **4.5 — Reduce stacked `backdrop-filter: blur()` usage** *(Trivial · 🟢 Low)*
  - Removed redundant `backdrop-filter` from the modern footer card (nothing scrolls behind it); switched its background to solid `--bg-secondary`. Kept header + dropdown blur (both float over scrolling content)
  - Refs: `UI-UX-REVIEW.md` §17

---

## Priority 5 — Mobile & Responsive Overhaul (Completed & Merged — PR #9)

- [x] **5.1 — Viewport & Full-Bleed Sticky Header Reset**
  - Reset `#root` container width (`100%`, `min-height: 100dvh`, zero margin/padding) so ModernLayout sticky header spans true edge-to-edge on mobile with no top gaps or double container padding.
- [x] **5.2 — Collapsible Mobile Table of Contents for Guidebooks**
  - Implemented collapsible chapter drawer on mobile (`Choose Chapter ▾` / `Hide Chapters ▴`) so mobile users directly read Chapter 1 content without scrolling past 16 chapter buttons.
- [x] **5.3 — Breakpoint Standardization (< 640px)**
  - Unified all media queries across BoxContainer, Pages, and the Amazon Suite to `640px` (standardizing hierarchy: `480px`, `640px`, `768px`, `900px`).
- [x] **5.4 — Accessible Lucide SVG Icon Migration**
  - Replaced remaining raw emojis with semantic Lucide SVG icons (`BookOpen`, `ShoppingBag`, `TrendingUp`, `Calculator`, `Bookmark`, `Mail`, `Sparkles`, `Activity`) with zero inline styles.
- [x] **5.5 — Mobile Touch Target Scaling & Non-Destructive iOS Zoom**
  - Scaled mobile navigation toggles, theme menu triggers, and filter tags to >= 40–44px (`touch-action: manipulation`).
  - Added 16px font-size rule on mobile inputs with `:not()` exclusion to preserve compact micro-controls.
- [x] **5.6 — WCAG 2.1 AA Contrast Compliance**
  - Fixed monitoring telemetry text contrast by mapping spans to `var(--text-muted)` (guaranteeing >= 4.5:1 contrast across all themes).

---

## Suggested Sequencing

1. **Priority 1** first — self-contained, highest impact, fixes broken content rendering.
2. **Priority 2** next — improves every visitor's first 10 seconds on the site.
3. **Priority 3** as ongoing polish — token cleanup (3.2/3.3) unblocks consistent theming for all future work.
4. **Priority 4** opportunistically.
5. **Priority 5** complete — mobile-first responsiveness, touch targets, and a11y across all viewports.

