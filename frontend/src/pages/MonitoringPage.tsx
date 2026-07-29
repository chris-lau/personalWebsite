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

          <p
            className="cold-start-note"
            style={{
              fontSize: '0.8rem',
              opacity: 0.85,
              margin: '0.75rem 0',
              padding: '0.4rem 0.75rem',
              borderLeft: '3px solid var(--accent-color, #3498db)',
              backgroundColor: 'var(--card-bg, rgba(0, 0, 0, 0.1))',
              borderRadius: '0 4px 4px 0',
            }}
          >
            ℹ️ <strong>Backend Cold Start Note:</strong> Free-tier cloud instances (Render) spin down after 15 mins of inactivity. Initial requests (including Swagger UI <code>/docs</code> & diagnostic probes) may take ~50s to wake up the backend container. Subsequent requests respond in &lt;50ms.
          </p>

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
