/**
 * Shared API configuration.
 *
 * Single source of truth for the backend base URL and the fetch-with-timeout
 * utility used across all API clients.
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
