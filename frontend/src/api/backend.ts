import { Profile, Project, NowState } from '../types/portfolio';
import { GitHubUser, GitHubRepo } from '../types/github';
import { ChatModelsResponse, ChatRequest } from '../types/chat';
import { profileData } from '../data/profile';
import { projectsData } from '../data/projects';
import { nowData } from '../data/now';
import { API_BASE_URL, fetchWithTimeout } from './config';

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
}

/**
 * POST a chat message and stream the reply token-by-token via SSE.
 *
 * The chat endpoint streams Server-Sent Events; this reads the response body
 * as a ReadableStream, parses each `data: {...}` line, and invokes `onToken`
 * for every incremental token. `onToken` is async to let the UI batch renders.
 *
 * Abort handling: pass an AbortSignal via `req.signal`; if the chat drawer
 * closes mid-stream, the caller aborts and we cancel the reader to avoid
 * leaking a background fetch.
 */
export async function sendChatMessage(
  req: ChatRequest & { signal?: AbortSignal },
  onToken: (token: string) => void,
): Promise<ChatStreamResult> {
  let response: Response;
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
            const obj = JSON.parse(payload) as { token?: string; done?: boolean; error?: string };
            if (obj.error) {
              return { isFallback: true, error: obj.error };
            }
            if (obj.token) {
              onToken(obj.token);
            }
          } catch {
            // Malformed chunk — skip rather than fail the whole stream.
          }
        }
      }
    }
    return { isFallback: false };
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
