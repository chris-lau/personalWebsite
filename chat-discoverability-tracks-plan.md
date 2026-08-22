# Chat Discoverability — Parallel Track Plan

Goal: make the "Chat with Chris" feature discoverable (notice + understand within ~5s of landing) without degrading the recruiter-first experience. One chat surface per page. Unified entry-point label: **"Ask this site"**.

Base: `main` at the commit containing this file. Three tracks run in parallel in separate worktrees; merge order **A → B → C**.

## Hard constraints (all tracks)

- No auto-popups; nothing that blocks or clutters content; hero markup/copy untouched (Track B's single `id` attribute is the sole exception).
- Recruiter path (Experience → Projects → Contact) unchanged in structure.
- Launcher label is **"Ask this site"** (mobile short label: "Ask"). Panel title stays "Chat with Chris".
- Accessibility: visible focus states (global `:focus-visible` already exists), accessible name = visible label, Escape closes the panel, focus returns to the launcher, pulse honors `prefers-reduced-motion`.
- No new dependencies; **no edits to `package.json`**. If a task seems to need one, mark `[!]`, note it, continue.
- Floating chat stays suppressed on `/` and `/amazon-tools` (`ChatWidget` early-return stays).
- This plan file is read-only for agents. Never edit it in a track branch.
- Test gates per commit (run from `frontend/`): `npx vitest run` green AND `npm run lint` (tsc --noEmit) green.
- **Playwright e2e port rule**: the e2e webServer hardcodes port 3000 with `reuseExistingServer` — a reused server may belong to ANOTHER track's worktree. Before running any e2e: check port 3000 is free (`lsof -i :3000`). If busy, do NOT run e2e; mark `[!]` and let the coordinator run it post-merge. Track C never gates on e2e (its spec needs Track A's merged listener).

## Tracks table

| Track | Owner CLI | Scope | Branch | Worktree |
|---|---|---|---|---|
| A — Launcher & chat open API | claude | Pill launcher, pulse etiquette, a11y, mobile clearance, `chatControl.ts` + listener | `feat/chat-launcher` | `../personalWebsite-chat-launcher` |
| B — Homepage mobile fold | codex | Mobile-only hero spacing so the exhibit clears the fold; `#ask-this-site` id | `feat/home-mobile-fold` | `../personalWebsite-home-fold` |
| C — Contextual entry points | codex | "Ask about this" links on Projects/Experience; fix DOM-click hack | `feat/contextual-chat-links` | `../personalWebsite-contextual-chat` |

All `frontend/src/…` paths below are relative to `frontend/src/` unless noted.

## Shared contract — `frontend/src/components/chat/chatControl.ts` (FROZEN SOURCE)

Track A owns this file. Track C creates a **byte-identical copy** in its own branch so its tree compiles; at merge the coordinator verifies byte-equality and keeps A's (see Merge rules). Both tracks must produce exactly:

```ts
export interface OpenChatOptions {
  starter?: string;
}

export const CHAT_OPEN_EVENT = 'chat:open';

export function openChat(options: OpenChatOptions = {}): void {
  window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT, { detail: options }));
}

export function isChatOpenEvent(event: Event): event is CustomEvent<OpenChatOptions> {
  return event instanceof CustomEvent && event.type === CHAT_OPEN_EVENT;
}
```

Semantics: `openChat({ starter })` dispatches `chat:open`. ChatWidget's listener (Track A) receives it: on `/` it scrolls `#ask-this-site` into view; on every other route it opens the panel and, if `starter` is set, sends it through the widget's `useChat().sendMessage(starter)`.

## Files owned (exclusive; anything not listed is off-limits)

