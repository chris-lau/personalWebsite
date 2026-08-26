import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  BookOpen,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Database,
} from 'lucide-react';
import { fetchChatSources } from '../../api/backend';
import type { ChatSourceItem, ChatSourcesResponse } from '../../types/chat';
import './ChatSourcesModal.css';

export interface ChatSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Sources',
  blog: 'Blog Posts',
  guidebook: 'Guidebooks',
  profile: 'Profile & Bio',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  now: 'Now (Focus)',
  architecture: 'Site Architecture',
  amazon: 'Amazon Suite',
};

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export const ChatSourcesModal: React.FC<ChatSourcesModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<ChatSourcesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Fetch sources when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const res = await fetchChatSources();
      if (cancelled) return;
      if (res.data) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to load chat grounding sources.');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Keyboard escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap / auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const categories = useMemo(() => {
    if (!data) return ['all'];
    const unique = Array.from(new Set(data.sources.map((s) => s.category)));
    return ['all', ...unique];
  }, [data]);

  const filteredSources = useMemo(() => {
    if (!data) return [];
    return data.sources.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.content.toLowerCase().includes(query) ||
        (s.route && s.route.toLowerCase().includes(query)) ||
        s.source_file.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [data, selectedCategory, searchQuery]);

  const handleCopySingle = async (source: ChatSourceItem) => {
    try {
      await navigator.clipboard.writeText(source.content);
      setCopiedId(source.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleCopyAll = async () => {
    if (!data) return;
    try {
      const fullContext = data.sources.map((s) => s.content).join('\n\n---\n\n');
      await navigator.clipboard.writeText(fullContext);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="sources-modal__backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="sources-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sources-modal-title"
      >
        {/* Header */}
        <header className="sources-modal__header">
          <div className="sources-modal__title-group">
            <BookOpen size={18} className="sources-modal__title-icon" aria-hidden="true" />
            <h3 id="sources-modal-title" className="sources-modal__title">
              Grounding Source Material
            </h3>
            <span className="sources-modal__badge">
              <Database size={12} aria-hidden="true" /> RAG Context
            </span>
          </div>
          <div className="sources-modal__header-actions">
            {data && (
              <button
                type="button"
                className="sources-modal__btn"
                onClick={handleCopyAll}
                title="Copy entire prompt context string to clipboard"
              >
                {allCopied ? (
                  <>
                    <Check size={14} aria-hidden="true" /> Copied All
                  </>
                ) : (
                  <>
                    <Copy size={14} aria-hidden="true" /> Copy All Context
                  </>
                )}
              </button>
            )}
            <button
              ref={closeBtnRef}
              type="button"
              className="sources-modal__close-btn"
              onClick={onClose}
              aria-label="Close sources dialog"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Stats summary bar */}
        {data && (
          <div className="sources-modal__stats">
            <div className="sources-modal__stat">
              <span className="sources-modal__stat-label">Total Documents</span>
              <span className="sources-modal__stat-value">{data.total_sources}</span>
            </div>
            <div className="sources-modal__stat">
              <span className="sources-modal__stat-label">Total Characters</span>
              <span className="sources-modal__stat-value">{formatNumber(data.total_characters)}</span>
            </div>
            <div className="sources-modal__stat">
              <span className="sources-modal__stat-label">Estimated Tokens</span>
              <span className="sources-modal__stat-value">~{formatNumber(data.total_estimated_tokens)}</span>
            </div>
            <div className="sources-modal__stat">
              <span className="sources-modal__stat-label">Language Rule</span>
              <span className="sources-modal__stat-value">繁體中文 (Traditional)</span>
            </div>
          </div>
        )}

        {/* Search and Category Filters */}
        <div className="sources-modal__controls">
          <div className="sources-modal__search-wrapper">
            <Search size={16} className="sources-modal__search-icon" aria-hidden="true" />
            <input
              type="text"
              className="sources-modal__search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search source materials by title, content, or route…"
              aria-label="Search source materials"
            />
          </div>

          <div className="sources-modal__categories" role="radiogroup" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="radio"
                aria-checked={selectedCategory === cat}
                className={`sources-modal__category-pill ${
                  selectedCategory === cat ? 'sources-modal__category-pill--active' : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="sources-modal__content">
          {loading && (
            <div className="sources-modal__empty">
              <Layers className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem' }} />
              <p>Loading grounding source materials…</p>
            </div>
          )}

          {error && (
            <div className="sources-modal__empty">
              <p style={{ color: 'var(--text-muted)' }}>{error}</p>
            </div>
          )}

          {!loading && !error && filteredSources.length === 0 && (
            <div className="sources-modal__empty">
              <p>No grounding sources matched your search query.</p>
            </div>
          )}

          {!loading &&
            !error &&
            filteredSources.map((source) => {
              const isExpanded = expandedSourceId === source.id;
              const isCopied = copiedId === source.id;

              return (
                <article key={source.id} className="source-card">
                  <header
                    className="source-card__header"
                    onClick={() => setExpandedSourceId(isExpanded ? null : source.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedSourceId(isExpanded ? null : source.id);
                      }
                    }}
                  >
                    <div className="source-card__title-row">
                      <span className="source-card__category-tag">{source.category}</span>
                      <h4 className="source-card__title" title={source.title}>
                        {source.title}
                      </h4>
                      {source.route && (
                        <a
                          href={source.route}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="source-card__route-link"
                          onClick={(e) => e.stopPropagation()}
                          title={`Open ${source.route} on this site`}
                        >
                          {source.route}
                          <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </div>

                    <div className="source-card__meta">
                      <span className="source-card__token-badge">
                        ~{formatNumber(source.estimated_tokens)} tok
                      </span>
                      <ChevronDown
                        size={16}
                        className={`source-card__chevron ${
                          isExpanded ? 'source-card__chevron--expanded' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </header>

                  {isExpanded && (
                    <div className="source-card__drawer">
                      <div className="source-card__drawer-actions">
                        <button
                          type="button"
                          className="source-card__copy-btn"
                          onClick={() => handleCopySingle(source)}
                          title="Copy this document's text"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} aria-hidden="true" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={12} aria-hidden="true" /> Copy Source
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="source-card__code-view">{source.content}</pre>
                    </div>
                  )}
                </article>
              );
            })}
        </div>

        {/* Footer */}
        <footer className="sources-modal__footer">
          <span>All documents are bundled into the prompt context for transparent retrieval.</span>
          <span>Cached for zero runtime DB latency</span>
        </footer>
      </div>
    </div>
  );
};

export default ChatSourcesModal;
