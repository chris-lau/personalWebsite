# Chat Observability — Companion Mode

> **Overall Status:** COMPLETE — All 7 phases implemented and tested.
> **Branch:** `feat/chat-observability` (merged to `main`)
> **Last updated:** 2026-08-15

## Summary

Add a real-time observability dashboard to the AI chat widget, transforming it into a **companion mode** split-panel layout (chat left, observability right). On mobile, it collapses to a tab toggle. The backend is updated to emit real token usage data via SSE, and the frontend measures TTFT, streaming throughput, and per-message cost.

---

## What the visitor sees

Today the chat widget is a single column: messages and an input box. With this feature, an `Activity`-icon toggle in the header opens a right-hand **observability panel** (desktop side-by-side; mobile swaps between Chat / Observability tabs). Once open, every assistant reply is instrumented end-to-end. A visitor who sends "Summarize the React architecture post" sees, alongside the streamed answer:

- **A session summary card** at the top of the panel — running totals across the conversation: message count, total prompt + completion tokens, accumulated estimated cost (USD), average TTFT, and average full-stream duration. Each label carries a plain-English `title` tooltip ("Time to First Token — how long between pressing Send and receiving the first word from the model"), so non-engineers learn the concepts by hovering, not by reading docs. When two or more different models have been used, a comparison line surfaces per-model averages ("gemini-2.5-flash: ~210ms TTFT vs deepseek-chat: ~450ms TTFT") so visitors can see the tradeoff with their own eyes.
- **A latency sparkline** — one color-coded bar per assistant message (green <2s, amber <5s, red ≥5s). The most-recent bar shows its exact ms inline; older bars reveal exact values + message preview on hover/focus. This makes latency trends visible at a glance: "the last three replies are getting slower" is something a visitor can *see*, not just feel.
- **A live streaming indicator** (only while a reply is in flight) — elapsed time, SSE chunks received, and chunks/sec. An animated pulse distinguishes it from the completed metrics above.
- **A per-message metrics list** — the headline feature. Each assistant reply gets a row with: message preview, model badge, a **segmented TTFT bar** breaking first-token latency into three colored segments — network RTT (gray), server overhead / routing / prompt-build (blue), and model prefill/inference (accent) — with the total at the end. Beneath it: full-stream duration, prompt/completion tokens, decode tok/s (the streaming speed visitors actually feel), per-message estimated cost, and finish reason. This is where the "distributed tracing" pitch becomes concrete: a visitor can literally see that, say, 440ms of a 487ms TTFT was the model thinking, not the network.
- **A "Learn more" footer** linking to the existing telemetry blog post, for visitors who want the underlying concepts.

The copy and tooltips are deliberately written for a non-technical audience (recruiters, curious visitors, friends) — the goal is "you learn what TTFT and token costs *are* by playing with the chat," not "you must already know." Everything degrades gracefully: when a provider doesn't report usage, tokens fall back to a clearly-labeled estimate; when the backend can't supply server timings, the segmented bar collapses to a single client-side segment with an honest label.

---

## Value delivered by each phase

Each phase is independently shippable and produces a concrete, reviewable artifact — no phase is pure scaffolding.

| Phase | Status | Ships | What you get |
|---|---|---|---|
| **1. Backend SSE** | ✅ Complete | Real token usage + server timing in the stream | Honest data foundation. `usage` events give true prompt/completion token counts (not estimates) for OpenAI + DeepSeek; the two-segment `meta_server` (pre-LLM overhead, LLM-to-first-token) is what makes the TTFT *decomposition* possible rather than a single opaque number. Provider-aware `stream_options` means we never 400 on Gemini. Testable in isolation via the SSE wire format. |
| **2. Types** | ✅ Complete | `ChatMessageMetrics`, `ChatSessionSummary`, `StreamProgress` | A typed contract the rest of the frontend compiles against. Defines the effective-vs-decode throughput split and the div-by-zero guards up front, so no later phase silently ships `Infinity tok/s`. |
| **3. Data layer** | ✅ Complete | Timed, metric-emitting `sendChatMessage` | The one function that turns a raw SSE byte stream into a `ChatMessageMetrics` object — TTFT measured at the first non-empty token, `meta`/`meta_server`/`usage` parsed, fallback token estimation when usage is absent. After this phase you can `console.log` full per-message metrics from the console even with no UI. |
| **4. `useChat` hook** | ✅ Complete | Observability state in the hook | `metricsMap` accumulates per-message metrics; `streamProgress` drives the live readout via chunk-counting refs (honest "chunks/sec"); cleanup on abort/unmount/clear prevents leaks and stale UI. The hook remains the single source of truth for message execution — the panel is a pure render of its state. |
| **5. Observability panel** | ✅ Complete | The visual dashboard itself | Everything in "What the visitor sees" above: session card, sparkline, live indicator, per-message list with the segmented TTFT bar. This is the phase that turns numbers into insight — the segmented bar is what teaches a visitor *where* latency lives. Empty state included so it never looks broken on first open. |
| **6. Companion layout** | ✅ Complete | The split-panel UX + mobile tabs | Wires the panel into `ChatWidget` behind a persisted toggle, with smooth width transition, independent column scrolling, model-aware mobile tabs (full ARIA tablist wiring), and the companion-class fix that actually widens the panel. After this phase the feature is user-facing and complete. |
| **7. Tests** | ✅ Complete | Regression coverage for every claim above | Backend: structured events, provider-aware `stream_options`, usage-chunk handling, server-timing capture. Frontend: SSE parsing + both throughput fields, chunk-vs-token honesty, `clearChat` reset, companion-class application, tab-driven column switching. Guards specifically against the bugs caught in review (stale summary after clear, broken mobile tabs, Infinity throughput). 180/180 Vitest passing. |

**Recommended phasing for review:** Phases 1–4 can land as one backend+data PR (no visible UX change, fully testable). Phase 5 is a self-contained component PR (develop against a fixture `metricsMap`). Phase 6 is the integration PR that turns it on for users. Phase 7 spans all three but each test file should land with the code it covers.

---

## Phase 1: Backend — Emit real token usage in SSE stream

**File: `backend/api/endpoints/chat.py`**

### 1a. Refactor `_generate_stream` to yield structured dicts

Change the return type from `AsyncIterator[str]` (raw token strings) to `AsyncIterator[dict[str, Any]]` (structured events):

```python
async def _generate_stream(
    client: AsyncOpenAI,
    model: str,
    system_prompt: str,
    history: list[ChatMessage],
    user_message: str,
) -> AsyncIterator[dict[str, Any]]:
```