- **Track A:** `components/chat/ChatWidget.tsx`, `components/chat/ChatWidget.css`, `components/chat/ChatWidget.test.tsx`, `components/chat/chatControl.ts` (new), `components/layout/ModernLayout.css` + `CliLayout.css` + `AsciiLayout.css` (mobile footer bottom-padding only), `e2e/chat-launcher.spec.ts` (new), own `PROGRESS.md`.
- **Track B:** `pages/Pages.css` (existing mobile media queries only), `pages/HomePage.tsx` (ONLY adding the `id="ask-this-site"` attribute to the exhibit `<section>` — no other markup/copy change), `e2e/home-fold.spec.ts` (new), own `PROGRESS.md`.
- **Track C:** `pages/ProjectsPage.tsx`, `pages/ExperiencePage.tsx`, `pages/HowThisSiteWorksPage.tsx`, `components/chat/chatControl.ts` (byte-identical copy, see contract), `pages/ContextualChatLinks.test.tsx` (new), `e2e/contextual-chat.spec.ts` (new), own `PROGRESS.md`.
- **Owned by nobody (zero edits):** `pages/Pages.test.tsx`, `e2e/portfolio.spec.ts`, `e2e/monitoring.spec.ts`, `e2e/fallback.spec.ts`, `components/chat/starters.ts`, `package.json`, this plan file.

## Track A — Launcher & chat open API

Phase order is mandatory (phases share `ChatWidget.tsx`).

