import React from 'react';
import { BoxContainer } from '../components/ui/BoxContainer';
import { FullStackMonitoringDashboard } from '../components/monitoring/FullStackMonitoringDashboard';
import './Pages.css';

export const MonitoringPage: React.FC = () => {
  return (
    <div className="page-container page-monitoring">
      <section>
        <BoxContainer title="FULL-STACK OPERATIONAL MONITORING & TELEMETRY">
          <p className="intro-text">
            Welcome to the live operational telemetry and health monitoring console. This system provides zero-cost, zero-cookie observability across the entire personal OS application stack — connecting browser Real User Monitoring (RUM), FastAPI process metrics, and synthetic E2E diagnostics.
          </p>

          {/* Render Cold Start Notice Banner */}
          <div
            className="cold-start-notice-banner"
            style={{
              margin: '1rem 0',
              padding: '0.85rem 1.1rem',
              border: '1px solid var(--accent-color, #e74c3c)',
              borderRadius: '4px',
              backgroundColor: 'var(--card-bg, rgba(231, 76, 60, 0.08))',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>⚠️</span>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.45' }}>
              <strong>Understanding Backend Inactivity Cold Starts & Delays:</strong>
              <p style={{ margin: '0.35rem 0 0 0', opacity: 0.9 }}>
                The Python FastAPI backend is hosted on a free-tier container instance (Render). After 15 minutes of inactivity, the container automatically spins down to 0 instances to conserve cloud resources.
              </p>
              <p style={{ margin: '0.35rem 0 0 0', opacity: 0.9 }}>
                <strong>Does this affect Swagger UI (/docs) and live endpoints? YES.</strong> The <strong>very first request</strong> sent to ANY endpoint — whether clicking <em>[ Try it out ]</em> on Swagger UI (/docs), triggering dashboard ping buttons, or fetching data — will experience a <strong>50+ second wake-up delay</strong> while Render provisions and boots the Docker container. Once awake, all subsequent requests execute in sub-50ms.
              </p>
            </div>
          </div>

          <div
            className="monitoring-page-highlights"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              className="highlight-card"
              style={{
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '4px',
                backgroundColor: 'var(--card-bg, rgba(0, 0, 0, 0.15))',
              }}
            >
              <h4
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  color: 'var(--accent-color, #3498db)',
                  margin: '0 0 0.4rem 0',
                }}
              >
                ⚡ Request Correlation
              </h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: 0 }}>
                UUIDv4 <code>X-Request-ID</code> header generation and propagation across all REST requests and response logs.
              </p>
            </div>

            <div
              className="highlight-card"
              style={{
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '4px',
                backgroundColor: 'var(--card-bg, rgba(0, 0, 0, 0.15))',
              }}
            >
              <h4
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  color: 'var(--accent-color, #3498db)',
                  margin: '0 0 0.4rem 0',
                }}
              >
                📄 Structured JSON Logging
              </h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: 0 }}>
                Machine-readable logs emitted to <code>stdout</code> with latency ms, status code, IP, and correlation context.
              </p>
            </div>

            <div
              className="highlight-card"
              style={{
                padding: '0.85rem 1rem',
                border: '1px solid var(--border-color, #333)',
                borderRadius: '4px',
                backgroundColor: 'var(--card-bg, rgba(0, 0, 0, 0.15))',
              }}
            >
              <h4
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  color: 'var(--accent-color, #3498db)',
                  margin: '0 0 0.4rem 0',
                }}
              >
                🔬 Synthetic Diagnostics
              </h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.85, margin: 0 }}>
                Automated 5-step E2E probe verifying client storage, network RTT, backend readiness, proxy TTL cache, and rate limits.
              </p>
            </div>
          </div>
        </BoxContainer>

        {/* Live Operational Monitoring Dashboard */}
        <FullStackMonitoringDashboard />
      </section>
    </div>
  );
};
