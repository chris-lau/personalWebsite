/**
 * Shared API configuration.
 *
 * Single source of truth for the backend base URL, the fetch-with-timeout
 * utility, and model pricing used across all API clients.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/** Backend root URL (without /api suffix) — used for health endpoints. */
export const BACKEND_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');

/**
 * Fetch wrapper with an AbortController-based timeout.
 *
 * @param url The URL to fetch.
 * @param timeoutMs Timeout in milliseconds (default 3000).
 * @returns The fetch Response, or throws on timeout/network error.
 */
export async function fetchWithTimeout(
  url: string,
  timeoutMs = 3000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Model pricing — per-1M-token input/output costs for observability
// ---------------------------------------------------------------------------

export interface ModelPricing {
  readonly input_per_1m: number;
  readonly output_per_1m: number;
}

/** Safe default for unknown models — no NaN risk in cost calculations. */
const DEFAULT_PRICING: ModelPricing = Object.freeze({ input_per_1m: 0, output_per_1m: 0 });

/** Verified 2026-08-10 from official provider pricing pages. */
export const MODEL_PRICING: Readonly<Record<string, ModelPricing>> = Object.freeze({
  'gemini-2.0-flash':    Object.freeze({ input_per_1m: 0.075,  output_per_1m: 0.30 }),
  'gemini-2.5-flash':    Object.freeze({ input_per_1m: 0.15,   output_per_1m: 0.60 }),
  'deepseek-chat':       Object.freeze({ input_per_1m: 0.14,   output_per_1m: 0.28 }),
  'deepseek-reasoner':   Object.freeze({ input_per_1m: 0.55,   output_per_1m: 2.19 }),
  'gpt-4o-mini':         Object.freeze({ input_per_1m: 0.15,   output_per_1m: 0.60 }),
});

/**
 * Safe lookup — unknown models default to free (zero cost, no NaN).
 * Always use this function; never dereference MODEL_PRICING directly.
 */
export function getModelPricing(modelId: string): ModelPricing {
  return MODEL_PRICING[modelId] ?? { ...DEFAULT_PRICING };
}
