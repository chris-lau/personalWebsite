import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ShoppingBag, MessageSquare, Sparkles, Terminal, BookOpen, FileCode, Info } from 'lucide-react';
import { siteArchitectureData } from '../data/siteArchitecture';
import { Section } from '../components/ui/Section';
import { BACKEND_ROOT_URL } from '../api/config';
import { openChat } from '../components/chat/chatControl';
import './Pages.css';

export const HowThisSiteWorksPage: React.FC = () => {
  const handleOpenChatObservability = () => {
    try {
      localStorage.setItem('chat_companion_mode', 'true');
    } catch {
      // ignore
    }
    openChat();
  };

  return (
    <div className="page-container page-how-it-works">
      <section>
        <Section title="HOW THIS SITE WORKS" index="01">
          <p className="intro-text">
            This portfolio is built as a lightweight, stateful, full-stack application showcasing modern frontend architectural principles, strict typing, dynamic theming, multi-tier testing strategies, real-time telemetry, and a Python FastAPI backend.
          </p>

          {/* Render Cold Start Note */}
          <p className="cold-start-note">
            <Info size={15} aria-hidden="true" className="inline-icon" />
            <strong>Backend Cold Start Note:</strong> Free-tier cloud instances (Render) spin down after 15 mins of inactivity. Initial requests (including Swagger UI <code>/docs</code> &amp; diagnostic probes) may take ~50s to wake up the backend container. Subsequent requests respond in &lt;50ms.
          </p>

          {/* Top Quick Explorer Bar */}
          <div className="quick-explorer-bar">
            <h3 className="quick-explorer-title">&gt; LIVE EXPLORERS & OPERATIONAL CONSOLES</h3>
            <div className="quick-explorer-buttons">
              <NavLink to="/monitoring" className="explorer-badge-btn monitoring">
                <Activity size={15} aria-hidden="true" />
                <span>Live Monitoring Console (/monitoring)</span>
              </NavLink>
              <NavLink to="/amazon-tools" className="explorer-badge-btn amazon">
                <ShoppingBag size={15} aria-hidden="true" />
                <span>Amazon Seller Suite (/amazon-tools)</span>
              </NavLink>
              <button
                type="button"
                className="explorer-badge-btn chat-obs"
                onClick={handleOpenChatObservability}
              >
                <MessageSquare size={15} aria-hidden="true" />
                <span>Chat Observability &amp; Telemetry</span>
              </button>
              <a
                href="https://chris-lau-storybook.pages.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn storybook"
              >
                <Sparkles size={15} aria-hidden="true" />
                <span>Live Storybook UI</span>
              </a>
              <a
                href={`${BACKEND_ROOT_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn swagger"
              >
                <Terminal size={15} aria-hidden="true" />
                <span>FastAPI Swagger UI (/docs)</span>
              </a>
              <a
                href={`${BACKEND_ROOT_URL}/redoc`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn redoc"
              >
                <BookOpen size={15} aria-hidden="true" />
                <span>ReDoc Specs (/redoc)</span>
              </a>
              <a
                href={`${BACKEND_ROOT_URL}/openapi.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-badge-btn openapi"
              >
                <FileCode size={15} aria-hidden="true" />
                <span>OpenAPI Schema</span>
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
        </Section>
      </section>
    </div>
  );
};