This keeps the generator cleanly testable via monkeypatching — tests inject plain dicts instead of pre-serialized SSE strings. The `event_stream()` wrapper in `chat()` calls `_sse(event)` on every yielded dict.

### 1b. Pass `stream_options` only for compatible providers

`stream_options={"include_usage": True}` is an OpenAI-compatible extension. Support varies by provider and is verified as of 2026-08: OpenAI ✅, DeepSeek ✅ (documented OpenAI-compatible behavior), Gemini's OpenAI bridge ❌ (rejects with 400). Rather than a try/except retry (which wastes a round-trip), look it up in a provider-capability table so each provider's status is explicit and easy to update:

```python
# Provider capability flags — update as providers add support.
# Verified 2026-08-10: DeepSeek documents OpenAI-compatible stream_options;
# Gemini's /v1beta/openai bridge does NOT accept it (returns HTTP 400).
PROVIDER_SUPPORTS_USAGE: dict[str, bool] = {
    "openai": True,
    "deepseek": True,
    "gemini": False,
}

provider = _provider_for_model(model_id)
use_stream_options = PROVIDER_SUPPORTS_USAGE.get(provider, False)

stream = await client.chat.completions.create(
    model=model,
    messages=messages,
    stream=True,
    **({"stream_options": {"include_usage": True}} if use_stream_options else {}),
)
```

This makes `deepseek` use usage reporting (it supports it), while correctly skipping it for `gemini`. Defaults to `False` for any future unknown provider so we never trigger a 400 on an untested bridge.

### 1c. Iterate chunks safely — extract usage from the empty-choices chunk

The current code already guards the `choices` access (`chat.py:227`: `delta = chunk.choices[0].delta.content if chunk.choices else None`) — so there's no pre-existing IndexError. **However**, enabling `stream_options={"include_usage": True}` (1b) causes the provider to send a *final* chunk with `choices=[]` and `usage` populated. That chunk carries no token text but does carry the usage data we want, so we must read `usage` from it. Add explicit usage extraction alongside the existing token extraction:

```python
last_finish_reason: str | None = None
usage_data: dict | None = None

async for chunk in stream:
    # Token extraction (existing guard handles choices=[] chunk safely)
    if chunk.choices:
        delta = chunk.choices[0].delta.content if chunk.choices[0].delta else None
        finish_reason = chunk.choices[0].finish_reason
        if finish_reason:
            last_finish_reason = finish_reason
        if delta:
            yield {"token": delta}

    # Usage rides on the final empty-choices chunk when stream_options is set.
    # `usage` is always defined on ChatCompletionChunk (Optional), so check it
    # directly rather than via hasattr (which is always True for SDK dataclasses).
    if chunk.usage:
        usage_data = {
            "prompt_tokens": chunk.usage.prompt_tokens,
            "completion_tokens": chunk.usage.completion_tokens,
            "total_tokens": chunk.usage.total_tokens,
        }

# Emit metadata and usage after the token stream completes
if last_finish_reason:
    yield {"meta": {"finish_reason": last_finish_reason, "model": model}}
if server_pre_llm_ms is not None or server_llm_to_first_token_ms is not None:
    yield {"meta_server": {
        "server_pre_llm_ms": server_pre_llm_ms,
        "server_llm_to_first_token_ms": server_llm_to_first_token_ms,
    }}
if usage_data:
    yield {"usage": usage_data}
```

Note: `server_pre_llm_ms` and `server_llm_to_first_token_ms` are produced in 1d. The `meta_server` event is emitted only if at least one server timing was recorded.

### 1d. Emit two server-side timing segments for TTFT decomposition

To honestly deliver the "distributed tracing" concept, the client must be able to decompose `ttft_client_ms` into three segments:

```
ttft_client_ms ≈ network RTT + server_pre_llm_ms + server_llm_to_first_token_ms
```

- **`server_pre_llm_ms`** — server overhead *before* the LLM call (rate limiter, FastAPI routing, request parsing, `_get_client()`, `_build_system_prompt()`). This runs in the request handler, so `request_start` **must be captured at the very top of `chat()`** — not inside `event_stream()`, which is defined after `_get_client()` and `_build_system_prompt()` have already run (`chat.py:270-272`). Capturing it inside `event_stream()` would silently miss everything we claim to measure.
- **`server_llm_to_first_token_ms`** — actual LLM inference time to first token, measured inside the chunk loop from the moment `.create()` returns to the first chunk.

Both are captured with a single `time.monotonic()` clock and threaded into `_generate_stream` as arguments.

**In `chat()`** (the handler) — capture `request_start` at the very top, and `llm_start` immediately before the client call:

```python
import time as _time

@router.post("/chat", summary="Stream a Chat Reply (SSE)")
@limiter.limit(f"{settings.CHAT_RATE_LIMIT_PER_MINUTE}/minute")
async def chat(request: Request, payload: ChatRequest):
    request_start = _time.monotonic()  # captured FIRST — rate limiter already ran in decorator

    models = _configured_models()
    if not models:
        raise HTTPException(status_code=503, detail="...")
    model_id = payload.model or settings.CHAT_DEFAULT_MODEL
    client = _get_client(model_id)            # included in server_pre_llm_ms
    system_prompt = _build_system_prompt()    # included in server_pre_llm_ms
    request_id = getattr(request.state, "request_id", "unknown")

    async def event_stream() -> AsyncIterator[str]:
        try:
            async for event in _generate_stream(
                client, model_id, system_prompt, payload.history, payload.message,
                request_start=request_start,  # threaded in
            ):
                yield _sse(event)
            yield _sse({"done": True})
        except Exception as exc:
            logger.error("[request_id=%s] chat stream error: %s", request_id, exc)
            yield _sse({"error": "The model returned an error. Please try again."})
    ...
```

**In `_generate_stream()`** — record `llm_start` before `.create()`, first-chunk time inside the loop, and emit both as a `meta_server` event:

```python
async def _generate_stream(
    client: AsyncOpenAI,
    model: str,
    system_prompt: str,
    history: list[ChatMessage],
    user_message: str,
    *,
    request_start: float,  # monotonic timestamp from chat()
) -> AsyncIterator[dict[str, Any]]:
    messages = [...]  # existing build

    # Provider-aware stream_options (defined here, in scope — see 1b for the table)
    provider = _provider_for_model(model)
    use_stream_options = PROVIDER_SUPPORTS_USAGE.get(provider, False)

    llm_start = _time.monotonic()
    stream = await client.chat.completions.create(
        model=model, messages=messages, stream=True,
        **({"stream_options": {"include_usage": True}} if use_stream_options else {}),
    )

    server_pre_llm_ms: float | None = None
    server_llm_to_first_token_ms: float | None = None
    first_chunk = True

    async for chunk in stream:
        if first_chunk:
            now = _time.monotonic()
            server_pre_llm_ms = (llm_start - request_start) * 1000
            server_llm_to_first_token_ms = (now - llm_start) * 1000
            first_chunk = False
        # ... token + usage extraction (see 1c) ...

    # meta_server emitted alongside meta/usage at the end of the stream
    if server_pre_llm_ms is not None or server_llm_to_first_token_ms is not None:
        yield {"meta_server": {
            "server_pre_llm_ms": server_pre_llm_ms,
            "server_llm_to_first_token_ms": server_llm_to_first_token_ms,
        }}
```

