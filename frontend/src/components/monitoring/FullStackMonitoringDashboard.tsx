import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  Clock,
  Database,
  Download,
  FlaskConical,
  Github,
  Globe,
  Loader2,
  Server,
  Trash2,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import { BoxContainer } from '../ui/BoxContainer';
import { useTheme } from '../../context/ThemeContext';
import {
  BackendTelemetry,
  BrowserPerformanceMetrics,
  SessionStorageAudit,
  DiagnosticCheckItem,
  FullStackTopologyState,
} from '../../types/monitoring';
import {
  getBrowserPerformanceMetrics,
  auditSessionStorage,
  exportDiagnosticReport,
  formatUptime,
} from '../../utils/telemetry';
import {
  benchmarkNetworkRTT,
  fetchBackendTelemetry,
  probeGithubProxyHealth,
  runE2EDiagnosticSuite,
} from '../../api/telemetryApi';
import './FullStackMonitoringDashboard.css';

/**
 * The free-tier Render backend takes ~50s to wake from its spun-down state.
 * The initial telemetry fetch (and explicit retries) use this timeout so the
 * console keeps showing "connecting" during a cold start instead of flipping
 * to a false "backend unreachable" error state. The 10s polling loop sticks
 * to the standard 3s timeout.
 */
const COLD_START_TIMEOUT_MS = 55_000;

/** Internal states share one displayed word per concept ("cached" reads as FALLBACK). */
const STATUS_LABELS: Record<string, string> = {
  healthy: 'HEALTHY',
  degraded: 'DEGRADED',
  fallback: 'FALLBACK',
  cached: 'FALLBACK',
  offline: 'OFFLINE',
};

/** Severity for aggregating the headline SYSTEM STATUS (higher wins). */
const STATUS_SEVERITY: Record<string, number> = {
  healthy: 0,
  cached: 1,
  fallback: 1,
  degraded: 2,
  offline: 3,
};

type AggregatedStatus = 'healthy' | 'degraded' | 'fallback' | 'offline';

/** Worst-of-all-nodes status so the headline never claims HEALTHY over a degraded node. */
function aggregateSystemStatus(topology: FullStackTopologyState): AggregatedStatus {
  const nodes = [topology.backend_status, topology.database_status, topology.github_proxy_status];
  return nodes.reduce<AggregatedStatus>(
    (worst, current) =>
      STATUS_SEVERITY[current] > STATUS_SEVERITY[worst] ? (current as AggregatedStatus) : worst,
    'healthy',
  );
}

/** Locale time with timezone — RTT readers aren't necessarily in the visitor's zone. */
function formatTimestamp(): string {
  return new Date().toLocaleTimeString(undefined, { timeZoneName: 'short' });
}

