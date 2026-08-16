import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, X, Send, Trash2, Zap, Activity } from 'lucide-react';
import { BoxContainer } from '../ui/BoxContainer';
import { useChat } from '../../hooks/useChat';
import { ChatObservabilityPanel } from './ChatObservabilityPanel';
import type { ChatSessionSummary } from '../../types/chat';
import './ChatWidget.css';

const STARTER_QUESTIONS = [
  'What does Chris do?',
  'Summarize the React architecture post',
  'What is the frontend guidebook about?',
  'How does this site handle monitoring?',
];

const COMPANION_STORAGE_KEY = 'chat_companion_mode';

export const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    error,
    isFallback,
    models,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearChat,
    metricsMap,
    streamProgress,
  } = useChat();

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

  // Auto-scroll to the latest message as tokens stream in.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleStarter = async (question: string) => {
    if (loading) return;
    await sendMessage(question);
  };

  // Don't render the launcher if the backend reports no models AND isn't in
  // fallback mode yet (initial load). Once isFallback becomes true we show
  // the widget so the user gets the degraded message.
  if (models.length === 0 && !isFallback && messages.length === 0) {
    return null;
  }

  return (
    <>
      {/* Launcher button */}
      <button
        type="button"
        className={`chat-launcher ${open ? 'chat-launcher--hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        aria-expanded={open}
      >
        <MessageCircle size={22} aria-hidden="true" />
        <span className="chat-launcher__pulse" aria-hidden="true" />
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
          <header className="chat-panel__header">
            <div className="chat-panel__title-group">
              <span className="chat-panel__title-text">Chat with Chris</span>
              {models.length > 1 && (
                <label className="chat-panel__model-select">
                  <span className="visually-hidden">Model</span>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={loading}
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="chat-panel__actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chat-panel__icon-btn"
                  onClick={clearChat}
                  aria-label="Clear conversation"
                  disabled={loading}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
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
            </div>
          </header>

          {isFallback && (
            <div className="chat-panel__banner" role="status">
              <Zap size={14} aria-hidden="true" />
              <span>
                {error
                  ? `Chat unavailable: ${error}`
                  : 'Chat is not configured on the server. Showing limited mode.'}
              </span>
            </div>
          )}

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
              <div className="chat-panel__messages" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="chat-panel__empty">
                    <p className="chat-panel__greeting">
                      Ask me anything about Chris&apos;s blog posts, guidebooks, or experience.
                    </p>
                    <div className="chat-panel__starters">
                      {STARTER_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="chat-panel__starter"
                          onClick={() => handleStarter(q)}
                          disabled={loading}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
                      <span className="chat-msg__role">{m.role === 'user' ? 'YOU' : 'CHRIS'}</span>
                      <span className="chat-msg__content">
                        {m.content}
                        {loading && m.role === 'assistant' && m.content === '' && (
                          <span className="chat-msg__cursor" aria-label="typing">
                            ▋
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-panel__input-row" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  className="chat-panel__input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={loading ? 'Waiting for reply…' : 'Ask a question…'}
                  disabled={loading}
                  maxLength={2000}
                  aria-label="Message"
                />
                <button
                  type="submit"
                  className="chat-panel__send"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </form>
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