**Note on `_build_context()` overhead:** `_build_context()` is `@lru_cache(maxsize=1)` so after the first request it's a cache hit (microseconds). However, `_build_system_prompt()` (`chat.py:194`) is **not** cached — it runs `_SYSTEM_PROMPT_TEMPLATE.format(context=_build_context())` every request, copying the full context string. That real per-request CPU cost is now correctly included in `server_pre_llm_ms`, which is why `request_start` must be captured before it runs.

This is two timestamps plus one in-loop timestamp — enough to demonstrate distributed tracing without OpenTelemetry overhead.

### 1e. `event_stream()` wrapper — see 1d for the code

The full `event_stream()` implementation (with `request_start=request_start` threaded through) is given in 1d — it's shown there rather than here because `request_start` must be captured at the top of `chat()` and the wrapper must pass it along, so the two belong together. Don't reintroduce a second copy: the prior version of this section showed a stale `event_stream()` that omitted the `request_start` kwarg and would raise `TypeError` against the keyword-only signature in 1d.

**SSE wire format (updated):**

| Event | Wire format | Meaning |
|---|---|---|
| Token chunk | `data: {"token": "..."}\n\n` | Incremental reply text |
| Metadata | `data: {"meta": {"finish_reason": "stop", "model": "..."}}\n\n` | Generation metadata (emitted after tokens) |
| Server timing | `data: {"meta_server": {"server_pre_llm_ms": N, "server_llm_to_first_token_ms": N}}\n\n` | Two server-side segments: pre-LLM overhead (rate limiter, routing, prompt build) and LLM inference to first token |
| Usage | `data: {"usage": {"prompt_tokens": N, "completion_tokens": N, "total_tokens": N}}\n\n` | Token counts (only for providers that support `stream_options`) |
| Stream complete | `data: {"done": true}\n\n` | Terminal sentinel |
| Mid-stream error | `data: {"error": "..."}\n\n` | Failure after headers sent |

**File: `backend/tests/test_chat.py`**

### 1f. Update tests — split by what each test needs to observe

The existing tests monkeypatch `_generate_stream` itself (e.g. `_fake_stream` at `test_chat.py:34`). That approach works for verifying the **event shape** but **cannot** exercise the provider-aware `stream_options` decision or the usage-chunk extraction, because both live *inside* `_generate_stream` and are skipped entirely when the whole function is replaced. Split the tests accordingly:

**1. Event-shape tests (keep monkeypatching `_generate_stream`):** Update the existing happy-path test to assert the new structured event sequence. The injected fake now yields dicts:

```python
async def _fake_stream(*args, **kwargs):
    yield {"token": "Hello"}
    yield {"token": ", "}
    yield {"token": "world!"}
    yield {"meta": {"finish_reason": "stop", "model": "gemini-2.5-flash"}}
    yield {"meta_server": {"server_pre_llm_ms": 2.1, "server_llm_to_first_token_ms": 180.4}}
    yield {"usage": {"prompt_tokens": 100, "completion_tokens": 5, "total_tokens": 105}}
```

The SSE-level test then parses the stream and asserts tokens, `meta`, `meta_server`, and `usage` all arrive in order before `done`.

**2. Provider-aware `stream_options` + usage extraction tests (mock the client, NOT `_generate_stream`):** These must exercise the real `_generate_stream` body, so monkeypatch `chat._get_client` to return a fake AsyncOpenAI whose `chat.completions.create` returns a canned async iterator of fake `ChatCompletionChunk`-like objects. Then assert on the `create(...)` **kwargs** captured by the fake:

- For `gpt-4o-mini` and `deepseek-chat`: assert `kwargs["stream_options"] == {"include_usage": True}`
- For `gemini-2.5-flash`: assert `"stream_options" not in kwargs`
- Include a final chunk with `choices=[]` and `usage` populated in the fake stream, and assert the yielded `usage` dict is correct (no IndexError)

This requires building lightweight fake chunk objects (e.g. `types.SimpleNamespace(choices=[...], usage=None)`), which is standard for OpenAI SDK testing. Do **not** mock `_generate_stream` for these cases or the assertions become tautological.

---

## Phase 2: Frontend types

**File: `frontend/src/types/chat.ts`**

Add:

```typescript
export interface ChatMessageMetrics {
  ttft_client_ms: number;        // Client-side time to first non-empty token (fetch → first rendered token)
  server_pre_llm_ms: number | null;       // Server overhead before LLM call (rate limiter, routing, prompt build); null if backend didn't report
  server_llm_to_first_token_ms: number | null; // LLM inference time to first token; null if backend didn't report
  total_duration_ms: number;    // Full stream duration from fetch() to last chunk
  prompt_tokens: number | null; // From backend (null if provider doesn't support usage reporting)
  completion_tokens: number | null;
  total_tokens: number | null;
  model: string;
  finish_reason: string | null;
  estimated_cost_usd: number;    // Calculated from pricing table
  // Effective throughput: completion_tokens across the full stream duration (incl. TTFT).
  // Labeled "effective" in UI to distinguish from pure decode speed.
  effective_tokens_per_second: number;
  // Decode throughput: completion_tokens across decode phase only (total_duration - ttft).
  // This is the real streaming speed visitors perceive during generation.
  decode_tokens_per_second: number;
  token_count_estimated: boolean; // true if we fell back to word-count estimation
}

export interface ChatSessionSummary {
  message_count: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_estimated_cost_usd: number;
  avg_ttft_client_ms: number;
  avg_duration_ms: number;
  latency_history: number[];  // Per-message total_duration_ms for sparkline
}

export interface StreamProgress {
  elapsed_ms: number;
  chunks_received: number;     // SSE deltas received (NOT tokens — one delta may span multiple/partial tokens)
  chunks_per_sec: number;      // renamed from tokens_per_sec for honesty; "chunks" in live UI
}
```

