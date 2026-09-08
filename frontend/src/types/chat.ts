export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  thought?: string;
  thoughtDurationSec?: number;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model: string;
}

export interface ChatModelInfo {
  id: string;
  label: string;
  provider: string;
}

export interface ChatModelsResponse {
  models: ChatModelInfo[];
  defaultModel: string;
}

export interface ChatSourceItem {
  id: string;
  title: string;
  category: string;
  source_file: string;
  route?: string | null;
  char_count: number;
  estimated_tokens: number;
  content: string;
}

export interface ChatSourcesResponse {
  sources: ChatSourceItem[];
  total_sources: number;
  total_characters: number;
  total_estimated_tokens: number;
}

// ---------------------------------------------------------------------------
// Observability types (Phase 2 — compiled against by Phases 3–6)
// ---------------------------------------------------------------------------

/** Per-message metrics collected during a streaming reply. */
export interface ChatMessageMetrics {
  /** Client-side time to first non-empty token (fetch → first rendered token). */
  ttft_client_ms: number;
  /** Server overhead before LLM call (rate limiter, routing, prompt build); null if backend didn't report. */
  server_pre_llm_ms: number | null;
  /** LLM inference time to first token; null if backend didn't report. */
  server_llm_to_first_token_ms: number | null;
  /** Full stream duration from fetch() to last chunk. */
  total_duration_ms: number;
  /** From backend (null if provider doesn't support usage reporting). */
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  model: string;
  finish_reason: string | null;
  /** Calculated from pricing table. */
  estimated_cost_usd: number;
  /** Effective throughput: completion_tokens across the full stream duration (incl. TTFT). */
  effective_tokens_per_second: number;
  /** Decode throughput: completion_tokens across decode phase only (total_duration - ttft). */
  decode_tokens_per_second: number;
  /** true if we fell back to word-count estimation. */
  token_count_estimated: boolean;
}

/** Running session-level aggregates displayed in the observability panel header. */
export interface ChatSessionSummary {
  message_count: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_estimated_cost_usd: number;
  avg_ttft_client_ms: number;
  avg_duration_ms: number;
  /** Per-message total_duration_ms values for the sparkline. */
  latency_history: number[];
}

/** Live streaming progress shown while a reply is in flight. */
export interface StreamProgress {
  elapsed_ms: number;
  /** SSE deltas received (NOT tokens — one delta may span multiple/partial tokens). */
  chunks_received: number;
  chunks_per_sec: number;
}

/** Minimum decode denominator in seconds — anything shorter is measurement noise. */
export const DECODE_FLOOR_SEC = 0.05; // 50 ms
