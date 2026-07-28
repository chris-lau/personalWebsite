import {
  GitHubUserResponse,
  GitHubRepoResponse,
  GitHubUser,
  GitHubRepo,
  LanguageStat,
} from '../types/github';

const GITHUB_API_BASE = 'https://api.github.com';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache TTL

// Map common languages to hex colors
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
  Ruby: '#701516',
};

// Check if a date string falls within the last 30 days
export function isWithinPast30Days(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return date >= thirtyDaysAgo;
}

// Format date into human-readable relative string
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

function getCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const item: CacheItem<T> = JSON.parse(raw);
    if (Date.now() - item.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const item: CacheItem<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Ignore storage quota errors
  }
}

// Compute language stats from repositories
function computeLanguageStats(repos: GitHubRepoResponse[]): LanguageStat[] {
  const counts: Record<string, number> = {};
  let total = 0;

  repos.forEach((repo) => {
    if (repo.language && !repo.fork) {
      counts[repo.language] = (counts[repo.language] || 0) + 1;
      total += 1;
    }
  });

  if (total === 0) return [];

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return sorted.map(([lang, count]) => ({
    language: lang,
    count,
    percentage: Math.round((count / total) * 100),
    color: LANGUAGE_COLORS[lang] || '#8b949e',
  }));
}

// Transform raw GitHub repo response to internal GitHubRepo model
export function transformGitHubRepo(raw: GitHubRepoResponse): GitHubRepo {
  const isRecentlyUpdated =
    isWithinPast30Days(raw.pushed_at) || isWithinPast30Days(raw.updated_at);

  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description || 'No description provided.',
    githubUrl: raw.html_url,
    demoUrl: raw.homepage && raw.homepage.trim().length > 0 ? raw.homepage : null,
    stars: raw.stargazers_count,
    forks: raw.forks_count,
    primaryLanguage: raw.language || 'Markdown',
    topics: raw.topics || [],
    isFork: raw.fork,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    formattedLastUpdated: formatRelativeTime(raw.pushed_at || raw.updated_at),
    isRecentlyUpdated,
  };
}

// Fetch GitHub profile info for a given username
export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `gh_user_${cleanUsername}`;
  const cached = getCache<GitHubUser>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${GITHUB_API_BASE}/users/${cleanUsername}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
    }
    throw new Error(`Failed to load GitHub user (HTTP ${res.status}).`);
  }

  const rawUser: GitHubUserResponse = await res.json();
  const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${cleanUsername}/repos?per_page=100&sort=updated`);
  const rawRepos: GitHubRepoResponse[] = reposResponse.ok ? await reposResponse.json() : [];

  const userModel: GitHubUser = {
    username: rawUser.login,
    displayName: rawUser.name || rawUser.login,
    avatarUrl: rawUser.avatar_url,
    profileUrl: rawUser.html_url,
    bio: rawUser.bio || 'Software developer & technology enthusiast.',
    publicRepos: rawUser.public_repos,
    followers: rawUser.followers,
    following: rawUser.following,
    location: rawUser.location || undefined,
    blogUrl: rawUser.blog || undefined,
    topLanguages: computeLanguageStats(rawRepos),
  };

  setCache(cacheKey, userModel);
  return userModel;
}

// Fetch public repositories for a given username
export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const cleanUsername = username.trim().toLowerCase();
  const cacheKey = `gh_repos_${cleanUsername}`;
  const cached = getCache<GitHubRepo[]>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `${GITHUB_API_BASE}/users/${cleanUsername}/repos?per_page=100&sort=pushed`
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`GitHub repositories for "${username}" were not found.`);
    }
    if (res.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please try again in a few minutes.');
    }
    throw new Error(`Failed to load GitHub repositories (HTTP ${res.status}).`);
  }

  const rawRepos: GitHubRepoResponse[] = await res.json();
  const repos = rawRepos
    .filter((r) => !r.fork) // Exclude forks by default for cleaner portfolio view
    .map(transformGitHubRepo);

  setCache(cacheKey, repos);
  return repos;
}
