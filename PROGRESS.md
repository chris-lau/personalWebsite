# TRACK B — Homepage (hero → cleanup → résumé)

> Branch: `refactor/simplify-home` (from main @ 89f4819)
> Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` skipped (with reason)

## B.1 — Homepage hero restructure

Single message: **"Technical product leader in AI who actually builds the systems he ships."**

- [ ] Replace the "ASK CHRIS" hero container with a human-first hero:
  - [ ] Name (`profileData.name`) as the dominant element — no longer inside a chat container
  - [ ] Title + one-line value prop: AI surveillance, agentic automation, enterprise data
  - [ ] Location + credentials one-liner (`profileData.location`, `profileData.credentials`)
  - [ ] CTA row, in priority order:
    - [ ] **View Experience** (primary, → `/experience`)
    - [ ] **Get in Touch** (mailto `profileData.email`)
    - [ ] LinkedIn + GitHub icons (moved here from the explore dock)
- [ ] Add a slim **current-role band** above or below the CTAs: latest entry from
  `experienceData` (role @ company + one headline highlight) linking to `/experience`
- [ ] Move the embedded `ChatPanel` (with `HOME_STARTERS`) into its own section directly
  below the hero, reframed as an exhibit, e.g. title "ASK THIS SITE" with caption
  "This chat runs on a RAG backend I built over my own content — try it."
- [ ] Keep the grounding badge with the relocated chat panel (it belongs to the chat, not the hero)

## B.2 — Homepage section cleanup

- [ ] Remove the "── or explore directly ──" explore dock (`hero-explore-dock`) —
  redundant with header nav + new footer; socials already moved to hero (B.1)
- [ ] Remove the Skills Snapshot section (full `skills-summary-section` chip wall) —
  duplicates About's Skill Matrix; About keeps that job
- [ ] Re-order Featured Projects cards:
  1. Multi-Agent System Platform
  2. Amazon Seller Trend & Opportunity Suite (its "Live Demo" already routes to `/amazon-tools`)
  3. Personal Portfolio Website ("Live Demo" → `/how-this-site-works`)
- [ ] Add a one-line outcome/so-what to each project card (from existing
  `backend/data/projects.json` descriptions — condense, don't write new claims)
- [ ] Update `frontend/src/pages/Pages.test.tsx` homepage assertions
  (dock gone, skills section gone, hero CTA labels present, chat section present)

## B.3 — Résumé link (optional; skip if no PDF available — do not block on it)

- [ ] Add `resumeUrl` to `backend/data/profile.json` + `Profile` type (`frontend/src/types/portfolio.ts`)
- [ ] Link it from the hero (tertiary button, next to socials) and the Contact page

## Log

- 2026-08-22 — Track B started. Worktree created at `../personalWebsite-home` from main @ 89f4819. PROGRESS.md committed.
