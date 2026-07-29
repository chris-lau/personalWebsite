import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchProfile,
  fetchProjects,
  fetchNow,
  fetchGitHubSummary,
} from './backend';

describe('backend API client & local fallback mechanism', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchProfile', () => {
    it('returns data from live backend when request succeeds', async () => {
      const mockProfile = {
        name: 'Chris Lau',
        handle: 'chris-lau',
        title: 'AI & Product Leader',
        location: 'San Francisco, CA',
        bio: 'Building AI tools',
        socials: [],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockProfile,
      } as Response);

      const res = await fetchProfile();
      expect(res.isFallback).toBe(false);
      expect(res.data.name).toBe('Chris Lau');
      expect(res.error).toBeUndefined();
    });

    it('falls back gracefully to local profileData when backend network fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const res = await fetchProfile();
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data.name).toBe('Chris Lau');
      expect(res.error).toBe('Network error');
    });

    it('falls back to local data on HTTP 500 server error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const res = await fetchProfile();
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.error).toBe('HTTP 500');
    });
  });

  describe('fetchProjects', () => {
    it('fetches projects from live backend', async () => {
      const mockProjects = [
        {
          id: 'p1',
          title: 'Project 1',
          description: 'Desc',
          techStack: ['React', 'Python'],
          featured: true,
        },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
      } as Response);

      const res = await fetchProjects();
      expect(res.isFallback).toBe(false);
      expect(res.data.length).toBe(1);
      expect(res.data[0].title).toBe('Project 1');
    });

    it('falls back to local projects when backend fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Fetch failed'));

      const res = await fetchProjects();
      expect(res.isFallback).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.error).toBe('Fetch failed');
    });

    it('filters local fallback data by tag when tag parameter is provided', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend offline'));

      const res = await fetchProjects('React');
      expect(res.isFallback).toBe(true);
      expect(res.data.every((p) => p.techStack.some((t) => t.toLowerCase() === 'react'))).toBe(true);
    });
  });

  describe('fetchNow', () => {
    it('fetches Now page state from live backend', async () => {
      const mockNow = {
        lastUpdated: '2026-07-28',
        currentFocus: 'Building Personal OS',
        workingOn: ['FastAPI backend'],
        reading: ['Designing Data-Intensive Applications'],
        learning: ['Pytest', 'Docker'],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockNow,
      } as Response);

      const res = await fetchNow();
      expect(res.isFallback).toBe(false);
      expect(res.data.currentFocus).toBe('Building Personal OS');
    });

    it('falls back to local nowData when request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));

      const res = await fetchNow();
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeDefined();
    });
  });

  describe('fetchGitHubSummary', () => {
    it('fetches GitHub summary proxy from live backend', async () => {
      const mockSummary = {
        user: {
          username: 'chris-lau',
          displayName: 'Chris Lau',
          avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
          profileUrl: 'https://github.com/chris-lau',
          bio: 'Building AI tools',
          publicReposCount: 10,
          followersCount: 25,
          followingCount: 5,
          topLanguages: [{ language: 'TypeScript', percentage: 70, count: 7 }],
        },
        repos: [],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockSummary,
      } as Response);

      const res = await fetchGitHubSummary();
      expect(res.isFallback).toBe(false);
      expect(res.data?.user.username).toBe('chris-lau');
    });

    it('handles backend error gracefully by returning fallback state', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Backend error'));

      const res = await fetchGitHubSummary();
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeNull();
      expect(res.error).toBe('Backend error');
    });
  });
});