1. `chatControl.ts` — create with the frozen source above.
2. Launcher pill (`ChatWidget.tsx` + `ChatWidget.css`):
   - JSX: keep `type="button"`, `MessageCircle` icon (size 22, aria-hidden) + label spans: `<span className="chat-launcher__label chat-launcher__label--full" >Ask this site</span>` and `<span className="chat-launcher__label chat-launcher__label--short">Ask</span>`. Remove `aria-label` (accessible name comes from visible text; short span `display:none` off-mobile so the name tracks what's visible). Keep `aria-expanded={open}`.
   - CSS: circle → pill: `height: 3rem`, `padding: 0 1rem`, `border-radius: 999px`, `gap` for icon+label. Keep position/z-index/accent tokens/border/shadow/hover lift/`chat-launcher--hidden` behavior. ≤480px: show short label, hide full.
3. Pulse etiquette:
   - Pulse ring renders only while `localStorage.getItem('chat_opened_once')` is unset (read lazily in state init, try/catch like the existing companion-mode flag). Set the flag the first time the panel opens (any path: launcher click or `chat:open` event).
   - Wrap `.chat-launcher__pulse` + `@keyframes chat-pulse` usage in `@media (prefers-reduced-motion: no-preference)`.
4. A11y (`ChatWidget.tsx`):
   - Escape closes the open panel; on close (any path) focus returns to the launcher button (ref).
5. `chat:open` listener (`ChatWidget.tsx`):
   - `useEffect` registering `window.addEventListener(CHAT_OPEN_EVENT, …)` — **must be placed before the early `return null` guards** so it also fires on `/` (hooks must stay above early returns).
   - Handler: if `pathname === '/'` → `document.getElementById('ask-this-site')?.scrollIntoView({ behavior: 'smooth' })`; else `setOpen(true)` and, when `detail.starter` is set, send it via the widget's `chat.sendMessage(starter)`. Guard against double-send if a starter is already in flight (messageIsStreaming check). Cleanup on unmount.
6. Mobile footer clearance (3 layout CSS files): ONLY the mobile breakpoint footer bottom padding — raise so the pill (3rem tall + 1rem inset) can never cover footer links (≈ `padding-bottom: 5rem` at ≤480px, adapt to each theme's existing mobile footer rule). No other rules in these files may change.
7. Tests (`ChatWidget.test.tsx`): update all existing `getByRole('button', { name: 'Open chat' })` / `queryByRole` lookups (12 occurrences) to the new accessible name. New cases: pill label text renders; pulse absent after `chat_opened_once` set; Escape closes panel; focus returns to launcher on close; `chat:open` event opens panel and sends starter; on `/`, `chat:open` calls `scrollIntoView` (stub on Element.prototype) and does not open a panel.
8. E2E `e2e/chat-launcher.spec.ts` (run only if port 3000 free): on `/experience` desktop viewport, the launcher is visible in the first viewport with text "Ask this site"; click opens the dialog (`role dialog, name "Chat with Chris"`); Escape closes it.

## Track B — Homepage mobile fold

Measured on production at 390×844, scrollY 0: hero ends at y=720; "ASK THIS SITE" title top ≈773; `.hero-grounding-badge` top ≈834 — the badge is effectively below the fold. Desktop 1440×800 is fine (title 614, badge 691, caption 731 all visible) and must not regress.

1. `pages/HomePage.tsx`: add `id="ask-this-site"` to `<section className="chat-exhibit-section" …>` (line ~85). Nothing else in this file.
2. `pages/Pages.css`: inside existing mobile media queries only (≤768px and below), tighten hero vertical spacing (paddings/margins/gaps of `.hero-section` / `.hero-content` / `.hero-cta-row` / `.hero-role-band` and related mobile rules) so `.hero-grounding-badge` is fully inside the viewport at 390×844, scrollY 0 (lift it ~60–100px; hero is 634px tall there). No desktop (≥769px) rules may change; no copy, no unit swaps beyond spacing.
3. Verify without regressions: desktop hero unchanged at 1440×800.
4. E2E `e2e/home-fold.spec.ts` (run only if port 3000 free): 390×844 viewport, load `/`, assert `.hero-grounding-badge` bounding box is fully within the viewport before any scroll.

## Track C — Contextual entry points

1. Create `components/chat/chatControl.ts` byte-identical to the frozen contract above.
2. `pages/ProjectsPage.tsx`: per project card, in `.project-actions` after existing links, a quiet `<button type="button" className="link-button">` — visible text `Ask about this →`, `aria-label={\`Ask about this project: ${project.title}\`}` — onClick `openChat({ starter: \`Tell me about the ${project.title} project.\` })`.
3. `pages/ExperiencePage.tsx`: same pattern per role item — visible text `Ask about this →`, `aria-label={\`Ask about this role: ${role} @ ${company}\`}`, starter `Tell me about Chris's ${role} role at ${company}.`
4. `pages/HowThisSiteWorksPage.tsx`: replace `handleOpenChatObservability`'s `localStorage` + `.chat-launcher` DOM-click hack (lines ~10–20) with: keep the companion-mode `localStorage` set, then `openChat()`. No `document.querySelector('.chat-launcher')` may remain.
5. Homepage featured cards (`HomePage.tsx`): **no changes** — the exhibit already serves `/`.
6. Tests (`pages/ContextualChatLinks.test.tsx`): Projects + Experience render the links; clicking dispatches a `chat:open` CustomEvent with the expected `detail.starter` (assert via `addEventListener` spy); HowThisSiteWorksPage button calls `openChat` and performs no launcher DOM query.
7. E2E `e2e/contextual-chat.spec.ts` (WRITE but do NOT run/gate — requires Track A's merged listener): on `/projects`, click the first "Ask about this" button; expect the chat dialog to open and the starter question to appear as a sent message.

## Protocol

- Every agent starts immediately; no track waits on another's code. Only C's *runtime* depends on A's listener (integration verified post-merge).
- `PROGRESS.md` in worktree root, first commit, statuses `[ ] [~] [x] [!]` (skipped = reason), `## Log` with one dated line per session. Must always reflect reality; final contents go into the PR body.
- Skip-and-note: hitting a boundary (file you don't own, unexpected coupling) → mark `[!]`, note it, continue.
- No agent merges its own PR. Coordinator merges A → B → C.
- One commit per phase; unit + typecheck gates green before every commit.

## Merge order & conflict rules

1. **A first** (creates canonical `chatControl.ts`).
2. **B** (`HomePage.tsx` id attribute + `Pages.css` touch nothing A owns).
3. **C** (expected conflict: `components/chat/chatControl.ts` — verify C's copy is byte-identical to A's merged version, then take A's; any other conflict = boundary crossed → investigate before resolving).

After each merge: `npx vitest run` + `npm run lint` green on `main` before the next.

## Post-merge verification (coordinator, run once after all merges)

- [ ] `npx vitest run` green on `main`
- [ ] `npm run lint` green
- [ ] `npx playwright test` green (port 3000 free)
- [ ] Browser, dev build: 390×844 landing on `/` — grounding badge fully above fold, no horizontal scroll
- [ ] Browser: 1440×800 landing on `/` — exhibit position unchanged vs. production today
- [ ] Browser: `/experience` — labeled pill visible in first viewport; opens panel; Escape closes; focus returns to pill
- [ ] `/projects` "Ask about this" opens panel with starter sent
- [ ] Keyboard-only pass on `/experience` (Tab reaches pill with visible focus ring)
- [ ] `prefers-reduced-motion`: no pulse animation
- [ ] All 3 themes (modern/cli/ascii): pill + links legible, footers not covered on mobile
- [ ] Collect all `[!]` items from PR bodies; implement or list as follow-ups
