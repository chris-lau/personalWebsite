import React from 'react';
import { Section } from '../components/ui/Section';
import { FullStackMonitoringDashboard } from '../components/monitoring/FullStackMonitoringDashboard';
import './Pages.css';

const HIGHLIGHT_CARDS = [
  {
    icon: '⚡',
    title: 'Request Correlation',
    description: (
      <>
        UUIDv4 <code>X-Request-ID</code> header generation and propagation across all REST requests
        and response logs.
      </>
    ),
  },
  {
    icon: '📄',
    title: 'Structured JSON Logging',
    description: (
      <>
        Machine-readable logs emitted to <code>stdout</code> with latency ms, status code, IP, and
        correlation context.
      </>
    ),
  },
  {
    icon: '🔬',
    title: 'Synthetic Diagnostics',
    description: (
      <>
        Automated 5-step E2E probe verifying client storage, network RTT, backend readiness, proxy
        TTL cache, and rate limits.
      </>
    ),
  },
];

export const MonitoringPage: React.FC = () => {
  return (
    <div className="page-container page-monitoring">
      <section>
        <Section title="FULL-STACK OPERATIONAL MONITORING & TELEMETRY" index="01">
          <p className="intro-text">
            <strong>Exhibit:</strong> Zero-cost observability I built &mdash; browser RUM, FastAPI middleware, synthetic E2E probes.
          </p>
          <p className="intro-text">
            Welcome to the live operational telemetry and health monitoring console. This system
            provides zero-cost, zero-cookie observability across the entire personal OS application
            stack — connecting browser Real User Monitoring (RUM), FastAPI process metrics, and
            synthetic E2E diagnostics.
          </p>

          <p className="cold-start-note">
            ℹ️ <strong>Backend Cold Start Note:</strong> Free-tier cloud instances (Render) spin
            down after 15 mins of inactivity. Initial requests (including Swagger UI{' '}
            <code>/docs</code> &amp; diagnostic probes) may take ~50s to wake up the backend
            container. Subsequent requests respond in &lt;50ms.
          </p>

          <div className="monitoring-page-highlights">
            {HIGHLIGHT_CARDS.map((card) => (
              <div key={card.title} className="highlight-card">
                <h4 className="highlight-card-title">
                  {card.icon} {card.title}
                </h4>
                <p className="highlight-card-desc">{card.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Live Operational Monitoring Dashboard */}
        <FullStackMonitoringDashboard />
      </section>
    </div>
  );
};
