# Personal Website Reskin — Final Prompt (v2, consolidation locked in)

You are an elite frontend designer-engineer specializing in high-craft
developer portfolios (Linear/Vercel-grade polish).

## Context — my actual site (audit this first, don't assume)
- React 18 + TypeScript + Vite + react-router. Styling is plain CSS with
  design tokens in `frontend/src/styles/variables.css` (custom properties
  like `--bg-primary`, `--accent-primary`). lucide-react for icons.
- NO Tailwind and NO motion library is installed.
- A `LayoutRenderer` switches three layouts (`AsciiLayout`, `CliLayout`,
  `ModernLayout`) via a 3-way `ThemeToggle`.
- 11 existing pages (Home, About, Projects, Experience, Blog, Contact,
  Amazon Tools, Guidebook, Monitoring, Now, How This Site Works), a global
  `ChatWidget` ("Chat with Chris" AI), and content from `src/data` + a
  FastAPI backend.
- Quality infra: vitest + Testing Library, Playwright e2e, Storybook with
  the a11y addon.
- Primary audience: recruiters spending under a minute.

## Goal
A complete visual reskin in the high-craft minimalism style — and this
redesign is the vehicle for simplifying the site for recruiters, not extra
complexity layered on top. The new homepage replaces clutter; it doesn't
add to it.

## Hard constraints
- Styling: extend the existing CSS-custom-property token system in
  `variables.css`. Do NOT introduce Tailwind — translate the palette below
  into tokens.
- Dependencies: none beyond self-hosted fonts (`@fontsource-variable/inter`
  and `@fontsource/jetbrains-mono`). Implement motion with CSS
  transitions/transforms; no framer-motion.
- Layout: consolidate to the reskinned `ModernLayout` as the only layout.
  Retire `AsciiLayout` and `CliLayout` — delete their components, CSS,
  stories, and the `LAYOUT_MAP` indirection in `LayoutRenderer`. Repurpose
  the existing `ThemeToggle` into a dark/light mode switch driven by the
  token system's light-mode variant, persisted the same way the current
  theme choice is.
- Preserve the terminal personality as micro-touches, not layouts:
  monospace accents, a `$ whoami` flourish in the footer, and a
  `theme: cli` easter-egg command in the command palette — no separate
  layout code for it.
- Content: reuse real content and data sources (`src/data`, existing
  APIs). No lorem ipsum, no invented projects.
- The `ChatWidget` must survive and gain a more prominent, tasteful home
  in the new design (hero CTA that opens the chat).
- Accessibility: honor `prefers-reduced-motion`, keep the skip link,
  `focus-visible` states everywhere, Storybook a11y checks pass.
- Keep all existing routes and the backend untouched. Keep vitest and
  Playwright green — update tests only where the UI legitimately changed.

## Design direction
- Palette: dark-mode-first zinc neutrals (`#09090b` → `#18181b`), text
  `#fafafa` / `#a1a1aa`, hairline borders (rgba-white ~10%), one accent
  (electric indigo or emerald — pick one and justify). Expose the full
  scale as tokens, including a light-mode variant so the dark/light toggle
  works.
- Typography: Inter Variable for headings/body, JetBrains Mono for
  metrics, badges, tags, timestamps. Define a type ramp as tokens.
- Motion: subtle hover elevation, 150–250ms transitions, cursor-responsive
  border gradient on the bento cards. Nothing animates without
  reduced-motion support.

## Structural requirements (mapped to existing pages)
1. Home = hero + bento grid. Hero: headline, 1–2 sentence positioning,
   live status badge, contact/CV/social CTAs with quick-copy, and an
   "Ask my AI" CTA that opens the ChatWidget. Bento tiles: featured work
   as Challenge → Strategy → Measured Outcome (from real project data),
   stack badges, a "Now"/activity tile (reuse Now-page data), and one
   side-interests tile.
2. Command palette (Cmd/Ctrl+K): jumps between existing routes plus
   actions (copy email, toggle theme). It's an enhancement — the nav must
   be fully usable without it.
3. Navigation: minimal sticky bar with backdrop blur; recruiter-first
   hierarchy — decide which of the 11 pages stay top-level vs. move to a
   "More" menu.
4. Footer: direct email copy action, live local-time/status indicator,
   `$ whoami` monospace flourish.

## Process — two phases with an approval gate
Phase 1 (stop for approval before Phase 2):
  a) Audit: confirm no page depends on layout-specific chrome or classes,
     and list the tests/stories that consolidation deletes.
  b) Deliver: the updated token spec in `variables.css`, a wireframe/
     layout plan with responsive breakpoints (375 / 768 / 1440), and ONE
     fully implemented reference page (Home) — built, tested,
     screenshotted at all three breakpoints.

Phase 2 (only after approval): delete the retired layouts and repurpose
  the toggle, roll out tokens to remaining pages, build the command
  palette, update Storybook stories, add e2e coverage for the command
  palette and theme toggle, then run the full verification: `npm run
  build`, vitest, Playwright e2e, Storybook a11y — all green.

## Non-goals
No content rewriting, no route changes, no backend changes, no new pages
beyond restructuring what exists.
