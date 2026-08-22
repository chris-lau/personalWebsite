import React, { useState, useEffect, useCallback } from 'react';
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
} from '../../utils/telemetry';
import {
  benchmarkNetworkRTT,
  fetchBackendTelemetry,
  runE2EDiagnosticSuite,
} from '../../api/telemetryApi';
import './FullStackMonitoringDashboard.css';

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

  const refreshTelemetry = useCallback(async () => {
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
        last_check_timestamp: new Date().toLocaleTimeString(),
      });
      setBackendTelemetry(null);
      setIsInitialLoad(false);
      return;
    }

    const rtt = await benchmarkNetworkRTT();
    const telemetry = await fetchBackendTelemetry();

    const dbTelemetry = telemetry.data?.database;
    const dbStatus: 'healthy' | 'degraded' | 'offline' = !rtt.isOnline
      ? 'offline'
      : dbTelemetry?.status === 'ok'
      ? 'healthy'
      : dbTelemetry?.status === 'unhealthy'
      ? 'degraded'
      : 'healthy';

    setTopology({
      frontend_status: 'healthy',
      backend_status: rtt.isOnline ? 'healthy' : 'offline',
      database_status: dbStatus,
      github_proxy_status: telemetry.data ? 'healthy' : 'cached',
      network_rtt_ms: rtt.latency_ms,
      database_latency_ms: dbTelemetry?.latency_ms ?? null,
      database_engine: dbTelemetry?.engine === 'sqlite' ? 'SQLite' : 'PostgreSQL',
      last_check_timestamp: new Date().toLocaleTimeString(),
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
    refreshTelemetry();
    const interval = setInterval(() => {
      // Don't poll when the tab is hidden — avoids wasted requests.
      if (document.visibilityState === 'visible') {
        refreshTelemetry();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    await refreshTelemetry();
    const results = await runE2EDiagnosticSuite();
    setDiagnosticSuite(results);
    setIsRunningDiagnostics(false);
  };

  const handleFlushCache = () => {
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
      refreshTelemetry();
    } catch {
      // ignore
    }
  };

  const handleToggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await refreshTelemetry();
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
  };

  return (
    <div className={`fullstack-monitoring-dashboard theme-${theme}`}>
      <BoxContainer title="FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD">
        {isInitialLoad ? (
          <div className="monitoring-loading" role="status" aria-live="polite">
            <div className="monitoring-spinner" aria-hidden="true" />
            <p>Connecting to backend…</p>
          </div>
        ) : (
          <>
            {showErrorBanner && (
              <div className="monitoring-error-banner" role="alert">
                <span className="monitoring-error-message">
                  ⚠️ Backend unreachable — showing fallback data.
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
            <span className={`status-badge ${topology.backend_status}`}>
              ● SYSTEM STATUS: {topology.backend_status.toUpperCase()}
            </span>
            {topology.network_rtt_ms !== null && (
              <span className="latency-badge">⚡ RTT: {topology.network_rtt_ms}ms</span>
            )}
            {topology.last_check_timestamp && (
              <span className="last-check-badge">🕒 Last Updated: {topology.last_check_timestamp}</span>
            )}
          </div>

          <div className="monitoring-actions">
            <button
              type="button"
              className="action-btn diag-btn"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              title="Ping Backend & Run 5-Step Synthetic Diagnostic Suite"
            >
              {isRunningDiagnostics ? '⏳ Running...' : '🔬 Run Diagnostics'}
            </button>
            <button
              type="button"
              className="action-btn flush-btn"
              onClick={handleFlushCache}
              title="Clear sessionStorage API cache"
            >
              🧹 Flush Cache
            </button>
            <button
              type="button"
              className={`action-btn toggle-offline-btn ${isSimulatedOffline ? 'active' : ''}`}
              onClick={handleToggleSimulatedOffline}
              title="Toggle simulated offline mode"
            >
              {isSimulatedOffline ? '⚙️ Offline: ON' : '🔌 Offline Mode'}
            </button>
            <button
              type="button"
              className="action-btn export-btn"
              onClick={handleExportReport}
              title="Download diagnostic log report as JSON"
            >
              📥 Export Log
            </button>
          </div>
        </div>

        {/* 1. Live Full-Stack Architecture Topology */}
        <section className="monitoring-section topology-section">
          <h3 className="section-title">&gt; 1. LIVE FULL-STACK ARCHITECTURE TOPOLOGY</h3>
          <div className="topology-map">
            <div className="topology-node frontend-node">
              <span className="node-icon">🌐</span>
              <span className="node-title">React 18 SPA</span>
              <span className="node-subtitle">Cloudflare Pages</span>
              <span className="node-status healthy">HEALTHY</span>
            </div>

            <div className="topology-connector">
              <span className="line" />
              <span className="connector-label">
                {topology.network_rtt_ms !== null ? `${topology.network_rtt_ms}ms RTT` : 'CORS / REST'}
              </span>
              <span className="arrow">►</span>
            </div>

            <div className={`topology-node backend-node ${topology.backend_status}`}>
              <span className="node-icon">🐍</span>
              <span className="node-title">FastAPI Backend</span>
              <span className="node-subtitle">Render (Docker)</span>
              <span className={`node-status ${topology.backend_status}`}>
                {topology.backend_status.toUpperCase()}
              </span>
            </div>

            <div className="topology-connector">
              <span className="line" />
              <span className="connector-label">
                {topology.database_latency_ms !== null && topology.database_latency_ms !== undefined
                  ? `${topology.database_latency_ms}ms Query`
                  : 'SQLAlchemy'}
              </span>
              <span className="arrow">►</span>
            </div>

            <div className={`topology-node database-node ${topology.database_status}`}>
              <span className="node-icon">🐘</span>
              <span className="node-title">{topology.database_engine || 'PostgreSQL'} DB</span>
              <span className="node-subtitle">
                {topology.database_engine === 'SQLite' ? 'Local DB' : 'Render Postgres'}
              </span>
              <span className={`node-status ${topology.database_status}`}>
                {topology.database_status.toUpperCase()}
              </span>
            </div>

            <div className="topology-connector">
              <span className="line" />
              <span className="connector-label">15-Min TTL Proxy</span>
              <span className="arrow">►</span>
            </div>

            <div className={`topology-node github-node ${topology.github_proxy_status}`}>
              <span className="node-icon">🐙</span>
              <span className="node-title">GitHub REST API</span>
              <span className="node-subtitle">api.github.com</span>
              <span className={`node-status ${topology.github_proxy_status}`}>
                {topology.github_proxy_status.toUpperCase()}
              </span>
            </div>
          </div>
        </section>

        {/* 2. Telemetry Grid */}
        <div className="telemetry-grid">
          <div className="telemetry-card browser-rum-card">
            <h4 className="card-title">&gt; 2. FRONTEND BROWSER RUM & CACHE</h4>
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
            <h4 className="card-title">&gt; 3. BACKEND PROCESS TELEMETRY</h4>
            {backendTelemetry ? (
              <div className="telemetry-metrics">
                <div className="metric-row">
                  <span className="metric-label">Process Uptime:</span>
                  <span className="metric-value">{backendTelemetry.process.uptime_seconds}s</span>
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
                  <span className="metric-label">Rate Limiter (slowapi):</span>
                  <span className="metric-value">{backendTelemetry.rate_limit.active_window}</span>
                </div>
                {backendTelemetry.database && (
                  <>
                    <div className="metric-row">
                      <span className="metric-label">Database Status:</span>
                      <span className="metric-value">
                        {backendTelemetry.database.status === 'ok'
                          ? `HEALTHY (${backendTelemetry.database.latency_ms ?? 0}ms)`
                          : backendTelemetry.database.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">Database Engine:</span>
                      <span className="metric-value">
                        {backendTelemetry.database.engine === 'postgresql'
                          ? 'PostgreSQL (psycopg3)'
                          : 'SQLite (personal_os.db)'}
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
                <p>⚠️ FastAPI Backend Service Offline / Operating on Graceful Local Fallback Data.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Automated Synthetic Diagnostics */}
        {diagnosticSuite.length > 0 && (
          <section className="monitoring-section diagnostic-suite-section">
            <h3 className="section-title">&gt; 4. AUTOMATED SYNTHETIC DIAGNOSTICS</h3>
            <div className="diagnostic-checklist">
              {diagnosticSuite.map((item) => (
                <div key={item.id} className={`diagnostic-item ${item.status}`}>
                  <div className="diag-item-header">
                    <span className={`diag-status-badge ${item.status}`}>
                      {item.status === 'pass' && '✓ PASS'}
                      {item.status === 'fail' && '✕ FAIL'}
                      {item.status === 'running' && '⏳ RUNNING'}
                      {item.status === 'pending' && '⚪ PENDING'}
                    </span>
                    <strong className="diag-item-name">{item.name}</strong>
                    {item.latency_ms !== undefined && (
                      <span className="diag-latency">({item.latency_ms}ms)</span>
                    )}
                  </div>
                  <p className="diag-item-desc">{item.description}</p>
                  {item.details && <p className="diag-item-details">&gt; {item.details}</p>}
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
