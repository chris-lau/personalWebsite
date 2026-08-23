import React from 'react';
import { Activity, FileText, FlaskConical, Zap } from 'lucide-react';
import { Section } from '../components/ui/Section';
import { FullStackMonitoringDashboard } from '../components/monitoring/FullStackMonitoringDashboard';
import './Pages.css';

const HIGHLIGHTS = [
  {
    Icon: Zap,
    title: 'Request Correlation',
    description: (
      <>
        UUIDv4 <code>X-Request-ID</code> header generation and propagation across all REST requests
        and response logs.
      </>
    ),
  },
  {
    Icon: FileText,
    title: 'Structured JSON Logging',
    description: (
      <>
        Machine-readable logs emitted to <code>stdout</code> with latency ms, status code, IP, and
        correlation context.
      </>
    ),
  },
  {
    Icon: FlaskConical,
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
      <header className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">
              <Activity size={28} aria-hidden="true" className="inline-icon accent" />
              <span>Full-Stack Operational Monitoring &amp; Telemetry</span>
            </h1>
            <p className="page-description">
              <strong>Exhibit:</strong> Zero-cost observability I built &mdash; browser RUM, FastAPI middleware, synthetic E2E probes.
              A live operational telemetry and health monitoring console connecting browser Real User
              Monitoring, FastAPI process metrics, and synthetic E2E diagnostics across the entire
              personal OS application stack — no cookies, no paid tiers.
            </p>
          </div>
        </div>
      </header>

      <section>
        <Section title="LIVE TELEMETRY CONSOLE" index="01">
          <p className="cold-start-note">
            ℹ️ <strong>Backend Cold Start Note:</strong> Free-tier cloud instances (Render) spin
            down after 15 mins of inactivity. Initial requests (including Swagger UI{' '}
            <code>/docs</code> &amp; diagnostic probes) may take ~50s to wake up the backend
            container. Subsequent requests respond in &lt;50ms.
          </p>

          <div className="work-list">
            {HIGHLIGHTS.map(({ Icon, title, description }) => (
              <article key={title} className="work-row">
                <div className="work-row__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div className="work-row__body">
                  <div className="work-row__titlerow">
                    <h3 className="work-row__title">{title}</h3>
                  </div>
                  <p className="work-row__desc">{description}</p>
                </div>
              </article>
            ))}
          </div>

          <FullStackMonitoringDashboard />
        </Section>
      </section>
    </div>
  );
};
