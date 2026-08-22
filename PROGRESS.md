# Track A Progress — Chrome (Nav + Footer)

- [ ] A.1 — Navigation restructure
  - [ ] Promote `/experience` to a direct-link top-level group (remove from About children)
  - [ ] Disband "Work & Writing" group: Blog + Guidebook → About ▾, Amazon Tools → Lab ▾
  - [ ] Rename "System & Ops" → "Lab"; children: How This Site Works, Live Ops Dashboard, Amazon Seller Suite
  - [ ] Update `modernLabel`, `cliLabel`, and `asciiLabel` for every new/changed group
    (e.g. Lab: `cliLabel: 'lab/'`, `asciiLabel: 'LAB'`)
  - [ ] Update nav-related tests:
    - [ ] `frontend/src/components/layout/LayoutRenderer.test.tsx`
    - [ ] `frontend/src/components/layout/SubmenuNavigation.test.tsx`
    - [ ] Any `navConfig` assertions found in other layout test files
  - [ ] Manually verify all three layouts render the new nav (Modern, CLI, ASCII via ThemeToggle)
- [ ] A.2 — Footer safety net
  - [ ] Add a nav links row to the Modern footer with these hand-written links (do NOT import/derive from `NAV_GROUPS`):
    - About group: Bio (`/about`) · Now (`/now`) · Blog (`/blog`) · Guidebook (`/guidebook`)
    - Lab group: How This Site Works (`/how-this-site-works`) · Ops Dashboard (`/monitoring`) · Amazon Suite (`/amazon-tools`)
    - Core: Experience (`/experience`) · Projects (`/projects`) · Contact (`/contact`)
    - External: Storybook (`https://chris-lau-storybook.pages.dev`) and API docs (backend `/docs`)
  - [ ] Mirror the link set (styled appropriately) in `CliLayout.tsx` and `AsciiLayout.tsx` footers
  - [ ] Footer must not re-introduce noise on mobile — collapse or wrap cleanly

## Log
- 2026-08-22: Initialized Track A branch and progress tracker.
