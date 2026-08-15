import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchProfile,
  fetchProjects,
  fetchNow,
  fetchGitHubSummary,
  fetchChatModels,
  sendChatMessage,
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

  describe('fetchChatModels', () => {
    it('returns model list when backend is reachable', async () => {
      const mockModels = {
        models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
        defaultModel: 'gemini-2.5-flash',
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockModels,
      } as Response);

      const res = await fetchChatModels();
      expect(res.isFallback).toBe(false);
      expect(res.data?.models.length).toBe(1);
      expect(res.data?.defaultModel).toBe('gemini-2.5-flash');
    });

    it('returns null data with fallback flag when backend is down', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Offline'));

      const res = await fetchChatModels();
      expect(res.isFallback).toBe(true);
      expect(res.data).toBeNull();
      expect(res.error).toBe('Offline');
    });
  });

  describe('sendChatMessage', () => {
    /** Build a fake SSE Response whose body streams the given data lines. */
    function makeSSEResponse(dataLines: string[]): Response {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          for (const line of dataLines) {
            controller.enqueue(encoder.encode(`data: ${line}\n\n`));
          }
          controller.close();
        },
      });
      return { ok: true, body: stream } as Response;
    }

    it('parses token chunks and invokes onToken for each', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeSSEResponse([
          JSON.stringify({ token: 'Hello' }),
          JSON.stringify({ token: ', ' }),
          JSON.stringify({ token: 'world!' }),
          JSON.stringify({ done: true }),
        ]),
      );

      const tokens: string[] = [];
      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        (t) => tokens.push(t),
      );

      expect(result.isFallback).toBe(false);
      expect(tokens).toEqual(['Hello', ', ', 'world!']);
    });

    it('returns fallback on a non-200 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);

      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        () => {},
      );
      expect(result.isFallback).toBe(true);
      expect(result.error).toBe('HTTP 503');
    });

    it('returns fallback when an error chunk arrives mid-stream', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeSSEResponse([
          JSON.stringify({ token: 'partial…' }),
          JSON.stringify({ error: 'upstream blew up' }),
        ]),
      );

      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        () => {},
      );
      expect(result.isFallback).toBe(true);
      expect(result.error).toBe('upstream blew up');
    });

    it('returns fallback when fetch itself throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        () => {},
      );
      expect(result.isFallback).toBe(true);
      expect(result.error).toBe('Network down');
    });
  });
});
