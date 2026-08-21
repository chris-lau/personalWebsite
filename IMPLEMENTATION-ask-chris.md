# "Ask Chris" — Implementation Tracker

Companion to [ask-chris-home-plan.md](./ask-chris-home-plan.md). Update this file as
each item lands.

**Legend:** [x] done · [ ] todo · [~] in progress / partially done

**Status: COMPLETE — merged via PR #11 (follow-ups tracked in issue #12).**

---

## Phase 1 — Backend grounding (`backend/api/endpoints/chat.py`)

- [x] Add `projects.json`, `skills.json`, `now.json` to `_build_context()`
- [x] System prompt: short answers (~120 words) + "Read more:" link allowlist
      (`/about`, `/projects`, `/now`, `/blog/{slug}`, `/experience`, `/guidebook`)
- [x] Backend test: assert projects/skills/now appear in `_build_system_prompt()`

## Phase 2 — Frontend: extract embeddable `ChatPanel`

- [x] Create `frontend/src/components/chat/ChatPanel.tsx`
      (messages + starter chips + input + degraded banner; props: `starterQuestions`,
      `className`, `showGreeting`)
- [x] Extract `STARTER_QUESTIONS` from `ChatWidget.tsx:9-14` to `starters.ts`
- [x] Loading state (skeleton/disabled input) while `models`/`isFallback` resolve
- [x] `chat-panel--embedded` CSS modifier: `max-height: min(420px, 50vh)` + auto-scroll,
      overriding the widget's `400px`
- [x] Refactor `ChatWidget.tsx` to wrap `ChatPanel` (companion mode/observability stays
      in the widget shell)

## Phase 2b — Router-aware markdown links

- [x] Add `chat` variant to `MarkdownRenderer.tsx` (relative hrefs → React Router
      `<Link>`; external → new tab)
- [x] Use it for assistant messages in `ChatPanel` (covers embedded + floating)

## Phase 3 — Chat-first HomePage & AI Command Center Redesign

- [x] Hero: live grounding badge + streamlined headline (`Name` + `Title`) + `BoxContainer`-wrapped
      `ChatPanel` with curated intent starters ("What is Chris's biggest project?",
      "Tell me about his AI leadership & experience", "What is his core tech stack?", "What is he working on now?")
- [x] Unified `── or explore directly ──` dock below the chat combining internal reading routes and social profiles (`GitHub ↗`, `LinkedIn ↗`)
- [x] Starter chips as elevated pills with hover lift; input ≥16px on mobile (iOS zoom)
- [x] Dead CSS sweep: removed orphaned `.hero-links` rules
- [x] Semantic a11y: refined grounding badge markup without non-standard `aria-label`
- [x] Keep featured projects / skills sections below the fold

## Phase 4 — De-dupe chat surfaces

- [x] `ChatWidget` renders null on `/` (`useLocation()` check)

## Phase 5 — Tests & Verification

- [x] Vitest: `ChatPanel` renders starters, chip click sends, tokens stream
- [x] Vitest: `ChatWidget` hidden on `/`; all 192 tests passing across 25 suites
- [x] Pytest: projects/skills/now in system prompt (mirrors Phase 1 item)
- [x] Production build: `tsc && vite build` completes cleanly with 0 errors

---

## Out of scope (follow-ups)

- Chip-click / question telemetry endpoint
- Shared conversation state between hero chat and floating widget
- Chat-context cache-busting on content change
- Post-launch: watch `CHAT_DAILY_GLOBAL_LIMIT` (home chips increase usage)
