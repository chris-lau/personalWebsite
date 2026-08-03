# UI/UX Action Tracker

**Date:** 2026-08-02
**Companion to:** `UI-UX-REVIEW.md`
**Purpose:** Prioritized, effort-sized implementation plan derived from the UI/UX SME review.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

> **Progress (2026-08-02):** Priority 1 fully complete (markdown renderer shipped, both pages migrated, 12 tests green). Priority 2.1 (promote Projects to top-level nav) and 2.2 (pure-click dropdowns) done. Priority 3.2 (phantom token sweep — 17 undefined tokens across 5 CSS files → real tokens), 3.3 (token de-dup), and 4.1/4.2 (scroll behavior + emoji→icons) also done. Verified: `tsc --noEmit` clean, `vite build` succeeds, 94/94 tests pass, zero phantom `var()` references remain.

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

- [ ] **2.4 — Rethink theme switcher placement** *(Low effort · 🟠 High)*
  - Move `[ MODERN | ASCII | CLI ]` from permanent header into a settings affordance (gear icon) or footer
  - Refs: `UI-UX-REVIEW.md` §7

---

## Priority 3 — Visual Hierarchy & Content (medium impact)

- [ ] **3.1 — Add a primary CTA to the homepage hero** *(Low effort · 🟡 Medium)*
  - Add one `.link-button.primary` CTA (e.g. "View my work →" → `/projects`)
  - Demote socials to secondary
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

- [ ] **3.4 — Make Featured Projects grid reflow gracefully** *(Trivial · 🟡 Medium)*
  - Switch `.project-grid` to `repeat(auto-fit, minmax(280px, 1fr))` or cap featured count to even
  - Refs: `UI-UX-REVIEW.md` §9

- [ ] **3.5 — Add proficiency signal to Skills Snapshot** *(Medium effort · 🟡 Medium)*
  - Group by tier (Core / Familiar) or highlight top 3 per category
  - Refs: `UI-UX-REVIEW.md` §10

---

## Priority 4 — Polish (low impact, quick wins)

- [x] **4.1 — Replace `behavior: 'instant'` with `'auto'`** *(Trivial · 🟢 Low)*
  - `GuidebookPage.tsx` — done
  - Refs: `UI-UX-REVIEW.md` §13

- [x] **4.2 — Replace emoji in volume tabs with lucide icons** *(Trivial · 🟢 Low)*
  - `GuidebookPage.tsx` — swapped 📘 / 🐍 for `BookOpen` / `Server` icons with `aria-hidden="true"`; added flex alignment to `.projects-tab-btn`
  - Refs: `UI-UX-REVIEW.md` §14

- [ ] **4.3 — Confirm NotFoundPage offers recovery links** *(Trivial · 🟢 Low)*
  - Add 3–4 deep links (Projects, Blog, Home) to the 404
  - Refs: `UI-UX-REVIEW.md` §15

- [ ] **4.4 — Verify loading/error/empty states for data surfaces** *(Medium effort · 🟢 Low)*
  - `GitHubDashboard`, `MonitoringPage` — add skeletons and explicit empty/error states
  - Lock in via Storybook stories
  - Refs: `UI-UX-REVIEW.md` §16

- [ ] **4.5 — Reduce stacked `backdrop-filter: blur()` usage** *(Trivial · 🟢 Low)*
  - Drop from footer card and project cards; keep in header
  - Refs: `UI-UX-REVIEW.md` §17

---

## Suggested Sequencing

1. **Priority 1** first — self-contained, highest impact, fixes broken content rendering.
2. **Priority 2** next — improves every visitor's first 10 seconds on the site.
3. **Priority 3** as ongoing polish — token cleanup (3.2/3.3) unblocks consistent theming for all future work.
4. **Priority 4** opportunistically.
