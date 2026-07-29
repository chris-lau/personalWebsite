import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  benchmarkNetworkRTT,
  fetchBackendTelemetry,
  fetchBackendReadiness,
  runE2EDiagnosticSuite,
} from './telemetryApi';

describe('telemetryApi Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('benchmarkNetworkRTT', () => {
    it('returns healthy status when endpoint returns 200 OK', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const res = await benchmarkNetworkRTT();
      expect(res.isOnline).toBe(true);
      expect(res.status).toBe('healthy');
      expect(res.latency_ms).toBeGreaterThanOrEqual(0);
    });

    it('returns offline status when network call throws error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      const res = await benchmarkNetworkRTT();
      expect(res.isOnline).toBe(false);
      expect(res.status).toBe('offline');
    });
  });

  describe('fetchBackendTelemetry', () => {
    it('parses telemetry JSON data when backend returns 200 OK', async () => {
      const mockTelemetry = {
        process: { uptime_seconds: 120, memory_rss_mb: 45.2, python_version: '3.11', environment: 'production' },
        cache: { active_keys: 1, total_cached_repos: 18 },
        rate_limit: { active_window: '60/minute' },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockTelemetry,
      } as Response);

      const result = await fetchBackendTelemetry();
      expect(result.isFallback).toBe(false);
      expect(result.data).toEqual(mockTelemetry);
    });

    it('returns fallback null when fetch fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

      const result = await fetchBackendTelemetry();
      expect(result.isFallback).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('fetchBackendReadiness', () => {
    it('returns readiness data when backend is ready', async () => {
      const mockReadiness = {
        status: 'healthy',
        timestamp: '2026-07-28T20:25:00Z',
        checks: {
          database: { status: 'healthy' },
          process_memory: { status: 'healthy', rss_mb: 45.2 },
        },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadiness,
      } as Response);

      const result = await fetchBackendReadiness();
      expect(result.isFallback).toBe(false);
      expect(result.data).toEqual(mockReadiness);
    });
  });

  describe('runE2EDiagnosticSuite', () => {
    it('executes 5-step synthetic diagnostic checks cleanly', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ status: 'healthy' }),
      } as Response);

      const suite = await runE2EDiagnosticSuite();
      expect(suite).toHaveLength(5);
      expect(suite[0].id).toBe('check-1-storage');
      expect(suite[0].status).toBe('pass');
      expect(suite[1].id).toBe('check-2-network');
      expect(suite[2].id).toBe('check-3-backend');
      expect(suite[3].id).toBe('check-4-github-proxy');
      expect(suite[4].id).toBe('check-5-rate-limiter');
    });
  });
});
