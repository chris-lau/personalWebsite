import { Profile, Project, NowState } from '../types/portfolio';
import { GitHubUser, GitHubRepo } from '../types/github';
import { ChatModelsResponse, ChatRequest, ChatMessageMetrics, DECODE_FLOOR_SEC } from '../types/chat';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { nowData } from '../data/now';
import { API_BASE_URL, fetchWithTimeout, getModelPricing } from './config';

export interface BackendGitHubSummary {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export interface BackendResponse<T> {
  data: T;
  isFallback: boolean;
  error?: string;
}

/**
 * Fetch profile data with local static fallback.
 */
export async function fetchProfile(): Promise<BackendResponse<Profile>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Profile = await res.json();
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { data: profileData, isFallback: true, error: errorMsg };
  }
}

/**
 * Fetch projects data with optional tag filtering and local fallback.
 */
export async function fetchProjects(tag?: string): Promise<BackendResponse<Project[]>> {
  try {
    const url = tag 
      ? `${API_BASE_URL}/projects?tag=${encodeURIComponent(tag)}`
      : `${API_BASE_URL}/projects`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Project[] = await res.json();
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    let filteredProjects = projectsData;
    if (tag) {
      filteredProjects = projectsData.filter((p) =>
        p.techStack.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }
    return { data: filteredProjects, isFallback: true, error: errorMsg };
  }
}

/**
 * Fetch Now page state with local fallback.
 */
export async function fetchNow(): Promise<BackendResponse<NowState>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/now`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NowState = await res.json();
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { data: nowData, isFallback: true, error: errorMsg };
  }
}

/**
 * Fetch GitHub summary proxy data from FastAPI backend with fallback.
 */
export async function fetchGitHubSummary(): Promise<BackendResponse<BackendGitHubSummary | null>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/github-summary`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: BackendGitHubSummary = await res.json();
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, isFallback: true, error: errorMsg };
  }
}

// ---------------------------------------------------------------------------
// AI Chat
// ---------------------------------------------------------------------------

/**
 * Fetch the list of chat models whose API keys are configured on the backend.
 */
