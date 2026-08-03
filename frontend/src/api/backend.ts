import { Profile, Project, NowState } from '../types/portfolio';
import { GitHubUser, GitHubRepo } from '../types/github';
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
