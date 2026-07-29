import React from 'react';
import { NavLink } from 'react-router-dom';
import { siteArchitectureData } from '../data/siteArchitecture';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export const HowThisSiteWorksPage: React.FC = () => {
  return (
    <div className="page-container page-how-it-works">
      <section>
        <BoxContainer title="HOW THIS SITE WORKS">
          <p className="intro-text">
            This portfolio is built as a lightweight, stateful, full-stack application showcasing modern frontend architectural principles, strict typing, dynamic theming, multi-tier testing strategies, real-time telemetry, and a Python FastAPI backend.
          </p>

          {/* Render Cold Start Note */}
          <p
            className="cold-start-note"
            style={{
              fontSize: '0.8rem',
              opacity: 0.85,
              margin: '0.75rem 0 1rem 0',
              padding: '0.4rem 0.75rem',
              borderLeft: '3px solid var(--accent-color, #3498db)',
              backgroundColor: 'var(--card-bg, rgba(0, 0, 0, 0.1))',
              borderRadius: '0 4px 4px 0',
            }}
          >
            ℹ️ <strong>Backend Cold Start Note:</strong> Free-tier cloud instances (Render) spin down after 15 mins of inactivity. Initial requests (including Swagger UI <code>/docs</code> &amp; diagnostic probes) may take ~50s to wake up the backend container. Subsequent requests respond in &lt;50ms.
          </p>

          {/* Top Quick Explorer Bar */}
          <div className="quick-explorer-bar">
            <h3 className="quick-explorer-title">&gt; LIVE EXPLORERS & OPERATIONAL CONSOLES</h3>
            <div className="quick-explorer-buttons">
              <NavLink to="/monitoring" className="explorer-badge-btn monitoring">
                📊 Live Monitoring Console (/monitoring)
              </NavLink>
              <a
                href="https://chris-lau-storybook.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn storybook"
              >
                🎨 Live Storybook UI
              </a>
              <a
                href={`${BACKEND_BASE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn swagger"
              >
                ⚡ FastAPI Swagger UI (/docs)
              </a>
              <a
                href={`${BACKEND_BASE_URL}/redoc`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn redoc"
              >
                📖 ReDoc Specs (/redoc)
              </a>
              <a
                href={`${BACKEND_BASE_URL}/openapi.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn openapi"
              >
                📋 OpenAPI Schema
              </a>
            </div>
          </div>

          <div className="stack-sections">
            {siteArchitectureData.map((sec) => (
              <div key={sec.category} className="stack-group">
                <h3 className="stack-group-title">&gt; {sec.category}</h3>
                <div className="stack-list">
                  {sec.items.map((item) => (
                    <div key={item.name} className="stack-item">
                      <h4 className="stack-item-name">* {item.name}</h4>
                      <p className="stack-item-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
