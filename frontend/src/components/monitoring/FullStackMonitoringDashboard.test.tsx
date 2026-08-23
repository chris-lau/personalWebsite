import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { FullStackMonitoringDashboard } from './FullStackMonitoringDashboard';
import { ThemeProvider } from '../../context/ThemeContext';
import * as telemetryApi from '../../api/telemetryApi';
import { DiagnosticCheckItem } from '../../types/monitoring';

describe('FullStackMonitoringDashboard Component Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: GitHub proxy probe reports healthy unless a test overrides it.
    vi.spyOn(telemetryApi, 'probeGithubProxyHealth').mockResolvedValue({
      status: 'healthy',
      cached: true,
      stale: false,
    });
  });

  // Default happy-path mocks: backend online with telemetry data.
  const mockHealthyProbes = () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: true,
      latency_ms: 42,
      status: 'healthy',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        process: {
          uptime_seconds: 100,
          memory_rss_mb: 50,
          python_version: '3.11',
          environment: 'production',
        },
        cache: { github_cache_hits: 1, github_cache_misses: 0, ttl_seconds: 900, is_cached: true },
        rate_limit: { limit_per_minute: 60, active_window: '1/60' },
        database: {
          status: 'ok',
          latency_ms: 1.5,
          engine: 'postgresql',
        },
      },
      isFallback: false,
    });
  };

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <FullStackMonitoringDashboard />
      </ThemeProvider>
    );
  };

  it('renders a loading state on initial mount before probes resolve', () => {
    // Probes never resolve — dashboard stays in loading state.
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockReturnValue(new Promise(() => {}));
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockReturnValue(new Promise(() => {}));

    renderComponent();
    expect(screen.getByText(/Connecting to backend/i)).toBeInTheDocument();
    // Dashboard content is gated behind loading
    expect(screen.queryByText(/SYSTEM STATUS/i)).not.toBeInTheDocument();
  });

  it('renders monitoring header, topology nodes including PostgreSQL DB, and section titles once probes resolve', async () => {
    mockHealthyProbes();
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText(/FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD/i)[0]
      ).toBeInTheDocument();
      expect(screen.getByText(/1\. LIVE FULL-STACK ARCHITECTURE TOPOLOGY/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. FRONTEND BROWSER RUM & CACHE/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. BACKEND PROCESS TELEMETRY/i)).toBeInTheDocument();
      expect(screen.getByText(/PostgreSQL DB/i)).toBeInTheDocument();
      expect(screen.getByText(/Render Postgres/i)).toBeInTheDocument();
      expect(screen.getByText(/HEALTHY \(1.5ms\)/i)).toBeInTheDocument();
    });
  });

  it('renders interactive action buttons once loaded', async () => {
    mockHealthyProbes();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Diagnostics/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Flush Cache' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simulate offline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Log/i })).toBeInTheDocument();
  });

  it('runs diagnostic suite when Run Diagnostics button is clicked', async () => {
    mockHealthyProbes();
    vi.spyOn(telemetryApi, 'runE2EDiagnosticSuite').mockResolvedValue([
      {
        id: 'storage',
        name: 'Client Storage & Cache Integrity',
        description: 'Verifies sessionStorage cache state',
        status: 'pass',
        latency_ms: 1,
      },
      {
        id: 'rtt',
        name: 'Network RTT & CORS Validation',
        description: 'Pings backend health endpoint',
        status: 'pass',
        latency_ms: 42,
      },
    ]);

    renderComponent();
    const runBtn = await screen.findByRole('button', { name: /Run Diagnostics/i });

    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Client Storage & Cache Integrity/i)).toBeInTheDocument();
      expect(screen.getByText(/Network RTT & CORS Validation/i)).toBeInTheDocument();
    });
  });

  it('toggles simulated offline mode when button is clicked', async () => {
    mockHealthyProbes();
    renderComponent();
    const toggleBtn = await screen.findByRole('button', { name: /Simulate offline/i });

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Simulation on/i })).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Simulate offline/i })).toBeInTheDocument();
  });

  it('shows an error banner when the backend is unreachable', async () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: false,
      latency_ms: 0,
      status: 'offline',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: null,
      isFallback: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Backend unreachable — showing fallback data/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dismiss/i })).toBeInTheDocument();
  });

  it('does not show an error banner when the backend is healthy', async () => {
    mockHealthyProbes();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/SYSTEM STATUS: HEALTHY/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/Backend unreachable/i)).not.toBeInTheDocument();
  });

  it('dismisses the error banner when Dismiss is clicked', async () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: false,
      latency_ms: 0,
      status: 'offline',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: null,
      isFallback: true,
    });

    renderComponent();
    const dismissBtn = await screen.findByRole('button', { name: /Dismiss/i });
    fireEvent.click(dismissBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Backend unreachable/i)).not.toBeInTheDocument();
    });
  });

  it('renders DEGRADED database status when database probe reports unhealthy', async () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: true,
      latency_ms: 42,
      status: 'healthy',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        process: {
          uptime_seconds: 100,
          memory_rss_mb: 50,
          python_version: '3.11',
          environment: 'production',
        },
        cache: { github_cache_hits: 1, github_cache_misses: 0, ttl_seconds: 900, is_cached: true },
        rate_limit: { limit_per_minute: 60, active_window: '1/60' },
        database: {
          status: 'unhealthy',
          latency_ms: 5.0,
          engine: 'postgresql',
        },
      },
      isFallback: false,
    });

    renderComponent();

    await waitFor(() => {
      const dbNode = screen
        .getByText('PostgreSQL DB', { exact: true })
        .closest('.topology-node');
      expect(dbNode?.textContent).toMatch(/DEGRADED/);
    });
    // The aggregated headline must not claim HEALTHY over a degraded database.
    await waitFor(() => {
      expect(screen.getByText(/SYSTEM STATUS: DEGRADED/i)).toBeInTheDocument();
    });
  });

  it('renders FALLBACK database status when telemetry data falls back without crashing or false positive', async () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: true,
      latency_ms: 30,
      status: 'healthy',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: null,
      isFallback: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/FALLBACK/i).length).toBeGreaterThan(0);
    });
  });

  it('renders DEGRADED GitHub proxy node when the probe reports stale-cache degradation', async () => {
    mockHealthyProbes();
    vi.spyOn(telemetryApi, 'probeGithubProxyHealth').mockResolvedValue({
      status: 'degraded',
      cached: true,
      stale: true,
    });

    renderComponent();

    await waitFor(() => {
      const githubNode = screen
        .getByText('GitHub REST API', { exact: true })
        .closest('.topology-node');
      expect(githubNode?.textContent).toMatch(/DEGRADED/);
    });
  });

  it('renders OFFLINE GitHub proxy node when the proxy probe fails while the backend is online', async () => {
    mockHealthyProbes();
    vi.spyOn(telemetryApi, 'probeGithubProxyHealth').mockResolvedValue({
      status: 'offline',
      cached: false,
      stale: false,
    });

    renderComponent();

    await waitFor(() => {
      const githubNode = screen
        .getByText('GitHub REST API', { exact: true })
        .closest('.topology-node');
      expect(githubNode?.textContent).toMatch(/OFFLINE/);
    });
  });

  it('does not mark the GitHub proxy healthy merely because /telemetry responded', async () => {
    // Regression guard for the HEALTHY-vs-FAIL contradiction: telemetry is
    // reachable (healthy DB, healthy RTT) but the proxy probe errors.
    mockHealthyProbes();
    vi.spyOn(telemetryApi, 'probeGithubProxyHealth').mockResolvedValue({
      status: 'offline',
      cached: false,
      stale: false,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/SYSTEM STATUS: OFFLINE/i)).toBeInTheDocument();
    });
    // The GitHub topology node must not claim HEALTHY alongside it.
    const githubNode = screen.getByText('GitHub REST API', { exact: true }).closest('.topology-node');
    expect(githubNode).not.toBeNull();
    expect(githubNode?.textContent).not.toMatch(/HEALTHY/);
  });

  it('waits out the free-tier cold start on initial connect instead of timing out at 3s', async () => {
    const rttSpy = vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: true,
      latency_ms: 42,
      status: 'healthy',
    });
    vi.spyOn(telemetryApi, 'fetchBackendTelemetry').mockResolvedValue({
      data: null,
      isFallback: true,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText(/FALLBACK/i).length).toBeGreaterThan(0);
    });
    expect(rttSpy).toHaveBeenCalledWith(55_000);
  });

  it('streams partial diagnostic states through the onUpdate callback as checks progress', async () => {
    mockHealthyProbes();
    let observedCallback: ((results: DiagnosticCheckItem[]) => void) | undefined;

    vi.spyOn(telemetryApi, 'runE2EDiagnosticSuite').mockImplementation(async (onUpdate) => {
      observedCallback = onUpdate;
      onUpdate?.([
        {
          id: 'check-1-storage',
          name: 'Client Storage & Cache Integrity',
          description: 'Audits browser sessionStorage availability and active cache state.',
          status: 'running',
        },
      ]);
      return [
        {
          id: 'check-1-storage',
          name: 'Client Storage & Cache Integrity',
          description: 'Audits browser sessionStorage availability and active cache state.',
          status: 'pass',
          latency_ms: 1,
        },
      ];
    });

    renderComponent();
    const runBtn = await screen.findByRole('button', { name: /Run Diagnostics/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('PASS', { exact: true })).toBeInTheDocument();
    });
    expect(observedCallback).toBeInstanceOf(Function);
  });
});
