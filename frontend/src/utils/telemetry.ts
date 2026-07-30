import { BrowserPerformanceMetrics, SessionStorageAudit } from '../types/monitoring';

export const getBrowserPerformanceMetrics = (): BrowserPerformanceMetrics => {
  let ttfb_ms = 0;
  let dom_interactive_ms = 0;
  let total_load_time_ms = 0;

  if (typeof window !== 'undefined' && window.performance) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0];
      ttfb_ms = Math.max(0, Math.round(nav.responseStart - nav.requestStart));
      dom_interactive_ms = Math.max(0, Math.round(nav.domInteractive));
      total_load_time_ms = Math.max(0, Math.round(nav.loadEventEnd - nav.startTime));
    } else if (performance.timing) {
      const t = performance.timing;
      ttfb_ms = Math.max(0, t.responseStart - t.requestStart);
      dom_interactive_ms = Math.max(0, t.domInteractive - t.navigationStart);
      total_load_time_ms = Math.max(0, t.loadEventEnd - t.navigationStart);
    }
  }

  const dom_nodes_count = typeof document !== 'undefined' ? document.getElementsByTagName('*').length : 0;

  let js_heap_used_mb: number | undefined;
  let js_heap_limit_mb: number | undefined;

  // Non-standard Chrome performance.memory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memory = (performance as any).memory;
  if (memory) {
    js_heap_used_mb = Math.round((memory.usedJSHeapSize / (1024 * 1024)) * 100) / 100;
    js_heap_limit_mb = Math.round((memory.jsHeapSizeLimit / (1024 * 1024)) * 100) / 100;
  }

  return {
    ttfb_ms,
    dom_interactive_ms,
    total_load_time_ms,
    dom_nodes_count,
    js_heap_used_mb,
    js_heap_limit_mb,
  };
};

export const auditSessionStorage = (): SessionStorageAudit => {
  let total_keys = 0;
  let bytes_used = 0;
  let github_cache_age_seconds: number | null = null;
  let is_cache_active = false;

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      total_keys = sessionStorage.length;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          const val = sessionStorage.getItem(key) || '';
          bytes_used += key.length + val.length;

          if (key.includes('github') || key.includes('cache') || key.startsWith('gh_')) {
            is_cache_active = true;
            try {
              const parsed = JSON.parse(val);
              if (parsed && parsed.timestamp) {
                const age = Math.round((Date.now() - parsed.timestamp) / 1000);
                if (github_cache_age_seconds === null || age < github_cache_age_seconds) {
                  github_cache_age_seconds = age;
                }
              }
            } catch {
              // ignore json parse error
            }
          }
        }
      }
    } catch {
      // Storage access disabled in restricted mode
    }
  }

  return {
    total_keys,
    bytes_used,
    github_cache_age_seconds,
    is_cache_active,
  };
};

export const exportDiagnosticReport = (reportData: Record<string, unknown>): void => {
  const jsonStr = JSON.stringify(reportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.download = `fullstack-diagnostic-report-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
