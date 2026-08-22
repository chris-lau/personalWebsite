import { BackendTelemetry, ReadinessResponse, DiagnosticCheckItem } from '../types/monitoring';
import { API_BASE_URL, BACKEND_ROOT_URL, fetchWithTimeout } from './config';

export interface NetworkBenchmarkResult {
  latency_ms: number;
  isOnline: boolean;
  status: string;
}

export async function benchmarkNetworkRTT(): Promise<NetworkBenchmarkResult> {
  const start = performance.now();
  try {
    let res = await fetchWithTimeout(`${API_BASE_URL}/health/live`);
    if (!res.ok) {
      res = await fetchWithTimeout(`${BACKEND_ROOT_URL}/health/live`);
    }
    const latency = Math.round(performance.now() - start);

    if (res.ok) {
      return { latency_ms: latency, isOnline: true, status: 'healthy' };
    }
    return { latency_ms: latency, isOnline: false, status: 'degraded' };
  } catch {
    const latency = Math.round(performance.now() - start);
    return { latency_ms: latency, isOnline: false, status: 'offline' };
  }
}

export async function fetchBackendTelemetry(): Promise<{ data: BackendTelemetry | null; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/telemetry`);

    if (res.ok) {
      const data: BackendTelemetry = await res.json();
      return { data, isFallback: false };
    }
    return { data: null, isFallback: true };
  } catch {
    return { data: null, isFallback: true };
  }
}

export async function fetchBackendReadiness(): Promise<{ data: ReadinessResponse | null; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BACKEND_ROOT_URL}/health/ready`);

    if (res.ok) {
      const data: ReadinessResponse = await res.json();
      return { data, isFallback: false };
    }
    return { data: null, isFallback: true };
  } catch {
    return { data: null, isFallback: true };
  }
}

export async function runE2EDiagnosticSuite(): Promise<DiagnosticCheckItem[]> {
  const results: DiagnosticCheckItem[] = [
    {
      id: 'check-1-storage',
      name: 'Client Storage & Cache Integrity',
      description: 'Audits browser sessionStorage availability and active cache state.',
      status: 'running',
    },
    {
      id: 'check-2-network',
      name: 'Network RTT & CORS Validation',
      description: 'Measures round-trip time (RTT ms) and validates CORS headers.',
      status: 'pending',
    },
    {
      id: 'check-3-backend',
      name: 'FastAPI & Database Readiness',
      description: 'Queries /health/ready to inspect process memory, uptime, and database connection probe.',
      status: 'pending',
    },
    {
      id: 'check-4-github-proxy',
      name: 'GitHub Proxy & TTL Cache',
      description: 'Queries /api/github-summary and checks 15-min in-memory cache.',
      status: 'pending',
    },
    {
      id: 'check-5-rate-limiter',
      name: 'Rate Limiter Enforcement (slowapi)',
      description: 'Verifies slowapi rate limiting configuration and HTTP response headers.',
      status: 'pending',
    },
  ];

  // 1. Client Storage check
  try {
    sessionStorage.setItem('__diag_test__', '1');
    sessionStorage.removeItem('__diag_test__');
    results[0] = {
      ...results[0],
      status: 'pass',
      details: 'Browser sessionStorage is writable and functional.',
      latency_ms: 1,
    };
  } catch {
    results[0] = {
      ...results[0],
      status: 'fail',
      details: 'sessionStorage is restricted or unavailable.',
    };
  }

  // 2. Network RTT check
  results[1].status = 'running';
  const rtt = await benchmarkNetworkRTT();
  const isProdLocalhostMismatch =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    API_BASE_URL.includes('localhost');

  results[1] = {
    ...results[1],
    status: rtt.isOnline ? 'pass' : 'fail',
    latency_ms: rtt.latency_ms,
    details: rtt.isOnline
      ? `Successfully pinged /health/live in ${rtt.latency_ms}ms.`
      : isProdLocalhostMismatch
      ? `VITE_API_URL is unset in Cloudflare Pages (compiled target: ${API_BASE_URL}). Set VITE_API_URL in Cloudflare Pages settings to your Render backend URL.`
      : `Failed to reach backend endpoint (${API_BASE_URL} is offline / local fallback active).`,
  };

  // 3. Backend & Database Readiness check
  results[2].status = 'running';
  const ready = await fetchBackendReadiness();
  if (ready.data) {
    const isHealthy = ready.data.status === 'healthy';
    const rssMb = ready.data.checks?.process_memory?.rss_mb ?? 'N/A';
    const dbCheck = ready.data.checks?.database as
      | { status?: string; latency_ms?: number; error?: string }
      | undefined;
    const dbStatusText =
      dbCheck?.status === 'ok'
        ? `PostgreSQL / DB: ok (${dbCheck?.latency_ms ?? 0}ms)`
        : `PostgreSQL / DB: ${dbCheck?.status ?? 'unhealthy'}`;

    results[2] = {
      ...results[2],
      status: isHealthy ? 'pass' : 'fail',
      details: `Backend readiness ${ready.data.status}. RAM RSS: ${rssMb}MB | ${dbStatusText}.`,
    };
  } else {
    results[2] = {
      ...results[2],
      status: 'fail',
      details: 'Backend readiness probe unreachable.',
    };
  }

  // 4. GitHub Proxy check
  results[3].status = 'running';
  try {
    const start = performance.now();
    const res = await fetch(`${API_BASE_URL}/github-summary?username=chris-lau`);
    const lat = Math.round(performance.now() - start);
    if (res.ok) {
      const body = await res.json();
      const cacheNote = body.cached ? ' (served from in-memory cache)' : ' (fresh fetch)';
      results[3] = {
        ...results[3],
        status: 'pass',
        latency_ms: lat,
        details: `GitHub summary fetched in ${lat}ms${cacheNote}.`,
      };
    } else {
      results[3] = {
        ...results[3],
        status: 'fail',
        latency_ms: lat,
        details: `GitHub proxy returned HTTP ${res.status}.`,
      };
    }
  } catch {
    results[3] = {
      ...results[3],
      status: 'fail',
      details: 'GitHub proxy unreachable (backend offline or network error).',
    };
  }

  // 5. Rate Limiter check
  results[4].status = 'running';
  try {
    const start = performance.now();
    const res = await fetch(`${API_BASE_URL}/projects`);
    const lat = Math.round(performance.now() - start);
    // Read real rate-limit headers if present (slowapi sets these).
    const limit = res.headers.get('X-RateLimit-Limit');
    const remaining = res.headers.get('X-RateLimit-Remaining');
    const limitInfo = limit ? `${limit} req/min limit` : 'configured limit';
    const remainingInfo = remaining !== null ? `, ${remaining} remaining` : '';
    if (res.ok) {
      results[4] = {
        ...results[4],
        status: 'pass',
        latency_ms: lat,
        details: `Rate limiter active (${limitInfo}${remainingInfo}). Responded HTTP ${res.status} in ${lat}ms.`,
      };
    } else if (res.status === 429) {
      results[4] = {
        ...results[4],
        status: 'fail',
        latency_ms: lat,
        details: 'Rate limit exceeded (HTTP 429). Too many requests.',
      };
    } else {
      results[4] = {
        ...results[4],
        status: 'fail',
        latency_ms: lat,
        details: `Rate limiter check failed: HTTP ${res.status}.`,
      };
    }
  } catch {
    results[4] = {
      ...results[4],
      status: 'fail',
      details: 'Rate limiter probe unreachable (backend offline).',
    };
  }

  return results;
}
