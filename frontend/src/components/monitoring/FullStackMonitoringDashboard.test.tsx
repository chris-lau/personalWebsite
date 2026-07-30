import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { FullStackMonitoringDashboard } from './FullStackMonitoringDashboard';
import { ThemeProvider } from '../../context/ThemeContext';

describe('FullStackMonitoringDashboard Component Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <FullStackMonitoringDashboard />
      </ThemeProvider>
    );
  };

  it('renders monitoring header and section titles correctly', () => {
    renderComponent();
    expect(
      screen.getAllByText(/FULL-STACK OPERATIONAL MONITORING & TELEMETRY DASHBOARD/i)[0]
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1\. LIVE FULL-STACK ARCHITECTURE TOPOLOGY/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2\. BACKEND PROCESS TELEMETRY/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/3\. FRONTEND BROWSER RUM & CACHE/i)
    ).toBeInTheDocument();
  });

  it('renders interactive action buttons', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Run Diagnostics/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Flush Cache/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Offline Mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export Log/i })).toBeInTheDocument();
  });

  it('runs diagnostic suite when Run Diagnostics button is clicked', async () => {
    renderComponent();
    const runBtn = screen.getByRole('button', { name: /Run Diagnostics/i });

    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Client Storage & Cache Integrity/i)).toBeInTheDocument();
      expect(screen.getByText(/Network RTT & CORS Validation/i)).toBeInTheDocument();
    });
  });

  it('toggles simulated offline mode when button is clicked', () => {
    renderComponent();
    const toggleBtn = screen.getByRole('button', { name: /Offline Mode/i });

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Offline: ON/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument();
  });
});