export const FullStackMonitoringDashboard: React.FC = () => {
  const { theme } = useTheme();

  const [topology, setTopology] = useState<FullStackTopologyState>({
    frontend_status: 'healthy',
    backend_status: 'healthy',
    database_status: 'healthy',
    github_proxy_status: 'healthy',
    network_rtt_ms: null,
    database_latency_ms: null,
    database_engine: 'PostgreSQL',
    last_check_timestamp: null,
  });

  const [backendTelemetry, setBackendTelemetry] = useState<BackendTelemetry | null>(null);
  const [browserMetrics, setBrowserMetrics] = useState<BrowserPerformanceMetrics | null>(null);
  const [storageAudit, setStorageAudit] = useState<SessionStorageAudit | null>(null);
  const [diagnosticSuite, setDiagnosticSuite] = useState<DiagnosticCheckItem[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [showErrorBanner, setShowErrorBanner] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diagnosticsSectionRef = useRef<HTMLElement | null>(null);

  const showActionNotice = useCallback((message: string) => {
    setActionNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setActionNotice(null), 3000);
  }, []);

  useEffect(() => {
    // Clear any pending notice timer on unmount.
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const refreshTelemetry = useCallback(async (options?: { timeoutMs?: number }) => {
    const timeoutMs = options?.timeoutMs;
    const rum = getBrowserPerformanceMetrics();
    setBrowserMetrics(rum);
    const audit = auditSessionStorage();
    setStorageAudit(audit);

    if (isSimulatedOffline) {
      setTopology({
        frontend_status: 'healthy',
        backend_status: 'fallback',
        database_status: 'fallback',
        github_proxy_status: 'cached',
        network_rtt_ms: null,
        database_latency_ms: null,
        database_engine: 'PostgreSQL',
        last_check_timestamp: formatTimestamp(),
      });
      setBackendTelemetry(null);
      setIsInitialLoad(false);
      return;
    }

    const rtt = await benchmarkNetworkRTT(timeoutMs);
    const telemetry = await fetchBackendTelemetry(timeoutMs);

    // Probe the proxy endpoint itself so the topology node reflects the
    // proxy's real state (including stale-cache degradation) instead of
    // inferring health from /telemetry reachability.
    let githubStatus: FullStackTopologyState['github_proxy_status'];
    if (!rtt.isOnline) {
      githubStatus = 'offline';
    } else {
      githubStatus = (await probeGithubProxyHealth(undefined, timeoutMs)).status;
    }

    const dbTelemetry = telemetry.data?.database;
    const dbStatus: 'healthy' | 'degraded' | 'offline' | 'fallback' = !rtt.isOnline
      ? 'offline'
      : dbTelemetry?.status === 'ok'
      ? 'healthy'
      : dbTelemetry?.status === 'unhealthy'
      ? 'degraded'
      : 'fallback';

    setTopology({
      frontend_status: 'healthy',
      backend_status: rtt.isOnline ? 'healthy' : 'offline',
      database_status: dbStatus,
      github_proxy_status: githubStatus,
      network_rtt_ms: rtt.latency_ms,
      database_latency_ms: dbTelemetry?.latency_ms ?? null,
      database_engine: dbTelemetry?.engine === 'sqlite' ? 'SQLite' : 'PostgreSQL',
      last_check_timestamp: formatTimestamp(),
    });

    if (telemetry.data) {
      setBackendTelemetry(telemetry.data);
    } else {
      setBackendTelemetry(null);
    }

    // Surface a top-level error banner only when the backend is truly unreachable
    // (network probe offline AND telemetry is falling back to local data).
    setShowErrorBanner(!rtt.isOnline && telemetry.isFallback);
    setIsInitialLoad(false);
  }, [isSimulatedOffline]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const initialLoad = async () => {
      // First connect tolerates the ~50s free-tier cold start, so visitors
      // see "connecting" (accurate) instead of a false offline error state.
      await refreshTelemetry({ timeoutMs: COLD_START_TIMEOUT_MS });
      if (cancelled) return;
      intervalId = setInterval(() => {
        // Don't poll when the tab is hidden — avoids wasted requests.
        if (document.visibilityState === 'visible') {
          refreshTelemetry();
        }
      }, 10000);
    };
    initialLoad();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshTelemetry]);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    await refreshTelemetry();
    const results = await runE2EDiagnosticSuite((partial) => setDiagnosticSuite(partial));
    setDiagnosticSuite(results);
    setIsRunningDiagnostics(false);
    // The results render below the fold (especially on mobile) — bring them into view.
    diagnosticsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleFlushCache = async () => {
    try {
      // Only clear GitHub-related cache keys — preserve other sessionStorage entries.
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('gh_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => sessionStorage.removeItem(key));
      await refreshTelemetry();
      showActionNotice('GitHub browser cache cleared');
    } catch {
      // ignore
    }
  };

  const handleToggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    // Retry with the cold-start timeout — a failure banner often means the
    // backend was mid-wake, and the container may still need ~50s.
    await refreshTelemetry({ timeoutMs: COLD_START_TIMEOUT_MS });
    setIsRetrying(false);
  };

  const handleExportReport = () => {
    exportDiagnosticReport({
      timestamp: new Date().toISOString(),
      theme,
      topology,
      backendTelemetry,
      browserMetrics,
      storageAudit,
      diagnosticSuite,
    });
    showActionNotice('Diagnostic report downloaded');
  };

  return (
    <div className={`fullstack-monitoring-dashboard theme-${theme}`}>
      <BoxContainer title="FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD">
        {isInitialLoad ? (
          <div className="monitoring-loading" role="status" aria-live="polite">
            <div className="monitoring-spinner" aria-hidden="true" />
            <p>Connecting to backend…</p>
            <p className="monitoring-loading-hint">
              Free-tier instances take up to ~50s to wake from inactivity —
              holding here instead of reporting offline.
            </p>
          </div>
        ) : (
          <>
            {showErrorBanner && (
              <div className="monitoring-error-banner" role="alert">
                <span className="monitoring-error-message">
                  <AlertTriangle size={15} aria-hidden="true" />
                  Backend unreachable — showing fallback data.
                </span>
                <div className="monitoring-error-actions">
                  <button
                    type="button"
                    className="action-btn monitoring-retry-btn"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? 'Retrying…' : 'Retry'}
                  </button>
                  <button
                    type="button"
                    className="action-btn monitoring-dismiss-btn"
                    onClick={() => setShowErrorBanner(false)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

        <div className="monitoring-header">
          <div className="status-overview">
            <span className={`status-badge ${aggregateSystemStatus(topology)}`}>
              SYSTEM STATUS: {STATUS_LABELS[aggregateSystemStatus(topology)] ?? 'HEALTHY'}
            </span>
            {topology.network_rtt_ms !== null && (
              <span className="latency-badge">
                <Zap size={13} aria-hidden="true" />
                RTT: {topology.network_rtt_ms}ms
              </span>
            )}
            {topology.last_check_timestamp && (
              <span className="last-check-badge">
                <Clock size={13} aria-hidden="true" />
                Last updated: {topology.last_check_timestamp}
              </span>
            )}
          </div>

          <div className="monitoring-actions">
            <button
              type="button"
              className="action-btn diag-btn"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              title="Ping backend & run 5-step synthetic diagnostic suite"
            >
              <FlaskConical size={14} aria-hidden="true" />
              {isRunningDiagnostics ? 'Running…' : 'Run Diagnostics'}
            </button>
            <button
              type="button"
              className="action-btn flush-btn"
              onClick={handleFlushCache}
              title="Clear the GitHub sessionStorage cache (server-side TTL cache is unaffected)"
            >
              <Trash2 size={14} aria-hidden="true" />
              Flush Cache
            </button>
            <button
              type="button"
              className={`action-btn toggle-offline-btn ${isSimulatedOffline ? 'active' : ''}`}
              onClick={handleToggleSimulatedOffline}
              aria-pressed={isSimulatedOffline}
              title="Simulate backend loss to preview graceful degradation"
            >
              <WifiOff size={14} aria-hidden="true" />
              {isSimulatedOffline ? 'Simulation on' : 'Simulate offline'}
            </button>
            <button
              type="button"
              className="action-btn export-btn"
              onClick={handleExportReport}
              title="Download the current telemetry + diagnostic state as JSON"
            >
              <Download size={14} aria-hidden="true" />
              Export Log
            </button>
            {actionNotice && (
              <span className="monitoring-action-notice" role="status">
                {actionNotice}
              </span>
            )}
          </div>
        </div>

        {/* 1. Live Full-Stack Architecture Topology */}
        <section className="monitoring-section topology-section">
          <h3 className="section-title">1. LIVE FULL-STACK ARCHITECTURE TOPOLOGY</h3>
          <div className="topology-map">
            <div className="topology-tier client-tier">
              <div className="topology-node frontend-node">
                <span className="node-icon">
                  <Globe size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="node-title">React 18 SPA</span>
                <span className="node-subtitle">Cloudflare Pages</span>
                <span className="node-status healthy">HEALTHY</span>
              </div>
            </div>

            <div className="topology-connector primary-connector">
              <span className="line" />
              <span className="connector-label">
                {topology.network_rtt_ms !== null ? `${topology.network_rtt_ms}ms RTT` : 'CORS / REST'}
              </span>
              <span className="arrow">
                <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
              </span>
            </div>

            <div className="topology-tier service-tier">
              <div className={`topology-node backend-node ${topology.backend_status}`}>
                <span className="node-icon">
                  <Server size={20} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="node-title">FastAPI Backend</span>
                <span className="node-subtitle">Render (Docker)</span>
                <span className={`node-status ${topology.backend_status}`}>
                  {STATUS_LABELS[topology.backend_status] ?? topology.backend_status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="topology-downstream-group">
              {/* Branch: PostgreSQL Database Persistence */}
              <div className="topology-branch">
                <div className="topology-connector branch-connector">
                  <span className="line" />
                  <span className="connector-label">
                    {topology.database_latency_ms !== null && topology.database_latency_ms !== undefined
                      ? `${topology.database_latency_ms}ms Query`
                      : 'SQLAlchemy'}
                  </span>
                  <span className="arrow">
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                </div>
                <div className={`topology-node database-node ${topology.database_status}`}>
                  <span className="node-icon">
                    <Database size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="node-title">{topology.database_engine || 'PostgreSQL'} DB</span>
                  <span className="node-subtitle">
                    {topology.database_engine === 'SQLite' ? 'Local SQLite' : 'Render Postgres'}
                  </span>
                  <span className={`node-status ${topology.database_status}`}>
                    {STATUS_LABELS[topology.database_status] ?? topology.database_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Branch: GitHub REST API Proxy Cache */}
              <div className="topology-branch">
                <div className="topology-connector branch-connector">
                  <span className="line" />
                  <span className="connector-label">15-Min TTL Proxy</span>
                  <span className="arrow">
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                </div>
                <div className={`topology-node github-node ${topology.github_proxy_status}`}>
                  <span className="node-icon">
                    <Github size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="node-title">GitHub REST API</span>
                  <span className="node-subtitle">api.github.com</span>
                  <span className={`node-status ${topology.github_proxy_status}`}>
                    {STATUS_LABELS[topology.github_proxy_status] ?? topology.github_proxy_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="topology-legend">
            <span>
              <i className="legend-dot ok" aria-hidden="true" />
              Healthy — live data
            </span>
            <span>
              <i className="legend-dot warn" aria-hidden="true" />
              Degraded — stale / partial data
            </span>
            <span>
              <i className="legend-dot fall" aria-hidden="true" />
              Fallback — stored data
            </span>
            <span>
              <i className="legend-dot bad" aria-hidden="true" />
              Offline — unreachable
            </span>
          </div>
        </section>

        {/* 2. Telemetry Grid */}
        <div className="telemetry-grid">
          <div className="telemetry-card browser-rum-card">
            <h4 className="card-title">2. FRONTEND BROWSER RUM &amp; CACHE</h4>
            <p className="card-note">Measured for this page view via the Navigation Timing API.</p>
            {browserMetrics && (
              <div className="telemetry-metrics">
                <div className="metric-row">
                  <span className="metric-label">Time To First Byte (TTFB):</span>
                  <span className="metric-value">{browserMetrics.ttfb_ms} ms</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">DOM Interactive:</span>
                  <span className="metric-value">{browserMetrics.dom_interactive_ms} ms</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Total DOM Nodes:</span>
                  <span className="metric-value">{browserMetrics.dom_nodes_count} elements</span>
                </div>
                {browserMetrics.js_heap_used_mb && (
                  <div className="metric-row">
                    <span className="metric-label">JS Heap Memory:</span>
                    <span className="metric-value">{browserMetrics.js_heap_used_mb} MB</span>
                  </div>
                )}
                {storageAudit && (
                  <>
                    <div className="metric-row">
                      <span className="metric-label">SessionStorage Size:</span>
                      <span className="metric-value">
                        {storageAudit.bytes_used} bytes ({storageAudit.total_keys} keys)
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">GitHub Cache Status:</span>
                      <span className="metric-value">
                        {storageAudit.is_cache_active
                          ? `ACTIVE (${storageAudit.github_cache_age_seconds ?? 0}s old)`
                          : 'EMPTY / INACTIVE'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="telemetry-card backend-telemetry-card">
            <h4 className="card-title">3. BACKEND PROCESS TELEMETRY</h4>
            {backendTelemetry ? (
              <div className="telemetry-metrics">
                <div className="metric-row">
                  <span className="metric-label">Process Uptime:</span>
                  <span className="metric-value">{formatUptime(backendTelemetry.process.uptime_seconds)}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Memory RSS:</span>
                  <span className="metric-value">{backendTelemetry.process.memory_rss_mb} MB</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Python Version:</span>
                  <span className="metric-value">{backendTelemetry.process.python_version}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Rate Limit (configured):</span>
                  <span className="metric-value">{backendTelemetry.rate_limit.active_window}</span>
                </div>
                {backendTelemetry.database && (
                  <>
                    <div className="metric-row">
                      <span className="metric-label">Database Status:</span>
                      <span className="metric-value">
                        {backendTelemetry.database.status === 'ok'
                          ? `HEALTHY (${backendTelemetry.database.latency_ms != null ? `${backendTelemetry.database.latency_ms}ms` : 'N/A'})`
                          : backendTelemetry.database.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Database Engine:</span>
                      <span className="metric-value">
                        {backendTelemetry.database.engine
                          ? backendTelemetry.database.engine === 'postgresql'
                            ? 'PostgreSQL (psycopg3)'
                            : backendTelemetry.database.engine === 'sqlite'
                            ? 'SQLite'
                            : backendTelemetry.database.engine.toUpperCase()
                          : 'UNKNOWN'}
                      </span>
                    </div>
                  </>
                )}
                <div className="metric-row">
                  <span className="metric-label">Environment:</span>
                  <span className="metric-value">{backendTelemetry.process.environment}</span>
                </div>
              </div>
            ) : (
              <div className="offline-fallback-notice">
                <p>
                  <AlertTriangle size={14} aria-hidden="true" /> FastAPI backend offline — operating
                  on graceful local fallback data.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Automated Synthetic Diagnostics */}
        {diagnosticSuite.length > 0 && (
          <section
            className="monitoring-section diagnostic-suite-section"
            ref={diagnosticsSectionRef}
          >
            <h3 className="section-title">4. AUTOMATED SYNTHETIC DIAGNOSTICS</h3>
            <div className="diagnostic-checklist">
              {diagnosticSuite.map((item) => (
                <div key={item.id} className={`diagnostic-item ${item.status}`}>
                  <div className="diag-item-header">
                    <span className={`diag-status-badge ${item.status}`}>
                      {item.status === 'pass' && (
                        <>
                          <Check size={12} aria-hidden="true" />
                          PASS
                        </>
                      )}
                      {item.status === 'fail' && (
                        <>
                          <X size={12} aria-hidden="true" />
                          FAIL
                        </>
                      )}
                      {item.status === 'running' && (
                        <>
                          <Loader2 size={12} aria-hidden="true" />
                          RUNNING
                        </>
                      )}
                      {item.status === 'pending' && (
                        <>
                          <Circle size={12} aria-hidden="true" />
                          PENDING
                        </>
                      )}
                    </span>
                    <strong className="diag-item-name">{item.name}</strong>
                    {item.latency_ms !== undefined && (
                      <span className="diag-latency">({item.latency_ms}ms)</span>
                    )}
                  </div>
                  <p className="diag-item-desc">{item.description}</p>
                  {item.details && <p className="diag-item-details">{item.details}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </BoxContainer>
    </div>
  );
};
