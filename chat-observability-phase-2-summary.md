# Phase 2 Summary — Chat Observability: Frontend Types & MODEL_PRICING Table

Git commit: `ee871ad`
Branch: `feat/chat-observability`
Detailed Execution Plan: [PLAN-chat-observability.md](PLAN-chat-observability.md)

---

## 📌 Phase 2 Overview & Goals

Phase 2 establishes the **typed contract** that all subsequent phases (3–6) compile against. This phase is pure types and pricing data — **no changes to `sendChatMessage`** or any runtime code. Every interface, constant, and pricing entry is defined here so that Phase 3 (metric collection) can import and populate these shapes without circular dependencies.

Phase 2 introduces:
1. **`ChatMessageMetrics` interface** — per-message observability data (TTFT decomposition, throughput split, estimated cost).
2. **`ChatSessionSummary` interface** — running aggregates for the observability panel header.
3. **`StreamProgress` interface** — live streaming progress while a reply is in flight.
4. **`DECODE_FLOOR_SEC` constant** — 50ms minimum decode denominator to prevent division-by-noise.
5. **`MODEL_PRICING` lookup table** — verified per-1M-token costs for 5 models.
6. **`getModelPricing()` safe accessor** — returns spread-copied zero-cost default for unknown models (no NaN, no shared-mutation risk).

---

## 🛠️ Work Accomplished

### 1. Observability Types (`frontend/src/types/chat.ts`)

Added after the existing `ChatModelsResponse` interface:

| Interface | Purpose |
|-----------|---------|
| `ChatMessageMetrics` | Per-message: TTFT, server timing, token counts, throughput, estimated cost |
| `ChatSessionSummary` | Running aggregates: totals, averages, latency sparkline history |
| `StreamProgress` | Live in-flight: elapsed time, chunks received, chunks/sec |
| `DECODE_FLOOR_SEC` | `0.05` — 50ms floor for decode-phase duration calculations |

Key design decisions:
- `server_pre_llm_ms` and `server_llm_to_first_token_ms` are `number | null` — null when the backend didn't report (e.g., network error before stream).
- `token_count_estimated: boolean` — flags when we fell back to word-count estimation (no usage event from provider).
- Throughput is split: `effective_tokens_per_second` (full stream incl. TTFT) vs `decode_tokens_per_second` (decode phase only).

### 2. MODEL_PRICING Table (`frontend/src/api/config.ts`)

Added pricing data and safe accessor to the shared config module:

| Model | Input (per 1M) | Output (per 1M) |
|-------|:-:|:-:|
| `gemini-2.5-flash` | $0.15 | $0.60 |
| `deepseek-chat` | $0.14 | $0.28 |
| `deepseek-reasoner` | $0.55 | $2.19 |
| `gpt-4o-mini` | $0.15 | $0.60 |

`getModelPricing(modelId)` returns:
- The matching entry for known models.
- A **fresh spread copy** of `{ input_per_1m: 0, output_per_1m: 0 }` for unknown models — prevents NaN in cost calculations and avoids shared-mutation bugs.

### 3. Test Suite (`frontend/src/api/config.test.ts`)

6 new unit tests covering the pricing table and safe accessor:

| Test | Asserts |
|------|---------|
| `contains all five models from the plan` | All 5 model IDs present in `MODEL_PRICING` |
| `stores strictly positive per-1M costs` | All costs > 0; output ≥ input |
| `returns the correct pricing for a known model` | Exact values for `deepseek-chat` |
| `returns zero-cost default for an unknown model` | `{ 0, 0 }` — no NaN |
| `returns a fresh object each call for unknown models` | No shared reference (`not.toBe`) |
| `returns zero-cost default for empty string` | Edge case safety |

---

## 🧪 Verification & Test Metrics

| Suite | Tests | Status |
|-------|------|--------|
| Backend pytest | 60 / 60 | ✅ All passing (daily caps added after Phase 2) |
| Frontend vitest | 127 / 127 (19 files) | ✅ All passing (+6 new config tests) |

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/types/chat.ts` | Modified | Added `ChatMessageMetrics`, `ChatSessionSummary`, `StreamProgress`, `DECODE_FLOOR_SEC` |
| `frontend/src/api/config.ts` | Modified | Added `MODEL_PRICING` table, `ModelPricing` interface, `getModelPricing()` |
| `frontend/src/api/config.test.ts` | Created | 6 unit tests for pricing table and safe lookup |

---

## ➡️ Next Phase

**Phase 3: Metric collection in `sendChatMessage`** — Refactor `sendChatMessage` to accept a callbacks object (`onToken`, `onMeta`, `onMetaServer`, `onUsage`, `onStreamProgress`), parse all SSE event types, compute `ChatMessageMetrics` with div-by-zero guards and cost estimation, and return metrics alongside the stream result.
