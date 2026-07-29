import React from 'react';
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
            This portfolio is built as a lightweight, stateful, full-stack application showcasing modern frontend architectural principles, strict typing, dynamic theming, multi-tier testing strategies, and a Python FastAPI backend.
          </p>

          {/* Interactive Swagger UI & OpenAPI Explorer Box */}
          <div className="api-explorer-card">
            <h3 className="api-explorer-title">⚡ FASTAPI INTERACTIVE SWAGGER UI</h3>
            <p className="api-explorer-desc">
              Explore and test backend REST API endpoints (`/api/profile`, `/api/projects`, `/api/now`, `/api/github-summary`) interactively using the auto-generated Swagger UI and ReDoc specifications.
            </p>
            <div className="api-explorer-actions">
              <a
                href={`${BACKEND_BASE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-explorer-btn primary"
              >
                🚀 Open Swagger UI (/docs)
              </a>
              <a
                href={`${BACKEND_BASE_URL}/redoc`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-explorer-btn secondary"
              >
                📖 Open ReDoc (/redoc)
              </a>
              <a
                href={`${BACKEND_BASE_URL}/openapi.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="api-explorer-btn secondary"
              >
                📋 OpenAPI JSON Schema
              </a>
              <a
                href="https://chris-lau-storybook.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="api-explorer-btn secondary"
              >
                🎨 Live Storybook UI
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
