import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { FullStackMonitoringDashboard } from './FullStackMonitoringDashboard';
import { ThemeProvider } from '../../context/ThemeContext';
import * as telemetryApi from '../../api/telemetryApi';

describe('FullStackMonitoringDashboard Component Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('renders monitoring header and section titles once probes resolve', async () => {
    mockHealthyProbes();
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getAllByText(/FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD/i)[0]
      ).toBeInTheDocument();
      expect(screen.getByText(/1\. LIVE FULL-STACK ARCHITECTURE TOPOLOGY/i)).toBeInTheDocument();
      expect(screen.getByText(/2\. FRONTEND BROWSER RUM & CACHE/i)).toBeInTheDocument();
      expect(screen.getByText(/3\. BACKEND PROCESS TELEMETRY/i)).toBeInTheDocument();
    });
  });

  it('renders interactive action buttons once loaded', async () => {
    mockHealthyProbes();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Run Diagnostics/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Flush Cache/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Offline Mode/i })).toBeInTheDocument();
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
    const toggleBtn = await screen.findByRole('button', { name: /Offline Mode/i });

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Offline: ON/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
  });

  it('shows an error banner when the backend is unreachable', async () => {
    vi.spyOn(telemetryApi, 'benchmarkNetworkRTT').mockResolvedValue({
      isOnline: false,
      latency_ms: null,
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
      latency_ms: null,
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
});
