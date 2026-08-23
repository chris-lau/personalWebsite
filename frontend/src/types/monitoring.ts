export interface ProcessTelemetry {
  uptime_seconds: number;
  memory_rss_mb: number;
  python_version: string;
  environment: string;
}

export interface CacheTelemetry {
  github_cache_hits: number;
  github_cache_misses: number;
  ttl_seconds: number;
  is_cached: boolean;
}

export interface RateLimitTelemetry {
  limit_per_minute: number;
  active_window: string;
}

export interface DatabaseTelemetry {
  status: string;
  latency_ms?: number | null;
  engine: string;
}

export interface BackendTelemetry {
  status: string;
  timestamp: string;
  process: ProcessTelemetry;
  cache: CacheTelemetry;
  rate_limit: RateLimitTelemetry;
  database?: DatabaseTelemetry;
}

export interface SubsystemCheck {
  status: string;
  [key: string]: unknown;
}

export interface ReadinessResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  checks: Record<string, SubsystemCheck>;
}

export interface BrowserPerformanceMetrics {
  ttfb_ms: number;
  dom_interactive_ms: number;
  total_load_time_ms: number;
  dom_nodes_count: number;
  js_heap_used_mb?: number;
  js_heap_limit_mb?: number;
}

export interface SessionStorageAudit {
  total_keys: number;
  bytes_used: number;
  github_cache_age_seconds: number | null;
  is_cache_active: boolean;
}

export type DiagnosticCheckStatus = 'pending' | 'running' | 'pass' | 'fail';

export interface DiagnosticCheckItem {
  id: string;
  name: string;
  description: string;
  status: DiagnosticCheckStatus;
  latency_ms?: number;
  details?: string;
}

export interface FullStackTopologyState {
  frontend_status: 'healthy' | 'degraded';
  backend_status: 'healthy' | 'offline' | 'fallback';
  database_status: 'healthy' | 'degraded' | 'offline' | 'fallback';
  github_proxy_status: 'healthy' | 'degraded' | 'cached' | 'offline';
  network_rtt_ms: number | null;
  database_latency_ms?: number | null;
  database_engine?: string;
  last_check_timestamp: string | null;
}
