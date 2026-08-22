import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Activity } from 'lucide-react';
import { BoxContainer } from '../ui/BoxContainer';
import { useChat } from '../../hooks/useChat';
import { ChatPanel } from './ChatPanel';
import { ChatObservabilityPanel } from './ChatObservabilityPanel';
import { DEFAULT_STARTERS } from './starters';
import type { ChatSessionSummary } from '../../types/chat';
import './ChatWidget.css';

const COMPANION_STORAGE_KEY = 'chat_companion_mode';
const CHAT_OPENED_ONCE_KEY = 'chat_opened_once';

export const ChatWidget: React.FC = () => {
  // The home page embeds the chat as the hero — don't show two chat surfaces.
  const { pathname } = useLocation();

  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const chat = useChat();
  const { messages, loading, isFallback, models, metricsMap, streamProgress } = chat;

  // Companion mode toggle — persisted in localStorage
  const [companionMode, setCompanionMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COMPANION_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(COMPANION_STORAGE_KEY, String(companionMode));
    } catch {
      // Private browsing / SSR — silently ignore
    }
  }, [companionMode]);

  // Pulse etiquette — only show pulse if chat has never been opened
  const [showPulse, setShowPulse] = useState<boolean>(() => {
    try {
      return localStorage.getItem(CHAT_OPENED_ONCE_KEY) === null;
    } catch {
      return true;
    }
  });

  // Mobile tab state (only relevant when companionMode is true)
  const [mobileTab, setMobileTab] = useState<'chat' | 'obs'>('chat');

  // Session summary — derived from metricsMap, lives at component level
  const sessionSummary = useMemo<ChatSessionSummary | null>(() => {
    if (metricsMap.size === 0) return null;
    const entries = Array.from(metricsMap.values());
    return {
      message_count: entries.length,
      total_prompt_tokens: entries.reduce((s, m) => s + (m.prompt_tokens ?? 0), 0),
      total_completion_tokens: entries.reduce((s, m) => s + (m.completion_tokens ?? 0), 0),
      total_estimated_cost_usd: entries.reduce((s, m) => s + m.estimated_cost_usd, 0),
      avg_ttft_client_ms: entries.reduce((s, m) => s + m.ttft_client_ms, 0) / entries.length,
      avg_duration_ms: entries.reduce((s, m) => s + m.total_duration_ms, 0) / entries.length,
      latency_history: entries.map((m) => m.total_duration_ms),
    };
  }, [metricsMap]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      // Set the flag that chat has been opened at least once
      if (showPulse) {
        try {
          localStorage.setItem(CHAT_OPENED_ONCE_KEY, 'true');
          setShowPulse(false);
        } catch {
          // Private browsing / SSR — silently ignore
        }
      }
    }
  }, [open, showPulse]);

  // Handle Escape key to close panel and return focus to launcher
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  // Return focus to launcher when panel closes (any path)
  useEffect(() => {
    if (!open) {
      // Small delay to ensure the launcher button is visible
      const timeoutId = setTimeout(() => {
        launcherRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  // Don't render the launcher if the backend reports no models AND isn't in
  // fallback mode yet (initial load). Once isFallback becomes true we show
  // the widget so the user gets the degraded message.
  if (models.length === 0 && !isFallback && messages.length === 0) {
    return null;
  }

  if (pathname === '/' || pathname === '/amazon-tools') {
    return null;
  }

  return (
    <>
      {/* Launcher button */}
      <button
        ref={launcherRef}
        type="button"
        className={`chat-launcher ${open ? 'chat-launcher--hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <MessageCircle size={22} aria-hidden="true" />
        <span className="chat-launcher__label chat-launcher__label--full">Ask this site</span>
        <span className="chat-launcher__label chat-launcher__label--short">Ask</span>
        {showPulse && <span className="chat-launcher__pulse" aria-hidden="true" />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="chat-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chat panel — companion modifier goes on <section> for width rule */}
      <section
        className={`chat-panel ${open ? 'chat-panel--open' : ''} ${companionMode ? 'chat-panel--companion' : ''}`}
        role="dialog"
        aria-label="Chat with Chris"
        aria-hidden={!open}
      >
        <BoxContainer title="CHAT">
          {/* Mobile tab toggle (rendered only in companion mode).
              Full WAI-ARIA tablist wiring. */}
          {companionMode && (
            <div className="chat-panel__tabs" role="tablist" aria-label="Companion view">
              <button
                role="tab"
                id="chat-companion-tab-chat"
                aria-selected={mobileTab === 'chat'}
                aria-controls="chat-companion-panel-chat"
                className={`chat-panel__tab ${mobileTab === 'chat' ? 'chat-panel__tab--active' : ''}`}
                onClick={() => setMobileTab('chat')}
              >
                Chat
              </button>
              <button
                role="tab"
                id="chat-companion-tab-obs"
                aria-selected={mobileTab === 'obs'}
                aria-controls="chat-companion-panel-obs"
                className={`chat-panel__tab ${mobileTab === 'obs' ? 'chat-panel__tab--active' : ''}`}
                onClick={() => setMobileTab('obs')}
              >
                Observability
              </button>
            </div>
          )}

          <div className={`chat-panel__body ${companionMode ? 'chat-panel__body--split' : ''}`}>
            {/* Left column — chat messages + input.
                Conditional role="tabpanel": only meaningful in companion mode. */}
            <div
              id="chat-companion-panel-chat"
              role={companionMode ? 'tabpanel' : undefined}
              aria-labelledby={companionMode ? 'chat-companion-tab-chat' : undefined}
              className={`chat-panel__chat-col ${mobileTab === 'chat' ? 'chat-panel__chat-col--active' : ''}`}
            >
              <ChatPanel
                chat={chat}
                starterQuestions={DEFAULT_STARTERS}
                inputRef={inputRef}
                headerActions={
                  <>
                    <button
                      type="button"
                      className={`chat-panel__icon-btn ${companionMode ? 'chat-panel__icon-btn--active' : ''}`}
                      onClick={() => setCompanionMode(!companionMode)}
                      aria-label={companionMode ? 'Exit companion mode' : 'Enter companion mode'}
                      aria-pressed={companionMode}
                      title="Toggle observability"
                    >
                      <Activity size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="chat-panel__icon-btn"
                      onClick={() => setOpen(false)}
                      aria-label="Close chat"
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </>
                }
              />
            </div>

            {/* Right column — observability (only in companion mode). */}
            {companionMode && (
              <div
                id="chat-companion-panel-obs"
                role="tabpanel"
                aria-labelledby="chat-companion-tab-obs"
                className={`chat-panel__obs-col ${mobileTab === 'obs' ? 'chat-panel__obs-col--active' : ''}`}
              >
                <ChatObservabilityPanel
                  metricsMap={metricsMap}
                  sessionSummary={sessionSummary}
                  isStreaming={loading}
                  streamProgress={streamProgress}
                  messages={messages}
                />
              </div>
            )}
          </div>
        </BoxContainer>
      </section>
    </>
  );
};

export default ChatWidget;
