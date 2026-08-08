import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Zap } from 'lucide-react';
import { BoxContainer } from '../ui/BoxContainer';
import { useChat } from '../../hooks/useChat';
import './ChatWidget.css';

const STARTER_QUESTIONS = [
  'What does Chris do?',
  'Summarize the React architecture post',
  'What is the frontend guidebook about?',
  'How does this site handle monitoring?',
];

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
  } = useChat();

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

      {/* Chat panel */}
      <section
        className={`chat-panel ${open ? 'chat-panel--open' : ''}`}
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
        </BoxContainer>
      </section>
    </>
  );
};

export default ChatWidget;
