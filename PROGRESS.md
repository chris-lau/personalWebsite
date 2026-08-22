# TRACK B — Homepage (hero → cleanup → résumé)

> Branch: `refactor/simplify-home` (from main @ 89f4819)
> Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` skipped (with reason)

## B.1 — Homepage hero restructure

Single message: **"Technical product leader in AI who actually builds the systems he ships."**

- [x] Replace the "ASK CHRIS" hero container with a human-first hero:
  - [x] Name (`profileData.name`) as the dominant element — no longer inside a chat container
  - [x] Title + one-line value prop: AI surveillance, agentic automation, enterprise data
  - [x] Location + credentials one-liner (`profileData.location`, `profileData.credentials`)
  - [x] CTA row, in priority order:
    - [x] **View Experience** (primary, → `/experience`)
    - [x] **Get in Touch** (mailto `profileData.email`)
    - [x] LinkedIn + GitHub icons (moved here from the explore dock)
- [x] Add a slim **current-role band** above or below the CTAs: latest entry from
  `experienceData` (role @ company + one headline highlight) linking to `/experience`
- [x] Move the embedded `ChatPanel` (with `HOME_STARTERS`) into its own section directly
  below the hero, reframed as an exhibit, e.g. title "ASK THIS SITE" with caption
  "This chat runs on a RAG backend I built over my own content — try it."
- [x] Keep the grounding badge with the relocated chat panel (it belongs to the chat, not the hero)

**Boundary exception:** `frontend/src/App.test.tsx` uses the string `ASK CHRIS` as a
lazy-load sentinel in 5 assertions. The file is owned by no track (A owns layout test
files, C owns AmazonToolsPage.test.tsx), so a test-only sentinel update
(`ASK CHRIS` → `ASK THIS SITE`) was required to keep `npm test` green. No production
code in the file changed; zero conflict risk with Tracks A/C.

## B.2 — Homepage section cleanup

- [x] Remove the "── or explore directly ──" explore dock (`hero-explore-dock`) —
  redundant with header nav + new footer; socials already moved to hero (B.1)
- [x] Remove the Skills Snapshot section (full `skills-summary-section` chip wall) —
  duplicates About's Skill Matrix; About keeps that job
- [x] Re-order Featured Projects cards:
  1. Multi-Agent System Platform
  2. Amazon Seller Trend & Opportunity Suite (its "Live Demo" already routes to `/amazon-tools`)
  3. Personal Portfolio Website ("Live Demo" → `/how-this-site-works`)
- [x] Add a one-line outcome/so-what to each project card (from existing
  `backend/data/projects.json` descriptions — condense, don't write new claims)
- [x] Update `frontend/src/pages/Pages.test.tsx` homepage assertions
  (dock gone, skills section gone, hero CTA labels present, chat section present)

**Note on Live Demo routing:** `backend/data/projects.json` is outside Track B's file
boundaries, so the Personal Portfolio Website's "Live Demo" → `/how-this-site-works`
destination is applied via a small homepage-level lookup (`LIVE_DEMO_PATHS` in
`HomePage.tsx`) instead of a `liveUrl` field in the data. Coordinator may fold this
into `projects.json` post-merge if preferred. Project re-ordering is likewise
render-level (`FEATURED_PROJECT_ORDER`), not a data-file change.

## B.3 — Résumé link (optional; skip if no PDF available — do not block on it)

- [ ] Add `resumeUrl` to `backend/data/profile.json` + `Profile` type (`frontend/src/types/portfolio.ts`)
- [ ] Link it from the hero (tertiary button, next to socials) and the Contact page

## Log

- 2026-08-22 — Track B started. Worktree created at `../personalWebsite-home` from main @ 89f4819. PROGRESS.md committed.
- 2026-08-22 — B.1 done: hero rebuilt human-first (name dominant, title + value-prop line, location · credentials, CTA row with View Experience / Get in Touch / LinkedIn / GitHub with lucide icons, current-role band from experienceData[0] linking to /experience). ChatPanel + grounding badge relocated to new "ASK THIS SITE" exhibit section directly below hero. CSS added for valueprop/CTA row/role band/chat exhibit with Modern + ASCII + CLI overrides. Tests: Pages.test.tsx homepage assertions rewritten; App.test.tsx sentinel updated (boundary exception, documented above). npm test green (25 files / 198 tests).
- 2026-08-22 — B.2 done: explore dock removed (markup + CSS + theme overrides); Skills Snapshot chip wall removed (markup + CSS; shared `.skill-badge-star` rule kept for AboutPage); featured projects re-ordered Multi-Agent → Amazon Suite → Portfolio via `FEATURED_PROJECT_ORDER`; one-line outcome added to each card (condensed from existing projects.json descriptions); Portfolio "Live Demo" routed to `/how-this-site-works` via homepage-level `LIVE_DEMO_PATHS` (projects.json is out of bounds). Tests split into 3 homepage cases incl. order + Live Demo href assertions. npm test green (25 files / 200 tests), `tsc --noEmit` clean.