export async function fetchChatModels(): Promise<BackendResponse<ChatModelsResponse | null>> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/chat/models`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ChatModelsResponse = await res.json();
    return { data, isFallback: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { data: null, isFallback: true, error: errorMsg };
  }
}

/** Sent over the wire as the SSE stream is parsed. */
export interface ChatStreamResult {
  isFallback: boolean;
  error?: string;
  metrics?: ChatMessageMetrics;
}

/** Callbacks for the SSE stream lifecycle. */
export interface ChatMessageCallbacks {
  onToken: (token: string) => void;
  onFirstToken: () => void;
  onComplete: (metrics: ChatMessageMetrics) => void;
}

/**
 * POST a chat message and stream the reply token-by-token via SSE.
 *
 * The chat endpoint streams Server-Sent Events; this reads the response body
 * as a ReadableStream, parses each `data: {...}` line, and invokes the
 * appropriate callback. Timing is captured via `performance.now()` to measure
 * TTFT (time to first token) and total stream duration. Backend-reported
 * metadata (`meta`, `meta_server`, `usage`) is parsed and assembled into a
 * `ChatMessageMetrics` object delivered via `onComplete`.
 *
 * Abort handling: pass an AbortSignal via `req.signal`; if the chat drawer
 * closes mid-stream, the caller aborts and we cancel the reader to avoid
 * leaking a background fetch.
 */
export async function sendChatMessage(
  req: ChatRequest & { signal?: AbortSignal },
  callbacks: ChatMessageCallbacks,
): Promise<ChatStreamResult> {
  let response: Response;
  const startTime = performance.now();

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: req.message, history: req.history, model: req.model }),
      signal: req.signal,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { isFallback: true, error: errorMsg };
  }

  if (!response.ok) {
    return { isFallback: true, error: `HTTP ${response.status}` };
  }

  const body = response.body;
  if (!body) {
    return { isFallback: true, error: 'No response body' };
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // Timing state
  let firstTokenTime: number | null = null;
  let firstTokenRecorded = false;
  let endTime: number | null = null;

  // Accumulated content for fallback token estimation
  let accumulatedContent = '';

  // Backend-reported metadata
  let finishReason: string | null = null;
  let reportedModel: string | null = null;
  let serverPreLlmMs: number | null = null;
  let serverLlmToFirstTokenMs: number | null = null;
  let usageData: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by a blank line. Process complete events.
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n\n')) !== -1) {
        const rawEvent = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 2);

        for (const line of rawEvent.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice('data: '.length).trim();
          if (!payload) continue;
          try {
            const obj = JSON.parse(payload) as {
              token?: string;
              done?: boolean;
              error?: string;
              meta?: { finish_reason: string; model: string };
              meta_server?: { server_pre_llm_ms: number; server_llm_to_first_token_ms: number };
              usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
            };
            if (obj.error) {
              return { isFallback: true, error: obj.error };
            }
            if (obj.token) {
              callbacks.onToken(obj.token);
              accumulatedContent += obj.token;

              // Record TTFT on first non-empty token
              if (!firstTokenRecorded && obj.token.trim().length > 0) {
                firstTokenTime = performance.now();
                firstTokenRecorded = true;
                callbacks.onFirstToken();
              }
            }
            // Accumulate metadata events as they arrive
            if (obj.meta) {
              if (obj.meta.finish_reason) finishReason = obj.meta.finish_reason;
              if (obj.meta.model) reportedModel = obj.meta.model;
            }
            if (obj.meta_server) {
              serverPreLlmMs = obj.meta_server.server_pre_llm_ms ?? null;
              serverLlmToFirstTokenMs = obj.meta_server.server_llm_to_first_token_ms ?? null;
            }
            if (obj.usage) {
              usageData = obj.usage;
            }
          } catch {
            // Malformed chunk — skip rather than fail the whole stream.
          }
        }
      }
    }

    // Stream completed — record end time and build metrics
    endTime = performance.now();
    const ttftClientMs = firstTokenTime ? firstTokenTime - startTime : endTime - startTime;
    const totalDurationMs = endTime - startTime;

    // Resolve model: prefer backend-reported, fall back to request model
    const model = reportedModel || req.model;

    // Token counts: use backend-reported usage or estimate from content
    let promptTokens: number | null = null;
    let completionTokens: number | null = null;
    let totalTokens: number | null = null;
    let tokenCountEstimated = false;

    if (usageData) {
      promptTokens = usageData.prompt_tokens;
      completionTokens = usageData.completion_tokens;
      totalTokens = usageData.total_tokens;
    } else {
      // Fallback estimation: ~1.33 tokens per word for English text
      const wordCount = accumulatedContent.split(/\s+/).filter((w) => w.length > 0).length;
      completionTokens = Math.round(wordCount * 1.33);
      totalTokens = completionTokens;
      tokenCountEstimated = true;
    }

    // Cost estimation from pricing table
    const pricing = getModelPricing(model);
    const promptCost = ((promptTokens ?? 0) / 1_000_000) * pricing.input_per_1m;
    const completionCost = ((completionTokens ?? 0) / 1_000_000) * pricing.output_per_1m;
    const estimatedCostUsd = Math.round((promptCost + completionCost) * 1_000_000) / 1_000_000;

    // Throughput calculations with div-by-zero guard.
    // Both fields are 0 for estimated tokens — they require real completion_tokens.
    const effectiveDenom = Math.max(DECODE_FLOOR_SEC, totalDurationMs / 1000);
    const decodeDenom = Math.max(DECODE_FLOOR_SEC, (totalDurationMs - ttftClientMs) / 1000);
    const effectiveTokensPerSecond = !tokenCountEstimated && completionTokens
      ? Math.round((completionTokens / effectiveDenom) * 10) / 10 : 0;
    const decodeTokensPerSecond = !tokenCountEstimated && completionTokens
      ? Math.round((completionTokens / decodeDenom) * 10) / 10 : 0;

    const metrics: ChatMessageMetrics = {
      ttft_client_ms: Math.round(ttftClientMs),
      server_pre_llm_ms: serverPreLlmMs,
      server_llm_to_first_token_ms: serverLlmToFirstTokenMs,
      total_duration_ms: Math.round(totalDurationMs),
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      model,
      finish_reason: finishReason,
      estimated_cost_usd: estimatedCostUsd,
      effective_tokens_per_second: effectiveTokensPerSecond,
      decode_tokens_per_second: decodeTokensPerSecond,
      token_count_estimated: tokenCountEstimated,
    };

    callbacks.onComplete(metrics);
    return { isFallback: false, metrics };
  } catch (err: unknown) {
    // AbortError is expected when the caller cancels mid-stream.
    if (err instanceof Error && err.name === 'AbortError') {
      return { isFallback: true, error: 'cancelled' };
    }
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return { isFallback: true, error: errorMsg };
  } finally {
    // Always release the reader so the underlying stream is not left open.
    reader.releaseLock();
  }
}
