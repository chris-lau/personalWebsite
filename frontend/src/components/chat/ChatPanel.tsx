import React, { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Zap } from 'lucide-react';
import type { UseChatState } from '../../hooks/useChat';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import './ChatWidget.css';

const DEFAULT_GREETING =
  "Ask me anything about Chris's blog posts, guidebooks, or experience.";

export interface ChatPanelProps {
  /** Chat state from useChat(). Callers own the hook so they can also read metrics. */
  chat: UseChatState;
  /** Suggested questions shown in the empty state. */
  starterQuestions?: string[];
  /** Greeting text shown in the empty state. */
  greeting?: string;
  /** Extra classes on the root wrapper (e.g. "chat-panel--embedded" for the hero). */
  className?: string;
  /** Render the title / model switcher / clear header row. */
  showHeader?: boolean;
  /** Extra header action buttons injected by the floating widget (companion, close). */
  headerActions?: React.ReactNode;
  /** External control of the input (the widget focuses it when the panel opens). */
  inputRef?: React.RefObject<HTMLInputElement>;
}

/**
 * Embeddable chat panel: header + degraded banner + messages + input.
 *
 * The floating ChatWidget wraps this in its fixed-position shell and observability
 * split view; the home hero embeds it directly with `chat-panel--embedded`.
 * Assistant messages render as markdown so the model's "Read more:" links
 * (site-relative routes) navigate client-side.
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({
  chat,
  starterQuestions,
  greeting = DEFAULT_GREETING,
  className = '',
  showHeader = true,
  headerActions,
  inputRef,
}) => {
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
  } = chat;

  const starters = starterQuestions ?? [];
  const [input, setInput] = useState<string>('');
  const localInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message as tokens stream in.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  // Hero embedding can't render null while models resolve — show a skeleton.
  const resolving = models.length === 0 && !isFallback && messages.length === 0;

  return (
    <div className={`chat-panel__root ${className}`.trim()}>
      {showHeader && (
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
            {headerActions}
          </div>
        </header>
      )}

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

      <div className="chat-panel__messages" ref={scrollRef} aria-live="polite">
        {resolving ? (
          <div className="chat-panel__skeleton" aria-label="Loading chat">
            <div className="chat-panel__skeleton-line" />
            <div className="chat-panel__skeleton-line chat-panel__skeleton-line--short" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-panel__empty">
            <p className="chat-panel__greeting">{greeting}</p>
            {starters.length > 0 && (
              <div className="chat-panel__starters">
                {starters.map((q) => (
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
            )}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
              <span className="chat-msg__role">{m.role === 'user' ? 'YOU' : 'CHRIS'}</span>
              <span className="chat-msg__content">
                {m.role === 'assistant' && m.content ? (
                  <span className="chat-msg__markdown">
                    <MarkdownRenderer content={m.content} variant="chat" />
                  </span>
                ) : (
                  m.content
                )}
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
          ref={inputRef ?? localInputRef}
          type="text"
          className="chat-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? 'Waiting for reply…' : 'Ask a question…'}
          disabled={loading || resolving}
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
  );
};

export default ChatPanel;
