# Track A Progress: Launcher & chat open API

## Status Checklist

- [x] Create `chatControl.ts` with frozen source
- [x] Implement launcher pill (ChatWidget.tsx + ChatWidget.css)
- [x] Implement pulse etiquette with localStorage and prefers-reduced-motion
- [x] Implement a11y features (Escape closes, focus returns to launcher)
- [x] Implement `chat:open` event listener in ChatWidget.tsx
- [ ] Add mobile footer clearance in 3 layout CSS files
- [ ] Update ChatWidget.test.tsx with new accessible names and test cases
- [ ] Create E2E test `e2e/chat-launcher.spec.ts` (if port 3000 free)
- [ ] Push and create PR to main

## Log

### 2026-08-22 - Initial setup and progress tracking
- Created PROGRESS.md with Track A checklist
- Verified worktree is on correct branch (feat/chat-launcher)
- Ready to begin implementation phases

### 2026-08-22 - Phase 1: chatControl.ts
- Created `chatControl.ts` with frozen source (OpenChatOptions interface, CHAT_OPEN_EVENT, openChat function, isChatOpenEvent type guard)

### 2026-08-22 - Phase 2: Launcher pill
- Updated ChatWidget.tsx: changed from circle button to pill with MessageCircle icon + "Ask this site" full label + "Ask" short label, removed aria-label, kept aria-expanded
- Updated ChatWidget.css: changed dimensions from circle (3.25rem) to pill (height: 3rem, padding: 0 1rem), added gap for icon+label, added label styling with responsive behavior (≤480px shows short label, hides full)
- All tests passing (25 test suites / 200+ tests)

### 2026-08-22 - Phase 3: Pulse etiquette
- Added CHAT_OPENED_ONCE_KEY constant and showPulse state to ChatWidget.tsx
- Pulse shows only when localStorage.getItem('chat_opened_once') === null
- Sets 'chat_opened_once' flag on first panel open (any path)
- Wrapped .chat-launcher__pulse and @keyframes chat-pulse in @media (prefers-reduced-motion: no-preference)
- Tests failing as expected (accessible name changed from "Open chat" to "Ask this site" - will be fixed in Phase 7)

### 2026-08-22 - Phase 4: A11y features
- Added launcherRef to track launcher button element
- Added Escape key handler to close panel and return focus to launcher
- Added useEffect to return focus to launcher when panel closes (any path) with 50ms delay
- Added ref to launcher button element

### 2026-08-22 - Phase 5: chat:open event listener
- Imported CHAT_OPEN_EVENT, isChatOpenEvent, and OpenChatOptions from chatControl
- Added useEffect with window.addEventListener for chat:open events (placed before early return null guards)
- Handler: if pathname === '/' scrolls to #ask-this-site; otherwise opens panel and sends starter message if provided
- Added guard against double-send with messageIsStreaming check and 100ms delay
- Cleanup on unmount with removeEventListener

