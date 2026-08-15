import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fetchProfile,
  fetchProjects,
  fetchNow,
  fetchGitHubSummary,
  fetchChatModels,
  sendChatMessage,
  searchLiveAmazonProducts,
  lookupLiveAmazonAsin,
  fetchLiveAmazonTrends,
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

    /** Default no-op callbacks for tests that don't care about specific callbacks. */
    function noopCallbacks() {
      return {
        onToken: vi.fn(),
        onFirstToken: vi.fn(),
        onComplete: vi.fn(),
      };
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

      const callbacks = noopCallbacks();
      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        callbacks,
      );

      expect(result.isFallback).toBe(false);
      expect(callbacks.onToken).toHaveBeenCalledWith('Hello');
      expect(callbacks.onToken).toHaveBeenCalledWith(', ');
      expect(callbacks.onToken).toHaveBeenCalledWith('world!');
      expect(callbacks.onToken).toHaveBeenCalledTimes(3);
    });

    it('returns fallback on a non-200 response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 503 } as Response);

      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        noopCallbacks(),
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
        noopCallbacks(),
      );
      expect(result.isFallback).toBe(true);
      expect(result.error).toBe('upstream blew up');
    });

    it('returns fallback when fetch itself throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        noopCallbacks(),
      );
      expect(result.isFallback).toBe(true);
      expect(result.error).toBe('Network down');
    });

    it('parses meta, meta_server, and usage events and builds metrics', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeSSEResponse([
          JSON.stringify({ token: 'Hello' }),
          JSON.stringify({ token: ' world' }),
          JSON.stringify({ meta: { finish_reason: 'stop', model: 'deepseek-chat' } }),
          JSON.stringify({ meta_server: { server_pre_llm_ms: 5.2, server_llm_to_first_token_ms: 180.4 } }),
          JSON.stringify({ usage: { prompt_tokens: 100, completion_tokens: 3, total_tokens: 103 } }),
          JSON.stringify({ done: true }),
        ]),
      );

      const callbacks = noopCallbacks();
      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        callbacks,
      );

      expect(result.isFallback).toBe(false);
      expect(result.metrics).toBeDefined();
      const m = result.metrics!;

      // TTFT and duration should be positive numbers
      expect(m.ttft_client_ms).toBeGreaterThanOrEqual(0);
      expect(m.total_duration_ms).toBeGreaterThanOrEqual(0);

      // Backend-reported metadata
      expect(m.finish_reason).toBe('stop');
      expect(m.model).toBe('deepseek-chat'); // backend-reported overrides request model
      expect(m.server_pre_llm_ms).toBeCloseTo(5.2);
      expect(m.server_llm_to_first_token_ms).toBeCloseTo(180.4);

      // Usage from backend
      expect(m.prompt_tokens).toBe(100);
      expect(m.completion_tokens).toBe(3);
      expect(m.total_tokens).toBe(103);
      expect(m.token_count_estimated).toBe(false);

      // Cost: deepseek-chat pricing (0.14/1M input, 0.28/1M output)
      // prompt: 100/1M * 0.14 = 0.000014, completion: 3/1M * 0.28 = 0.00000084
      // total ≈ 0.00001484 → rounded to 0.000015
      expect(m.estimated_cost_usd).toBeGreaterThan(0);

      // Throughput should be > 0 with real completion tokens
      expect(m.effective_tokens_per_second).toBeGreaterThan(0);
      expect(m.decode_tokens_per_second).toBeGreaterThan(0);

      // Callbacks invoked
      expect(callbacks.onFirstToken).toHaveBeenCalledTimes(1);
      expect(callbacks.onComplete).toHaveBeenCalledTimes(1);
      expect(callbacks.onComplete).toHaveBeenCalledWith(m);
    });

    it('falls back to token estimation when usage is absent', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeSSEResponse([
          JSON.stringify({ token: 'Hi there friend' }),
          JSON.stringify({ done: true }),
        ]),
      );

      const callbacks = noopCallbacks();
      const result = await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        callbacks,
      );

      expect(result.isFallback).toBe(false);
      const m = result.metrics!;

      // Should estimate tokens from content ("Hi there friend" = 3 words → ~4 tokens)
      expect(m.token_count_estimated).toBe(true);
      expect(m.prompt_tokens).toBeNull();
      expect(m.completion_tokens).toBe(4); // Math.round(3 * 1.33)
      expect(m.total_tokens).toBe(4);

      // Throughput should be 0 for estimated tokens
      expect(m.effective_tokens_per_second).toBe(0);
      expect(m.decode_tokens_per_second).toBe(0);
    });

    it('skips empty/whitespace tokens for TTFT measurement', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        makeSSEResponse([
          JSON.stringify({ token: '' }),
          JSON.stringify({ token: '   ' }),
          JSON.stringify({ token: 'real' }),
          JSON.stringify({ done: true }),
        ]),
      );

      const callbacks = noopCallbacks();
      await sendChatMessage(
        { message: 'hi', history: [], model: 'gemini-2.5-flash' },
        callbacks,
      );

      // onFirstToken should only fire once, after the first non-whitespace token ('real')
      // Empty string is falsy so onToken never fires for it; whitespace-only '   ' fires
      // onToken but doesn't trigger onFirstToken because trim().length === 0.
      expect(callbacks.onFirstToken).toHaveBeenCalledTimes(1);
      expect(callbacks.onToken).toHaveBeenCalledTimes(2); // '   ' and 'real'
    });
  });

  describe('Amazon Live API Methods', () => {
    it('searchLiveAmazonProducts handles successful live response', async () => {
      const mockSearchData = {
        query: 'desk mat',
        category: 'all',
        total_results: 1,
        products: [
          {
            asin: 'B08N5WRWNW',
            title: 'Sample Desk Mat',
            price: 29.99,
            rating: 4.6,
            reviews_count: 500,
            image_url: '',
            product_url: 'https://www.amazon.com/dp/B08N5WRWNW',
            is_prime: true,
            category: 'office_products',
            fba_tier: 'large_standard',
          },
        ],
        is_live: true,
        cached: false,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockSearchData,
      } as Response);

      const res = await searchLiveAmazonProducts('desk mat');
      expect(res.isFallback).toBe(false);
      expect(res.data.products.length).toBe(1);
      expect(res.data.products[0].asin).toBe('B08N5WRWNW');
    });

    it('lookupLiveAmazonAsin handles successful ASIN inspection', async () => {
      const mockAsinData = {
        asin: 'B08N5WRWNW',
        title: 'Felt Desk Pad',
        price: 32.5,
        rating: 4.7,
        reviews_count: 620,
        category: 'office_products',
        category_name: 'Office & Workstation Products',
        fba_tier: 'large_standard',
        fba_tier_label: 'Large Standard (16 oz - 20 lbs)',
        image_url: '',
        product_url: 'https://www.amazon.com/dp/B08N5WRWNW',
        bullets: ['Premium felt'],
        weight_lb: 1.2,
        estimated_cogs: 7.0,
        is_live: true,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockAsinData,
      } as Response);

      const res = await lookupLiveAmazonAsin('B08N5WRWNW');
      expect(res.isFallback).toBe(false);
      expect(res.data.title).toBe('Felt Desk Pad');
      expect(res.data.price).toBe(32.5);
    });

    it('fetchLiveAmazonTrends returns live trends and velocity', async () => {
      const mockTrendData = {
        query: 'espresso',
        trend_points: [{ date: 'Week 1', value: 80 }],
        growth_velocity_pct: 120,
        suggestions: ['espresso tamper', 'espresso cup'],
        is_live: true,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockTrendData,
      } as Response);

      const res = await fetchLiveAmazonTrends('espresso');
      expect(res.isFallback).toBe(false);
      expect(res.data.growth_velocity_pct).toBe(120);
      expect(res.data.suggestions).toContain('espresso tamper');
    });
  });
});