**Note on the throughput split:** `effective_tokens_per_second = completion_tokens / (total_duration_ms / 1000)` matches the old formula (useful as an end-to-end rate). `decode_tokens_per_second = completion_tokens / ((total_duration_ms - ttft_client_ms) / 1000)` excludes the prefill/TTFT phase and reflects the model's actual decode speed — the number visitors "feel" as fast or slow streaming. Show `decode_tokens_per_second` as the primary streaming-speed metric; `effective` is available for the per-message detail. Both require real `completion_tokens`, so for estimated-token messages they are reported as `0` and the UI notes the estimate.

**Guard against division-by-zero (`Infinity` / `NaN`):** For very short real replies (e.g. a one-token "Yes") or fast mock streams in tests, `total_duration_ms` can equal `ttft_client_ms`, making the decode denominator `0`. With real `completion_tokens > 0` this yields `Infinity`; with zero tokens it yields `NaN`. Clamp both denominators to a minimum before dividing:

```typescript
const DECODE_FLOOR_SEC = 0.05;  // 50ms — anything shorter is measurement noise
const effectiveDenom = Math.max(DECODE_FLOOR_SEC, total_duration_ms / 1000);
const decodeDenom = Math.max(DECODE_FLOOR_SEC, (total_duration_ms - ttft_client_ms) / 1000);
const effective_tokens_per_second = completion_tokens ? completion_tokens / effectiveDenom : 0;
const decode_tokens_per_second = completion_tokens ? completion_tokens / decodeDenom : 0;
```

The `completion_tokens ?` guard keeps both fields `0` (not `NaN`) for the estimate case, and the `Math.max` floor keeps them finite for the short-real-reply case. Round to 1 decimal place for display.

---

## Phase 3: Frontend data layer — timing + SSE parsing

**File: `frontend/src/api/backend.ts`**

### 3a. Update `sendChatMessage` signature (BREAKING — migrate call site + tests)

Current signature (`backend.ts:125`): `(req, onToken) => Promise<ChatStreamResult>`. Change to a single callbacks object so new optional callbacks don't bloat the positional args:

```typescript
export interface ChatMessageCallbacks {
  onToken: (token: string) => void;
  onFirstToken: () => void;     // Called once on first non-empty token (for TTFT)
  onComplete: (metrics: ChatMessageMetrics) => void;  // Called when stream finishes
}

export async function sendChatMessage(
  req: ChatRequest & { signal?: AbortSignal },
  callbacks: ChatMessageCallbacks,
): Promise<ChatStreamResult> {
```

