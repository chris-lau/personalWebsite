import { describe, it, expect } from 'vitest';
import { getBrowserPerformanceMetrics, auditSessionStorage } from './telemetry';

describe('Telemetry Utilities Unit Tests', () => {
  it('getBrowserPerformanceMetrics returns valid object structure', () => {
    const metrics = getBrowserPerformanceMetrics();
    expect(metrics).toBeDefined();
    expect(typeof metrics.ttfb_ms).toBe('number');
    expect(typeof metrics.dom_nodes_count).toBe('number');
    expect(metrics.dom_nodes_count).toBeGreaterThanOrEqual(0);
  });

  it('auditSessionStorage returns storage inspection details', () => {
    sessionStorage.setItem('github_test_cache', JSON.stringify({ timestamp: Date.now() }));
    const audit = auditSessionStorage();
    expect(audit).toBeDefined();
    expect(audit.total_keys).toBeGreaterThanOrEqual(1);
    expect(audit.is_cache_active).toBe(true);
    expect(audit.github_cache_age_seconds).toBeLessThanOrEqual(5);
    sessionStorage.removeItem('github_test_cache');
  });
});
