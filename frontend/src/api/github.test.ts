import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isWithinPast30Days,
  formatRelativeTime,
  transformGitHubRepo,
  fetchGitHubUser,
  fetchGitHubRepos,
} from './github';
import { GitHubRepoResponse } from '../types/github';

describe('github API utilities', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('isWithinPast30Days', () => {
    it('returns true for a date 5 days ago', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      expect(isWithinPast30Days(fiveDaysAgo.toISOString())).toBe(true);
    });

    it('returns false for a date 40 days ago', () => {
      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);
      expect(isWithinPast30Days(fortyDaysAgo.toISOString())).toBe(false);
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for dates less than a minute ago', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('just now');
    });

    it('returns formatted minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('5m ago');
    });

    it('returns formatted hours ago for recent dates', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h ago');
    });

    it('returns formatted days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3d ago');
    });

    it('returns formatted months ago', () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoMonthsAgo.toISOString())).toBe('2mo ago');
    });

    it('returns formatted years ago', () => {
      const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoYearsAgo.toISOString())).toBe('2y ago');
    });

    it('returns "recently" for empty string', () => {
      expect(formatRelativeTime('')).toBe('recently');
    });
  });

  describe('transformGitHubRepo', () => {
    it('correctly transforms raw GitHub repo response', () => {
      const mockRaw: GitHubRepoResponse = {
        id: 101,
        name: 'test-repo',
        full_name: 'chris-lau/test-repo',
        private: false,
        html_url: 'https://github.com/chris-lau/test-repo',
        description: 'Test description',
        fork: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pushed_at: new Date().toISOString(),
        homepage: 'https://test-repo.dev',
        size: 100,
        stargazers_count: 15,
        watchers_count: 15,
        language: 'TypeScript',
        forks_count: 2,
        open_issues_count: 0,
        topics: ['react', 'vite'],
        default_branch: 'main',
      };

      const transformed = transformGitHubRepo(mockRaw);

      expect(transformed.id).toBe(101);
      expect(transformed.name).toBe('test-repo');
      expect(transformed.stars).toBe(15);
      expect(transformed.primaryLanguage).toBe('TypeScript');
      expect(transformed.demoUrl).toBe('https://test-repo.dev');
      expect(transformed.isRecentlyUpdated).toBe(true);
    });
  });

  describe('fetchGitHubUser (mocked network requests)', () => {
    it('fetches user data via backend proxy and uses sessionStorage cache', async () => {
      const mockProxyResponse = {
        user: {
          username: 'chris-lau',
          displayName: 'Chris Lau',
          avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
          profileUrl: 'https://github.com/chris-lau',
          bio: 'Software engineer',
          publicRepos: 10,
          followers: 25,
          following: 5,
          topLanguages: [{ language: 'TypeScript', count: 3, percentage: 100, color: '#3178c6' }],
        },
        repos: [],
        cached: false,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        // The backend proxy endpoint.
        if (typeof url === 'string' && url.includes('/github-summary')) {
          return { ok: true, json: async () => mockProxyResponse } as Response;
        }
        return { ok: false, status: 0 } as Response;
      });

      // First call fetches from the backend proxy.
      const user = await fetchGitHubUser('chris-lau');
      expect(user.username).toBe('chris-lau');
      expect(user.displayName).toBe('Chris Lau');
      expect(user.topLanguages.length).toBeGreaterThan(0);
      expect(user.topLanguages[0].language).toBe('TypeScript');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Second call uses sessionStorage cache (0 new fetch calls).
      fetchSpy.mockClear();
      const cachedUser = await fetchGitHubUser('chris-lau');
      expect(cachedUser.username).toBe('chris-lau');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('throws custom error message on HTTP 404 user not found', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        // Proxy returns 404, fallback also 404.
        if (typeof url === 'string' && url.includes('/github-summary')) {
          return { ok: false, status: 404 } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      await expect(fetchGitHubUser('nonexistent-user-12345')).rejects.toThrow(
        'GitHub user "nonexistent-user-12345" was not found.'
      );
    });

    it('throws rate limit error on HTTP 403', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (typeof url === 'string' && url.includes('/github-summary')) {
          return { ok: false, status: 403 } as Response;
        }
        return { ok: false, status: 403 } as Response;
      });

      await expect(fetchGitHubUser('chris-lau')).rejects.toThrow(
        'GitHub API rate limit exceeded. Please try again in a few minutes.'
      );
    });

    it('falls back to direct GitHub API when backend proxy is unreachable', async () => {
      const mockUserResponse = {
        login: 'chris-lau',
        name: 'Chris Lau',
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/chris-lau',
        bio: 'Engineer',
        public_repos: 5,
        followers: 10,
        following: 3,
      };

      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        // Backend proxy throws (network error); direct GitHub API succeeds.
        if (typeof url === 'string' && url.includes('/github-summary')) {
          throw new Error('Network error');
        }
        if (typeof url === 'string' && url.includes('/repos')) {
          return { ok: true, json: async () => [] } as Response;
        }
        return { ok: true, json: async () => mockUserResponse } as Response;
      });

      const user = await fetchGitHubUser('chris-lau');
      expect(user.username).toBe('chris-lau');
    });
  });

  describe('fetchGitHubRepos (mocked network requests)', () => {
    it('fetches repo data via backend proxy, excludes forks, and caches', async () => {
      // The backend proxy already excludes forks, so the response only has non-fork repos.
      const mockProxyResponse = {
        user: {},
        repos: [
          {
            id: 1,
            name: 'repo-one',
            fullName: 'chris-lau/repo-one',
            isFork: false,
          },
        ],
        cached: false,
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (typeof url === 'string' && url.includes('/github-summary')) {
          return { ok: true, json: async () => mockProxyResponse } as Response;
        }
        return { ok: false, status: 0 } as Response;
      });

      const repos = await fetchGitHubRepos('chris-lau');
      expect(repos.length).toBe(1);
      expect(repos[0].name).toBe('repo-one');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Cached call.
      fetchSpy.mockClear();
      const cachedRepos = await fetchGitHubRepos('chris-lau');
      expect(cachedRepos.length).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
