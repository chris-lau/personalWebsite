# "Ask Chris" — Chat-First Home Page Plan

**Status:** Approved (incorporates plan review feedback)
**Date:** 2026-08-21

## Goal

Invert the site hierarchy: instead of a text-heavy home page, the primary experience is a
chat interface where visitors ask an AI about Chris. Visitors who don't want to type can
click suggested-question chips, which send the question and stream a short answer.
Traditional reading pages (About, Projects, Blog, etc.) become secondary, demoted to a
quiet "prefer reading?" link row.

## Design

```
┌─────────────────────────────────────────────────────────────┐
│  Chris Lau                                            [≡]   │
│                                                             │
│         [ 🟢 Grounded on Chris's live experience & work ]   │
│                                                             │
│                            Chris Lau                        │
│            Staff Product Manager, AI & Technical Leader     │
│                                                             │
│   ┌───────────────────────────────────────────────────┐     │
│   │  💬 [ Ask me anything about my work & systems… ]   │     │
│   └───────────────────────────────────────────────────┘     │
│                                                             │
│   Try asking:                                               │
│   ( 🚀 Biggest project? )    ( 🧠 AI leadership & exp )     │
│   ( 🛠️ Core tech stack? )    ( 📍 Working on now? )         │
│                                                             │
│   ── or explore directly ──                                 │
│   [About] [Projects] [Experience] [Blog] [Now] [GitHub] [LI]│
└─────────────────────────────────────────────────────────────┘
```

- **Chat replaces hero** — the chat input is the hero; answers stream inline (SSE already works).
  Hero headline is streamlined and brings the input prompt front and center.
- **Chips = one-click chat** — clicking a suggested question sends it and streams a short AI
  answer with "read more" links. Zero typing, still conversational.
- **Unified Exploration Dock** — an integrated responsive dock under the chat combines
  reading paths with social profiles; existing pages untouched.
- **Theme-aware** — the embedded chat uses the existing design tokens, so it re-skins across
  modern / ascii / cli layouts automatically. CLI theme gets a natural terminal-chat look.

## Existing infrastructure being reused

| Piece | Location | Notes |
|---|---|---|
| Grounded chat API | `backend/api/endpoints/chat.py` | SSE streaming, RAG-style system prompt from profile/experience/posts/guidebooks, rate + daily caps, multi-provider (Gemini/DeepSeek/OpenAI) |
| Chat hook | `frontend/src/hooks/useChat.ts` | Streaming, model switching, fallback handling |
| Floating widget | `frontend/src/components/chat/ChatWidget.tsx` | Token-styled, but fixed-position shell — needs extraction of embeddable panel |
| API client | `frontend/src/api/backend.ts` | `sendChatMessage` / `fetchChatModels` with SSE parsing |

## Implementation phases

### Phase 1 — Backend grounding (`backend/api/endpoints/chat.py`)

- Add `projects.json`, `skills.json`, **and `now.json`** to `_build_context()`. Currently
  these are missing, so "what have you built?" and "what are you into now?" (a starter
  chip) would be answered poorly. Field names for accuracy: `projects.json` entries have
  `title` / `description` / `techStack` / `githubUrl` / `featured` (no tagline/highlights
  fields); `skills.json` is a list of categories each with `skills` (string array) and
  `detailedSkills` (`{name, level}`). (`site_architecture.json` optional bonus.)
- Update `_SYSTEM_PROMPT_TEMPLATE`: answers should be short (~120 words), conversational,
  and end with a "Read more:" line. **Link allowlist** — instruct the model to link only
  to these routes: About → `/about`, Projects → `/projects`, Now → `/now`, blog posts →
  `/blog/{slug}` (exact slug from context), plus `/experience` and `/guidebook`. This
  prevents hallucinated "Read more:" URLs.
- Keep the `@lru_cache` (content changes require redeploy — same as today; document it).

### Phase 2 — Frontend: extract an embeddable chat panel

- New `frontend/src/components/chat/ChatPanel.tsx` reusing `ChatWidget.css` classes:
  messages / starter chips / input only — no fixed positioning, no launcher, no
  companion-mode/observability (that stays owned by the floating `ChatWidget` so the home
  hero stays clean). Props: `starterQuestions?: string[]`, `className?: string`,
  `showGreeting?: boolean`.
- Loading state while models/fallback resolve: the floating widget currently renders
  `null` in that window, which is fine for a launcher but wrong for a hero centerpiece —
  the embedded `ChatPanel` should show a skeleton/spinner (input disabled) until
  `models.length > 0 || isFallback`.
- Add an embedded modifier class (e.g. `chat-panel--embedded`) that overrides the
  widget-tuned `max-height: 400px` on `.chat-panel__messages` with
  `min(420px, 50vh)` + auto-scroll.
- Starter questions currently live as an inline `STARTER_QUESTIONS` const in
  `ChatWidget.tsx` (lines 9–14) — extract to `frontend/src/components/chat/starters.ts`,
  exportable.
- Refactor `ChatWidget.tsx` to render `<ChatPanel>` inside its floating shell — floating
  behavior unchanged.

### Phase 2b — Router-aware markdown links

- Render assistant messages with the existing `MarkdownRenderer`
  (`frontend/src/components/markdown/MarkdownRenderer.tsx`) via a new `chat` variant —
  **not** raw `react-markdown` — so the router-aware link rule lives in one place:
  relative hrefs (`href.startsWith('/')`) render as React Router `<Link>` (no hard
  reload, chat state preserved); external links open in a new tab. Applies to both
  embedded and floating variants.

### Phase 3 — Chat-first HomePage (`frontend/src/pages/HomePage.tsx`)

- Replace hero with AI Command Center: live grounding badge + streamlined headline (`Name` + `Title`) + `BoxContainer`-wrapped `ChatPanel`.
- Curated intent-driven chips: "What is Chris's biggest project?", "Tell me about his AI leadership & experience", "What is his core tech stack?", "What is he working on now?".
- Render assistant content via the `chat` variant of `MarkdownRenderer` so "read more" links are clickable.
- Add unified `── or explore directly ──` dock below the chat combining site routes and external social links (`LinkedIn ↗`, `GitHub ↗`).
- Layout details: `.chat-panel__messages` gets `max-height: min(460px, 55vh)` with auto-scroll; input font-size ≥16px on mobile (iOS zoom prevention); starter chips as elevated pills with hover lift.
- Keep featured projects / skills sections below the fold for scannability.

### Phase 4 — Avoid double chat on home

- `ChatWidget` (mounted globally in `App.tsx`) hides itself on `/` via `useLocation()`
  check, so the home page has exactly one chat surface. Histories remain separate
  (acceptable; shared state out of scope).

### Phase 5 — Tests

- Vitest: `ChatPanel` renders starters, sends on chip click, streams tokens; `ChatWidget`
  hidden on `/`. Update existing widget tests broken by the refactor.
- Backend: assert projects/skills appear in the built system prompt.

## Out of scope (follow-ups)

- Chip-click / question telemetry logging (would need a new POST events endpoint)
- Shared conversation state between hero chat and floating widget
- Cache-busting the chat context when content JSON changes
- **Post-launch:** watch `CHAT_DAILY_GLOBAL_LIMIT` — home-page starter chips will
  increase chat usage; revisit the daily budget if visitors hit the 429 cap.