**Migration impact (call sites must change in the same commit):**
- `frontend/src/hooks/useChat.ts:83` — the one production call site, updated in Phase 4b
- `frontend/src/api/backend.test.ts:221,233,249,260` — four test call sites; each currently passes `(req, onToken)`. Update to `(req, { onToken, onFirstToken, onComplete })` shape (the new callbacks can be no-op spies where the test doesn't care)
- `frontend/src/hooks/useChat.test.ts:59` — the mock implementation `(msg, onToken) => onToken(...)` must change to `(msg, { onToken }) => onToken(...)` or it'll throw on destructuring

The test files are already listed in the File Change Summary, but flag this as a deliberate coordinated change so no commit ships a broken intermediate state.

### 3b. Add timing instrumentation

- Record `startTime = performance.now()` immediately before calling `fetch()`
- In the SSE parse loop, on the first **non-empty** token event (`obj.token && obj.token.trim().length > 0` and `!firstTokenRecorded`), record `firstTokenTime = performance.now()` and call `onFirstToken()`
- **Guard against empty tokens**: Some providers send whitespace-only or empty string chunks — these must not count as "first token" for TTFT measurement
- On stream completion (`done` event or stream end), record `endTime = performance.now()`

**Note on `ttft_client_ms` decomposition:** This measures from the client's `fetch()` call to the first rendered token, so it includes network RTT. The backend's `meta_server` event (1d) provides the two server-side segments that, combined with client-side RTT, fully decompose `ttft_client_ms`:

```
ttft_client_ms ≈ network_rtt_ms + server_pre_llm_ms + server_llm_to_first_token_ms
```

`network_rtt_ms` is implied: `ttft_client_ms - server_pre_llm_ms - server_llm_to_first_token_ms`. Show all four numbers in the per-message detail so visitors see exactly where time goes.

### 3c. Parse new SSE event types

Expand the `JSON.parse` handler to recognize the new event types alongside existing `token`, `done`, `error`:

```typescript
const obj = JSON.parse(payload) as {
  token?: string;
  done?: boolean;
  error?: string;
  meta?: { finish_reason: string; model: string };
  meta_server?: { server_pre_llm_ms: number; server_llm_to_first_token_ms: number };
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};
```

Accumulate `meta` and `usage` data as they arrive. After the stream completes, build a `ChatMessageMetrics` object from timing + parsed backend data. The two `meta_server` fields map directly to the two server-side segments in `ChatMessageMetrics` (1d).

### 3d. Fallback token estimation

If `usage` was never received from the backend (provider doesn't support `stream_options`), estimate tokens from the final assistant message content:

```typescript
// Rough estimate: ~1.33 tokens per word for English text
const estimatedTokens = Math.round(content.split(/\s+/).filter(w => w.length > 0).length * 1.33);
```

Set `token_count_estimated = true` in the metrics so the UI can mark these as "(est.)".

**File: `frontend/src/api/config.ts`**

### 3e. Add `MODEL_PRICING` lookup table with safe fallback

Per-1M-token input/output costs for cost estimation. Guard all lookups against unknown model IDs:

```typescript
const DEFAULT_PRICING = { input_per_1m: 0, output_per_1m: 0 };

export const MODEL_PRICING: Record<string, { input_per_1m: number; output_per_1m: number }> = {
  'gemini-2.5-flash':    { input_per_1m: 0.15,   output_per_1m: 0.60 },
  'deepseek-chat':       { input_per_1m: 0.14,   output_per_1m: 0.28 },
  'deepseek-reasoner':   { input_per_1m: 0.55,   output_per_1m: 2.19 },
  'gpt-4o-mini':         { input_per_1m: 0.15,   output_per_1m: 0.60 },
};

// Safe lookup — unknown models default to free (no NaN risk)
export function getModelPricing(modelId: string) {
  return MODEL_PRICING[modelId] ?? DEFAULT_PRICING;
}
```

All cost calculations must go through `getModelPricing()` — never dereference `MODEL_PRICING[modelId]` directly.

---

## Phase 4: useChat hook — metrics + streaming state (NOT companion mode)

**Design decision:** `useChat` stays focused on message execution and metrics accumulation. UI preferences (`companionMode`, localStorage persistence) and derived computations (`sessionSummary`) live in `ChatWidget.tsx`. This avoids turning `useChat` into a monolith while keeping the mutable streaming refs close to the `sendMessage` callback where they're needed.

**File: `frontend/src/hooks/useChat.ts`**

### 4a. Add observability state

```typescript
const [metricsMap, setMetricsMap] = useState<Map<string, ChatMessageMetrics>>(new Map());
const [streamProgress, setStreamProgress] = useState<StreamProgress | null>(null);
```

**Reuse `loading`, don't add `isStreaming`.** The hook already tracks `loading` (set true before `sendChatMessage`, false after) covering exactly the streaming window. A separate `isStreaming` boolean covering the same interval would drift. The panel props use `isStreaming` as a name — pass `loading` as that prop in Phase 6 (`isStreaming={loading}`). No new boolean state is introduced.

**NOT in useChat:** `companionMode`, `sessionSummary`, localStorage persistence → these go in `ChatWidget.tsx` (Phase 6).

### 4b. Wire up callbacks

In `sendMessage`, pass the new callbacks to `sendChatMessage`:

```typescript
const result = await sendChatMessage(
  { message: trimmed, history, model: selectedModel, signal: controller.signal },
  {
    onToken: (token) => { /* existing token append logic */ },
    onFirstToken: () => { /* record TTFT */ },
    onComplete: (metrics) => { setMetricsMap(prev => new Map(prev).set(assistantMessage.id, metrics)); },
  },
);
```

### 4c. Live stream progress — ref-based to avoid stale closures and timer leaks

**Critical**: A naive `setInterval` inside `sendMessage` reading React state will capture a **stale closure** of the message content. Additionally, the interval **must** be tracked and cleared on abort/clear/unmount to prevent memory leaks.

Solution — use a mutable `useRef` for the **chunk** counter and a ref for the interval ID:

```typescript
// Refs for live progress tracking (mutable, avoid stale closures)
const chunkCountRef = useRef<number>(0);
const streamStartRef = useRef<number>(0);
const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

**Count chunks, not tokens.** `onToken` fires once per SSE delta, and a single delta frequently contains multiple or partial model tokens. Counting deltas as "tokens" would disagree with the final `decode_tokens_per_second` (which uses real `completion_tokens`). Name the live readout honestly as "chunks/sec" so the two numbers never appear to contradict each other. (If a real-time token estimate is desired later, accumulate decoded text length in the ref and divide by ~4; do not call it tokens until then.)

In `sendMessage`:

```typescript
// Reset and start progress tracking
chunkCountRef.current = 0;
streamStartRef.current = performance.now();
setLoading(true); // existing — this doubles as the panel's `isStreaming` (see 4a)

// Start progress interval (reads from refs, not state — no stale closure)
progressIntervalRef.current = setInterval(() => {
  const elapsed = performance.now() - streamStartRef.current;
  const chunks = chunkCountRef.current;
  const cps = elapsed > 0 ? (chunks / (elapsed / 1000)) : 0;
  setStreamProgress({ elapsed_ms: Math.round(elapsed), chunks_received: chunks, chunks_per_sec: Math.round(cps * 10) / 10 });
}, 500);
```

In the `onToken` callback:

```typescript
onToken: (token) => {
  chunkCountRef.current += 1; // mutable ref, no closure issue
  // ... existing state update for message content ...
},
```

**Cleanup** — clear interval in `finally` and on unmount:

```typescript
// At the end of sendMessage (in a finally-like block after await):
if (progressIntervalRef.current) {
  clearInterval(progressIntervalRef.current);
  progressIntervalRef.current = null;
}
setStreamProgress(null);
// setLoading(false) stays where it already is in sendMessage.
```

```typescript
// On unmount effect:
useEffect(() => {
  return () => {
    abortRef.current?.abort();
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };
}, []);
```

**Also reset on `clearChat`.** The existing `clearChat` (`useChat.ts:110`) resets `messages`/`error`/`isFallback` but, with the new state added, must also clear `metricsMap` and `streamProgress` so the session summary and sparkline don't show stale data next to an empty chat:

```typescript
const clearChat = useCallback(() => {
  abortRef.current?.abort();
  if (progressIntervalRef.current) {
    clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
  }
  setMessages([]);
  setMetricsMap(new Map());
  setStreamProgress(null);
  setError(null);
  setIsFallback(false);
}, []);
```

### 4d. Update `UseChatState` return type

Add new fields: `metricsMap`, `streamProgress`. (`loading` already exists and is passed to the panel as the `isStreaming` prop — no new boolean is added, per 4a.)

**NOT returned:** `companionMode`, `setCompanionMode`, `sessionSummary` — those are local to `ChatWidget.tsx`.

---

## Phase 5: ChatObservabilityPanel component ✅ COMPLETE

**New file: `frontend/src/components/chat/ChatObservabilityPanel.tsx`**

Props: `metricsMap`, `sessionSummary`, `isStreaming`, `streamProgress`, `messages` (for content previews).

Sections (top to bottom):

### A. Session Summary Card
- Total messages, total tokens (prompt + completion), total estimated cost, avg TTFT, avg duration
- Styled as a compact 2×3 metric grid matching the monitoring dashboard's `.telemetry-card` pattern
- Each metric label has a native `title` attribute tooltip explaining the concept to non-expert visitors:
  - **Avg TTFT:** `"Time to First Token — how long between pressing Send and receiving the first word from the model."`
  - **Total Tokens:** `"LLMs process text in word pieces called 'tokens' (~0.75 words each). Prompt tokens are your input; completion tokens are the model's reply."`
  - **Est. Cost:** `"Calculated live from model pricing per 1M input/output tokens. Shows real-world API cost per message."`
  - **Avg Duration:** `"Total time from sending your message to the last token arriving."`
- TTFT and duration values are color-coded with contextual status text (same thresholds as sparkline):
  - TTFT: green `Fast` (<800ms), amber `Moderate` (<2000ms), red `Slow` (≥2000ms)
  - Duration: green (<2s), amber (<5s), red (≥5s)
- **TTFT thresholds are model-aware and recalibrated to reality.** A flat "<400ms = Fast" is unreachable for the configured models over a real network — Gemini Flash first-token commonly lands 300–800ms, and `deepseek-reasoner` is in the seconds. Use the bands above for the default view, but apply a `reasoner` exception: for `deepseek-reasoner` (and any future reasoning model), relax to green (<2500ms) / amber (<5000ms) / red (≥5000ms), since its TTFT includes visible reasoning time that is inherent, not pathological. Mark the active threshold set with a `title` on the status text so visitors know which band is applied.
- Empty state when no data: "Send a message to see observability data here" with a subtle Activity icon
- **Model comparison sub-section** (conditional — only shown when ≥2 different models in session): Compute per-model averages from `metricsMap` via `useMemo`. Display as a compact comparison, e.g. `"gemini-2.5-flash: ~210ms TTFT vs deepseek-chat: ~450ms TTFT"`. This turns raw numbers into operational insights and encourages visitors to try different models.

### B. Latency Sparkline
- Pure CSS horizontal bar chart — one bar per assistant message
- Bar height proportional to `total_duration_ms`, color-coded: green (<2s), amber (<5s), red (≥5s) — boundaries match Section A exactly (no off-by-one between `>` and `≥`)
- **Value visibility (addresses mobile/touch + OS tooltip delay).** Two complementary mechanisms:
  1. **Most-recent bar: inline label always rendered.** The rightmost (latest) bar shows its ms value inline beside it (e.g. `█ 487ms`). This is the bar visitors care about most, and it guarantees at least one exact value is visible with no interaction — including on touch devices where hover doesn't exist. Older bars stay label-free so the sparkline remains a trend shape, not a data table.
  2. **All bars: CSS hover/focus tooltip via a child `<span class="bar-tooltip">` positioned with `position: absolute` inside a `position: relative` bar wrapper.** Render the tooltip *outside* the scrolling container's clip by giving the obs column `overflow-y: auto` but `overflow-x: visible` (or rendering the tooltip with `position: fixed` computed in JS on hover). This avoids both the 1–2s native `title` delay and the clipping problem the original `title`-only approach was trying to solve. Keep a `title` attribute as a *fallback* for the no-CSS/no-JS case, but the CSS tooltip is the primary.
  - Tooltip content: exact ms value + message preview (first 40 chars)
  - The bars themselves are keyboard-focusable (`tabindex="0"`) with the same tooltip on `:focus` — don't hide latency data behind mouse-only interaction

### C. Live Streaming Indicator
- Shown only when `isStreaming === true` (this prop is fed by `loading` from `useChat` — see Phase 4a/6; no separate streaming boolean)
- Displays: elapsed time, chunks received so far, chunks/sec (from `streamProgress`). Labeled "chunks/sec" honestly — `onToken` fires per SSE delta, not per model token (Phase 4c)
- Animated pulse or progress bar to make it visually distinct from completed metrics

### D. Per-Message Metrics List
- Scrollable list of assistant messages with their individual metrics (from `metricsMap`)
- Each row: message preview (truncated), model badge, TTFT, duration, tokens (prompt/completion), cost, finish_reason
- **TTFT decomposition (the headline tracing feature).** Each row's TTFT is not a flat number — it renders as a **horizontal segmented bar** showing the three components side by side, proportionally sized, color-coded:
  - `network_rtt_ms` (implied: `ttft_client_ms − server_pre_llm_ms − server_llm_to_first_token_ms`) — slate/gray
  - `server_pre_llm_ms` — blue (server overhead: routing + prompt build)
  - `server_llm_to_first_token_ms` — accent (model prefill/inference)
  - Each segment is labeled inline with its ms value when wide enough; narrow segments collapse to a single combined label on hover/focus (see sparkline tooltip decision in 5B for the hover mechanism)
  - Total TTFT shown at the right end of the bar (e.g. `487ms`)
  - `title` on the whole bar: `"TTFT breakdown — Network: 42ms | Server overhead: 4ms | Model prefill: 441ms"` (full numbers always available, even when segments are too narrow to label inline)
  - **Degraded rendering when server timings are absent** (`server_pre_llm_ms`/`server_llm_to_first_token_ms` are `null` — e.g. an older backend, or a request that errored before the first chunk): render the bar as a single `network_rtt_ms`-equivalent segment in gray with the label `TTFT 487ms (client only)` and a `title` explaining server breakdown unavailable. Never render a broken/empty bar.
  - This is the UI home for the `meta_server` data promised in 1d/3b — without it, the whole backend instrumentation has nothing to teach visitors
- Streaming speed shown as **decode tok/s** (the perceptible decode rate, `decode_tokens_per_second`); the expanded/per-message detail also surfaces `effective_tokens_per_second` (end-to-end incl. TTFT) so visitors can see how prefill drags the average. See Phase 2 for the formula split
- Tokens marked with "(est.)" suffix if `token_count_estimated === true`; in that case both throughput fields are `0` (they require real `completion_tokens`) and the row notes "throughput n/a for estimates"
- Finish reason values have a `title` tooltip: `"Why streaming stopped: 'stop' = standard completion, 'length' = hit token limit."`

### E. "Learn More" Footer
- Small callout at the bottom of the panel linking to the telemetry blog post
- Subtle styling — a single line with a lightbulb or book-open icon (from lucide-react), not a full card
- Text: `"Interested in how this telemetry works under the hood?"` followed by a link to `/blog/demystifying-full-stack-monitoring-and-telemetry`
- Only rendered when there is at least one metrics entry (don't clutter the empty state)

**New file: `frontend/src/components/chat/ChatObservabilityPanel.css`**
- All styles use CSS custom properties (`var(--*)`) for multi-theme compatibility
- Reuse patterns from the monitoring dashboard (`.telemetry-card`, `.metric-row`, status colors)

---

## Phase 6: ChatWidget companion mode layout ✅ COMPLETE

**File: `frontend/src/components/chat/ChatWidget.tsx`**

### 6a. Companion mode state + session summary (local to ChatWidget, not in useChat)

UI preferences and derived computations live here, not in `useChat`:

```typescript
// Companion mode toggle — persisted in localStorage
const [companionMode, setCompanionMode] = useState<boolean>(() => {
  try { return localStorage.getItem('chat_companion_mode') === 'true'; } catch { return false; }
});
useEffect(() => {
  try { localStorage.setItem('chat_companion_mode', String(companionMode)); } catch {}
}, [companionMode]);

// Mobile tab state (only relevant when companionMode is true)
const [mobileTab, setMobileTab] = useState<'chat' | 'obs'>('chat');

// Session summary — derived from metricsMap, lives at component level
const sessionSummary = useMemo<ChatSessionSummary | null>(() => {
  if (metricsMap.size === 0) return null;
  const entries = Array.from(metricsMap.values());
  return {
    message_count: entries.length,
    total_prompt_tokens: entries.reduce((s, m) => s + (m.prompt_tokens ?? 0), 0),
    total_completion_tokens: entries.reduce((s, m) => s + (m.completion_tokens ?? 0), 0),
    total_estimated_cost_usd: entries.reduce((s, m) => s + m.estimated_cost_usd, 0),
    avg_ttft_client_ms: entries.reduce((s, m) => s + m.ttft_client_ms, 0) / entries.length,
    avg_duration_ms: entries.reduce((s, m) => s + m.total_duration_ms, 0) / entries.length,
    latency_history: entries.map(m => m.total_duration_ms),
  };
}, [metricsMap]);
```

### 6b. Companion mode toggle button

Add an `Activity` icon button (from lucide-react) in the header actions area, between Clear and Close:

```tsx
<button
  type="button"
  className={`chat-panel__icon-btn ${companionMode ? 'chat-panel__icon-btn--active' : ''}`}
  onClick={() => setCompanionMode(!companionMode)}
  aria-label={companionMode ? 'Exit companion mode' : 'Enter companion mode'}
  aria-pressed={companionMode}
  title="Toggle observability"
>
  <Activity size={16} aria-hidden="true" />
</button>
```

`aria-pressed` is the correct semantic for a toggle button (vs. relying on the className/`--active` state, which screen readers can't read). `aria-label` still flips its text for sighted SR users; both are kept.

### 6c. Split layout when companionMode is true

Two changes that the original spec missed:

1. **Apply the companion class to the `<section>` itself**, not just the body wrapper — otherwise the `.chat-panel--companion` width rule in 6e never activates and the 280px observability column gets jammed into the default panel width, squeezing the chat column. The existing `<section className="chat-panel ...">` (`ChatWidget.tsx:82`) must gain the modifier.
2. **Bind `mobileTab` to a className on both columns** so the mobile tab CSS in 6g can actually show/hide them. Without this, tapping a tab mutates state and changes nothing visible.

```tsx
{/* The section gets the companion modifier so 6e's width rule fires */}
<section
  className={`chat-panel ${open ? 'chat-panel--open' : ''} ${companionMode ? 'chat-panel--companion' : ''}`}
  role="dialog"
  aria-label="Chat with Chris"
  aria-hidden={!open}
>
  {/* ... existing header, banner ... */}

  {/* Mobile tab toggle (rendered only in companion mode; see 6d).
      Full WAI-ARIA tablist wiring: tabs have aria-controls pointing at panel ids,
      panels have role="tabpanel" + aria-labelledby pointing back. The tablist is
      mobile-only visually (hidden on desktop via CSS) but stays in the a11y tree. */}
  {companionMode && (
    <div className="chat-panel__tabs" role="tablist" aria-label="Companion view">
      <button
        role="tab"
        id="chat-companion-tab-chat"
        aria-selected={mobileTab === 'chat'}
        aria-controls="chat-companion-panel-chat"
        onClick={() => setMobileTab('chat')}
      >Chat</button>
      <button
        role="tab"
        id="chat-companion-tab-obs"
        aria-selected={mobileTab === 'obs'}
        aria-controls="chat-companion-panel-obs"
        onClick={() => setMobileTab('obs')}
      >Observability</button>
    </div>
  )}

  <div className={`chat-panel__body ${companionMode ? 'chat-panel__body--split' : ''}`}>
    {/* Left column — gains --active when mobileTab === 'chat' (mobile shows it) */}
    <div
      id="chat-companion-panel-chat"
      role="tabpanel"
      aria-labelledby="chat-companion-tab-chat"
      // tabpanel only meaningful in companion mode (when the tablist exists)
      {...(companionMode ? {} : { role: undefined, 'aria-labelledby': undefined, id: undefined })}
      className={`chat-panel__chat-col ${mobileTab === 'chat' ? 'chat-panel__chat-col--active' : ''}`}
    >
      {/* ... existing messages area + input row ... */}
    </div>

    {/* Right column — observability only in companion mode.
        isStreaming is fed by `loading` (Phase 4a) — no separate streaming boolean. */}
    {companionMode && (
      <div
        id="chat-companion-panel-obs"
        role="tabpanel"
        aria-labelledby="chat-companion-tab-obs"
        className={`chat-panel__obs-col ${mobileTab === 'obs' ? 'chat-panel__obs-col--active' : ''}`}
      >
        <ChatObservabilityPanel
          metricsMap={metricsMap}
          sessionSummary={sessionSummary}
          isStreaming={loading}
          streamProgress={streamProgress}
          messages={messages}
        />
      </div>
    )}
  </div>
</section>
```

**Note on the conditional `role`/`id`:** when companion mode is off, the chat column is the only visible panel and there's no tablist to be a `tabpanel` *for*. Stripping `role="tabpanel"`/`aria-labelledby`/`id` in that case avoids a dangling `aria-labelledby` reference and a tabpanel with no associated tabs (both are WCAG failures). The obs column doesn't need this because it's only rendered when `companionMode` is true. If the spread feels too clever, an equivalent approach is two `role={companionMode ? 'tabpanel' : undefined}` lines — same result.

### 6d. (Folded into 6c)

The mobile tab toggle markup and the column className bindings now live in 6c alongside the split layout, since both must change together for tabs to actually work. CSS-only concerns remain below.

**File: `frontend/src/components/chat/ChatWidget.css`**

### 6e. Companion mode panel sizing with smooth transition

```css
/* Companion mode widens the panel — smooth transition prevents jarring layout shift */
.chat-panel--companion {
  width: min(780px, calc(100vw - 2rem));
  transition: width 0.25s ease;
}

/* Default panel (non-companion) also gets the transition so toggling is smooth both ways */
.chat-panel {
  /* ... existing styles ... */
  transition: width 0.25s ease, opacity 0.22s ease, transform 0.22s ease;
}
```

**Note:** `box-sizing: border-box` is already set globally in `global.css` (line 5: `*, *::before, *::after { box-sizing: border-box; }`), so the 780px width plus borders won't cause overflow.

### 6f. Split layout with independent scroll containers

```css
.chat-panel__body--split {
  display: flex;
  gap: 0.75rem;
  overflow: hidden; /* parent doesn't scroll — children do independently */
}

.chat-panel__chat-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-panel__obs-col {
  width: 280px;
  flex-shrink: 0;
  overflow-y: auto;  /* independent scroll */
  max-height: min(400px, calc(100vh - 10rem)); /* constrain height so it doesn't try to fill the full 600px panel when there are few messages */
}
```

Both columns scroll independently. The parent `overflow: hidden` prevents a single scrollbar for the whole panel.

### 6g. Mobile tab toggle styles

```css
@media (max-width: 639px) {
  .chat-panel__tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border-muted, var(--border-color));
    margin-bottom: 0;
  }

  .chat-panel__tabs button {
    flex: 1;
    padding: 0.4rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 0.8rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s ease, border-color 0.15s ease;
  }

  .chat-panel__tabs button[aria-selected="true"] {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  /* On mobile, hide BOTH columns by default; show whichever is --active.
     The original spec only toggled obs-col, leaving chat-col always visible
     and overlapping the obs column. Apply the symmetric rule to both. */
  .chat-panel__body--split .chat-panel__chat-col,
  .chat-panel__body--split .chat-panel__obs-col {
    display: none;
  }
  .chat-panel__body--split .chat-panel__chat-col.chat-panel__chat-col--active,
  .chat-panel__body--split .chat-panel__obs-col.chat-panel__obs-col--active {
    display: flex;   /* chat-col is flex column; see 6f */
  }
  .chat-panel__body--split .chat-panel__obs-col.chat-panel__obs-col--active {
    display: block;  /* obs-col is block; override the flex above */
  }
}

/* Desktop override: companion mode is always side-by-side regardless of mobileTab.
   Without this, the mobile display:none above would also hide a column on desktop
   whenever its --active modifier was absent (tabs are a mobile-only concept). */
@media (min-width: 640px) {
  .chat-panel__body--split .chat-panel__chat-col,
  .chat-panel__body--split .chat-panel__obs-col {
    display: flex;
  }
  .chat-panel__body--split .chat-panel__obs-col {
    display: block;  /* obs-col is block per 6f */
  }
  .chat-panel__tabs {
    display: none;   /* tabs are mobile-only */
  }
}
```

---

## Phase 7: Tests ✅ COMPLETE

**Backend:**
- `backend/tests/test_chat.py` —
  - **Event-shape test** (monkeypatch `_generate_stream`): assert the new structured event sequence (`token` → `meta` → `meta_server` → `usage` → `done`) arrives in order
  - **Provider-aware `stream_options` test** (mock `_get_client`, NOT `_generate_stream`): assert `stream_options={"include_usage": True}` is passed for `gpt-4o-mini` and `deepseek-chat`, and omitted for `gemini-2.5-flash` (see 1f for why the mock target matters)
  - **Usage-extraction test** (same mock approach): feed a final chunk with `choices=[]` + `usage` populated, assert the `usage` dict is yielded correctly
  - **Server-timing test**: assert `meta_server` carries both `server_pre_llm_ms` and `server_llm_to_first_token_ms` and that `request_start` is captured at the top of `chat()` (not inside `event_stream()`)

**Frontend:**
- `frontend/src/api/backend.test.ts` — test that `sendChatMessage` (new `(req, callbacks)` signature) correctly parses `meta`, `meta_server` (both fields), and `usage` SSE events; returns metrics with both `effective_tokens_per_second` and `decode_tokens_per_second`; handles fallback estimation when no usage received (throughput fields = 0); skips empty/whitespace tokens for TTFT. Update the four existing call sites at lines 221/233/249/260 to the callbacks-object shape.
- `frontend/src/hooks/useChat.test.ts` — test `metricsMap` population via `onComplete`; `streamProgress` reports `chunks_received` / `chunks_per_sec` (not tokens); interval cleanup on abort and unmount; **`clearChat` resets `metricsMap` to empty and `streamProgress` to null** (regression test for the stale-summary bug). Update the mock at line 59 from `(msg, onToken)` to `(msg, { onToken })`.
- `frontend/src/components/chat/ChatObservabilityPanel.test.tsx` — test rendering of session summary, sparkline bars, per-message metrics list (incl. decode vs effective throughput distinction and "(est.)" / "throughput n/a for estimates" states), streaming indicator reading `streamProgress.chunks_per_sec`, and empty state
- `frontend/src/components/chat/ChatWidget.test.tsx` — test companion toggle + localStorage persistence; session summary computation; **the `chat-panel--companion` class is applied to the `<section>` when companion mode is on** (regression for the width bug); mobile tab switching drives the `--active` className on **both** columns and shows/hides them; desktop layout shows both columns side-by-side regardless of `mobileTab`

---

## File Change Summary

| File | Action | Description |
|------|--------|-------------|
| `backend/api/endpoints/chat.py` | Modify | Refactor `_generate_stream` to yield dicts (accepts `request_start` kwarg); `PROVIDER_SUPPORTS_USAGE` table + provider-aware `stream_options`; extract usage from empty-choices chunk; capture `request_start` at top of `chat()`, emit two-segment `meta_server` (`server_pre_llm_ms`, `server_llm_to_first_token_ms`) |
| `backend/tests/test_chat.py` | Modify | Split tests: event-shape (monkeypatch `_generate_stream`); `stream_options`/usage/server-timing tests mock `_get_client` instead (see 1f) |
| `frontend/src/types/chat.ts` | Modify | Add `ChatMessageMetrics` (split server timing, `effective_tokens_per_second` + `decode_tokens_per_second`), `ChatSessionSummary`, `StreamProgress` (`chunks_received`/`chunks_per_sec`) |
| `frontend/src/api/config.ts` | Modify | Add `MODEL_PRICING` table with `getModelPricing()` safe lookup |
| `frontend/src/api/backend.ts` | Modify | **Breaking** signature change to `(req, callbacks)`; add timing instrumentation; parse `meta`/`meta_server`/`usage`; return metrics; fallback estimation |
| `frontend/src/api/backend.test.ts` | Modify | Update 4 call sites to callbacks-object shape; test new SSE parsing, both throughput fields, empty-token TTFT guard |
| `frontend/src/hooks/useChat.ts` | Modify | Add `metricsMap` + `streamProgress` (reuse `loading` as the streaming flag — no `isStreaming`); chunk-counting refs; interval cleanup; **reset state in `clearChat`** |
| `frontend/src/hooks/useChat.test.ts` | Modify | Update mock signature; test metrics population, chunk (not token) progress, cleanup, `clearChat` reset |
| `frontend/src/components/chat/ChatWidget.tsx` | Modify | Companion state + localStorage; `sessionSummary`; apply `chat-panel--companion` to `<section>`; bind `mobileTab` to both columns' `--active` className; pass `loading` as `isStreaming` |
| `frontend/src/components/chat/ChatWidget.css` | Modify | Companion width transition; independent scroll; symmetric mobile show/hide for both columns + desktop override |
| `frontend/src/components/chat/ChatWidget.test.tsx` | Modify | Test companion class on `<section>`, tab-driven `--active` on both columns, desktop side-by-side |
| `frontend/src/components/chat/ChatObservabilityPanel.tsx` | **New** | Observability dashboard component |
| `frontend/src/components/chat/ChatObservabilityPanel.css` | **New** | Observability panel styles |
| `frontend/src/components/chat/ChatObservabilityPanel.test.tsx` | **New** | Observability panel tests |
