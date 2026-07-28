import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isWithinPast30Days,
  formatRelativeTime,
  transformGitHubRepo,
  fetchGitHubUser,
  fetchGitHubRepos,
} from './github';
import { GitHubRepoResponse, GitHubUserResponse } from '../types/github';

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

    it('returns formatted hours ago for recent dates', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h ago');
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
    it('fetches user data, transforms response, and uses sessionStorage cache', async () => {
      const mockUserResponse: Partial<GitHubUserResponse> = {
        login: 'chris-lau',
        name: 'Chris Lau',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345',
        html_url: 'https://github.com/chris-lau',
        bio: 'Software engineer',
        public_repos: 10,
        followers: 25,
        following: 5,
      };

      const mockReposResponse: Partial<GitHubRepoResponse>[] = [
        { language: 'TypeScript', fork: false },
        { language: 'TypeScript', fork: false },
        { language: 'Python', fork: false },
      ];

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
        if (typeof url === 'string' && url.includes('/repos')) {
          return {
            ok: true,
            json: async () => mockReposResponse,
          } as Response;
        }
        return {
          ok: true,
          json: async () => mockUserResponse,
        } as Response;
      });

      // First call fetches from API
      const user = await fetchGitHubUser('chris-lau');
      expect(user.username).toBe('chris-lau');
      expect(user.displayName).toBe('Chris Lau');
      expect(user.topLanguages.length).toBeGreaterThan(0);
      expect(user.topLanguages[0].language).toBe('TypeScript');
      expect(fetchSpy).toHaveBeenCalledTimes(2);

      // Second call uses sessionStorage cache (0 new fetch calls)
      fetchSpy.mockClear();
      const cachedUser = await fetchGitHubUser('chris-lau');
      expect(cachedUser.username).toBe('chris-lau');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('throws custom error message on HTTP 404 user not found', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      await expect(fetchGitHubUser('nonexistent-user-12345')).rejects.toThrow(
        'GitHub user "nonexistent-user-12345" was not found.'
      );
    });
  });

  describe('fetchGitHubRepos (mocked network requests)', () => {
    it('fetches repo data, excludes forks, and uses sessionStorage cache', async () => {
      const mockRepos: Partial<GitHubRepoResponse>[] = [
        {
          id: 1,
          name: 'repo-one',
          full_name: 'chris-lau/repo-one',
          fork: false,
          html_url: 'https://github.com/chris-lau/repo-one',
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'forked-repo',
          full_name: 'chris-lau/forked-repo',
          fork: true,
          html_url: 'https://github.com/chris-lau/forked-repo',
          updated_at: new Date().toISOString(),
        },
      ];

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      const repos = await fetchGitHubRepos('chris-lau');
      expect(repos.length).toBe(1); // Excludes fork
      expect(repos[0].name).toBe('repo-one');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Cached call
      fetchSpy.mockClear();
      const cachedRepos = await fetchGitHubRepos('chris-lau');
      expect(cachedRepos.length).toBe(1);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
