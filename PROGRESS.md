# Track A Progress — Chrome (Nav + Footer)

- [x] A.1 — Navigation restructure
  - [x] Promote `/experience` to a direct-link top-level group (remove from About children)
  - [x] Disband "Work & Writing" group: Blog + Guidebook → About ▾, Amazon Tools → Lab ▾
  - [x] Rename "System & Ops" → "Lab"; children: How This Site Works, Live Ops Dashboard, Amazon Seller Suite
  - [x] Update `modernLabel`, `cliLabel`, and `asciiLabel` for every new/changed group
    (e.g. Lab: `cliLabel: 'lab/'`, `asciiLabel: 'LAB'`)
  - [x] Update nav-related tests:
    - [x] `frontend/src/components/layout/LayoutRenderer.test.tsx`
    - [x] `frontend/src/components/layout/SubmenuNavigation.test.tsx`
    - [x] Any `navConfig` assertions found in other layout test files
  - [x] Manually verify all three layouts render the new nav (Modern, CLI, ASCII via ThemeToggle)
- [~] A.2 — Footer safety net
  - [ ] Add a nav links row to the Modern footer with these hand-written links (do NOT import/derive from `NAV_GROUPS`):
    - About group: Bio (`/about`) · Now (`/now`) · Blog (`/blog`) · Guidebook (`/guidebook`)
    - Lab group: How This Site Works (`/how-this-site-works`) · Ops Dashboard (`/monitoring`) · Amazon Suite (`/amazon-tools`)
    - Core: Experience (`/experience`) · Projects (`/projects`) · Contact (`/contact`)
    - External: Storybook (`https://chris-lau-storybook.pages.dev`) and API docs (backend `/docs`)
  - [ ] Mirror the link set (styled appropriately) in `CliLayout.tsx` and `AsciiLayout.tsx` footers
  - [ ] Footer must not re-introduce noise on mobile — collapse or wrap cleanly

## Log
- 2026-08-22: Initialized Track A branch and progress tracker.
- 2026-08-22: Completed A.1 - Restructured NAV_GROUPS (promoted Experience, created Lab, updated About), updated SubmenuNavigation.test.tsx, verified all vitest test suites pass.
