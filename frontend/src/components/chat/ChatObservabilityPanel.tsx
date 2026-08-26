import React, { useMemo, useState } from 'react';
import { Activity, BookOpen, Database, ExternalLink } from 'lucide-react';
import type { ChatMessage, ChatMessageMetrics, ChatSessionSummary, StreamProgress } from '../../types/chat';
import { ChatSourcesModal } from './ChatSourcesModal';
import './ChatObservabilityPanel.css';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChatObservabilityPanelProps {
  metricsMap: Map<string, ChatMessageMetrics>;
  sessionSummary: ChatSessionSummary | null;
  isStreaming: boolean;
  streamProgress: StreamProgress | null;
  messages: ChatMessage[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(usd: number): string {
  if (usd < 0.01) return `<$0.01`;
  return `$${usd.toFixed(4)}`;
}

function formatTokens(n: number | null): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/** Reasoner models get relaxed TTFT thresholds (thinking time is inherent). */
function isReasonerModel(model: string): boolean {
  return /reasoner/i.test(model);
}

function ttftStatus(ttft: number, model: string): { color: string; label: string } {
  if (isReasonerModel(model)) {
    if (ttft < 2500) return { color: 'fast', label: 'Fast' };
    if (ttft < 5000) return { color: 'moderate', label: 'Moderate' };
    return { color: 'slow', label: 'Slow' };
  }
  if (ttft < 800) return { color: 'fast', label: 'Fast' };
  if (ttft < 2000) return { color: 'moderate', label: 'Moderate' };
  return { color: 'slow', label: 'Slow' };
}

function durationStatus(ms: number): { color: string; label: string } {
  if (ms < 2000) return { color: 'fast', label: 'Fast' };
  if (ms < 5000) return { color: 'moderate', label: 'Moderate' };
  return { color: 'slow', label: 'Slow' };
}

function sparklineColor(ms: number): string {
  if (ms < 2000) return 'fast';
  if (ms < 5000) return 'moderate';
  return 'slow';
}

interface ModelAverage {
  model: string;
  avgTtft: number;
  avgDuration: number;
  count: number;
}

function computeModelAverages(
  metricsMap: Map<string, ChatMessageMetrics>,
): Map<string, ModelAverage> {
  const acc = new Map<string, { ttft: number; dur: number; count: number }>();
  for (const m of metricsMap.values()) {
    const key = m.model;
    const entry = acc.get(key) ?? { ttft: 0, dur: 0, count: 0 };
    acc.set(key, {
      ttft: entry.ttft + m.ttft_client_ms,
      dur: entry.dur + m.total_duration_ms,
      count: entry.count + 1,
    });
  }
  const result = new Map<string, ModelAverage>();
  for (const [model, data] of acc) {
    result.set(model, {
      model,
      avgTtft: data.ttft / data.count,
      avgDuration: data.dur / data.count,
      count: data.count,
    });
  }
  return result;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TTFTBar({ metrics }: { metrics: ChatMessageMetrics }) {
  const hasServerTimings =
    metrics.server_pre_llm_ms != null && metrics.server_llm_to_first_token_ms != null;

  if (!hasServerTimings) {
    // Degraded: single-segment bar (client-only measurement)
    return (
      <div className="obs-panel__ttft-bar">
        <div
          className="obs-panel__ttft-segment obs-panel__ttft-segment--unknown"
          style={{ width: '100%' }}
        >
          <span className="obs-panel__ttft-label">client only</span>
        </div>
        <span className="obs-panel__ttft-total" title="Server breakdown unavailable">
          {formatMs(metrics.ttft_client_ms)}
        </span>
      </div>
    );
  }

  const ttft = metrics.ttft_client_ms;
  const serverPre = metrics.server_pre_llm_ms!;
  const serverLlm = metrics.server_llm_to_first_token_ms!;
  const network = Math.max(0, ttft - serverPre - serverLlm);

  // Guard against negative/narrow segments
  const total = Math.max(ttft, 1);
  const networkPct = Math.max(0, Math.min(100, (network / total) * 100));
  const serverPrePct = Math.max(0, Math.min(100, (serverPre / total) * 100));
  const serverLlmPct = 100 - networkPct - serverPrePct;

  const NARROW_THRESHOLD = 18; // px — below this, hide inline label

  return (
    <div
      className="obs-panel__ttft-bar"
      title={`TTFT breakdown — Network: ${Math.round(network)}ms | Server overhead: ${Math.round(serverPre)}ms | Model prefill: ${Math.round(serverLlm)}ms`}
    >
      <div
        className="obs-panel__ttft-segment obs-panel__ttft-segment--network"
        style={{ width: `${networkPct}%` }}
        data-narrow={networkPct < NARROW_THRESHOLD ? 'true' : 'false'}
      >
        <span className="obs-panel__ttft-label">{Math.round(network)}ms</span>
      </div>
      <div
        className="obs-panel__ttft-segment obs-panel__ttft-segment--server"
        style={{ width: `${serverPrePct}%` }}
        data-narrow={serverPrePct < NARROW_THRESHOLD ? 'true' : 'false'}
      >
        <span className="obs-panel__ttft-label">{Math.round(serverPre)}ms</span>
      </div>
      <div
        className="obs-panel__ttft-segment obs-panel__ttft-segment--llm"
        style={{ width: `${Math.max(0, serverLlmPct)}%` }}
        data-narrow={Math.max(0, serverLlmPct) < NARROW_THRESHOLD ? 'true' : 'false'}
      >
        <span className="obs-panel__ttft-label">{Math.round(serverLlm)}ms</span>
      </div>
      <span className="obs-panel__ttft-total">{formatMs(ttft)}</span>
    </div>
  );
}

function LiveIndicator({ progress }: { progress: StreamProgress }) {
  return (
    <div className="obs-panel__live" role="status" aria-live="polite">
      <span className="obs-panel__live-pulse" aria-hidden="true" />
      <div className="obs-panel__live-stats">
        <div className="obs-panel__live-stat">
          <span className="obs-panel__live-stat-label">Elapsed</span>
          <span className="obs-panel__live-stat-value">{formatMs(progress.elapsed_ms)}</span>
        </div>
        <div className="obs-panel__live-stat">
          <span className="obs-panel__live-stat-label">Chunks</span>
          <span className="obs-panel__live-stat-value">{progress.chunks_received}</span>
        </div>
        <div className="obs-panel__live-stat">
          <span className="obs-panel__live-stat-label">Chunks/sec</span>
          <span className="obs-panel__live-stat-value">{progress.chunks_per_sec}</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const ChatObservabilityPanel: React.FC<ChatObservabilityPanelProps> = ({
  metricsMap,
  sessionSummary,
  isStreaming,
  streamProgress,
  messages,
}) => {
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);

  const metricsEntries = useMemo(
    () => Array.from(metricsMap.entries()) as [string, ChatMessageMetrics][],
    [metricsMap],
  );

  const modelAverages = useMemo(() => computeModelAverages(metricsMap), [metricsMap]);

  // Build a message lookup for previews
  const messageMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of messages) {
      if (m.role === 'assistant') map.set(m.id, m.content);
    }
    return map;
  }, [messages]);

  const hasMetrics = metricsEntries.length > 0;

  // ---- Empty state ----
  if (!hasMetrics && !isStreaming) {
    return (
      <div className="obs-panel__empty">
        <Activity size={24} className="obs-panel__empty-icon" aria-hidden="true" />
        <p className="obs-panel__empty-text">Send a message to see observability data here</p>
        <button
          type="button"
          className="obs-panel__sources-btn"
          onClick={() => setShowSourcesModal(true)}
          style={{ marginTop: '0.75rem' }}
        >
          <Database size={13} aria-hidden="true" /> Inspect Grounding Sources
        </button>
        <ChatSourcesModal
          isOpen={showSourcesModal}
          onClose={() => setShowSourcesModal(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ---- Section A: Session Summary Card ---- */}
      {sessionSummary && (
        <div className="obs-panel__summary">
          <h4 className="obs-panel__summary-title">Session Summary</h4>
          <div className="obs-panel__summary-grid">
            <div className="obs-panel__metric">
              <span className="obs-panel__metric-label" title="Number of assistant replies in this session">
                Messages
              </span>
              <span className="obs-panel__metric-value">{sessionSummary.message_count}</span>
            </div>
            <div className="obs-panel__metric">
              <span
                className="obs-panel__metric-label"
                title="LLMs process text in word pieces called 'tokens' (~0.75 words each). Prompt tokens are your input; completion tokens are the model's reply."
              >
                Total Tokens
              </span>
              <span className="obs-panel__metric-value">
                {formatTokens(sessionSummary.total_prompt_tokens + sessionSummary.total_completion_tokens)}
              </span>
            </div>
            <div className="obs-panel__metric">
              <span
                className="obs-panel__metric-label"
                title="Calculated live from model pricing per 1M input/output tokens. Shows real-world API cost per message."
              >
                Est. Cost
              </span>
              <span className="obs-panel__metric-value">{formatCost(sessionSummary.total_estimated_cost_usd)}</span>
            </div>
            <div className="obs-panel__metric">
              <span
                className="obs-panel__metric-label"
                title="Time to First Token — how long between pressing Send and receiving the first word from the model."
              >
                Avg TTFT
              </span>
              <span className="obs-panel__metric-value">
                {formatMs(sessionSummary.avg_ttft_client_ms)}
                {(() => {
                  // Use the primary model from the first entry for status color
                  const firstModel = metricsEntries[0]?.[1]?.model ?? '';
                  const status = ttftStatus(sessionSummary.avg_ttft_client_ms, firstModel);
                  return (
                    <span className={`obs-panel__status obs-panel__status--${status.color}`}>
                      {status.label}
                    </span>
                  );
                })()}
              </span>
            </div>
            <div className="obs-panel__metric">
              <span
                className="obs-panel__metric-label"
                title="Total time from sending your message to the last token arriving."
              >
                Avg Duration
              </span>
              <span className="obs-panel__metric-value">
                {formatMs(sessionSummary.avg_duration_ms)}
                {(() => {
                  const status = durationStatus(sessionSummary.avg_duration_ms);
                  return (
                    <span className={`obs-panel__status obs-panel__status--${status.color}`}>
                      {status.label}
                    </span>
                  );
                })()}
              </span>
            </div>
            <div className="obs-panel__metric">
              <span className="obs-panel__metric-label">
                Models Used
              </span>
              <span className="obs-panel__metric-value">{modelAverages.size}</span>
            </div>
          </div>

          {/* Model comparison (conditional — only when ≥2 models) */}
          {modelAverages.size >= 2 && (
            <div className="obs-panel__model-comparison">
              {Array.from(modelAverages.values())
                .sort((a, b) => a.avgTtft - b.avgTtft)
                .map((m, i, arr) => (
                  <span key={m.model}>
                    <strong>{m.model}</strong>: ~{Math.round(m.avgTtft)}ms TTFT
                    {i < arr.length - 1 ? ' vs ' : ''}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Section B: Latency Sparkline ---- */}
      {hasMetrics && (
        <div className="obs-panel__sparkline">
          <h4 className="obs-panel__sparkline-title">Latency</h4>
          <div className="obs-panel__sparkline-bars">
            {metricsEntries.map(([id, metrics], idx) => {
              const maxDur = Math.max(...metricsEntries.map(([, m]) => m.total_duration_ms), 1);
              const heightPct = Math.max(4, (metrics.total_duration_ms / maxDur) * 100);
              const color = sparklineColor(metrics.total_duration_ms);
              const isLast = idx === metricsEntries.length - 1;
              const preview = messageMap.get(id)?.slice(0, 40) ?? '';

              return (
                <div
                  key={id}
                  className="obs-panel__sparkline-bar-wrapper"
                  tabIndex={0}
                  title={`${Math.round(metrics.total_duration_ms)}ms — ${preview}`}
                >
                  <div
                    className={`obs-panel__sparkline-bar obs-panel__sparkline-bar--${color}`}
                    style={{ height: `${heightPct}%` }}
                  />
                  {/* CSS tooltip (hover/focus) */}
                  <span className="obs-panel__sparkline-tooltip">
                    {Math.round(metrics.total_duration_ms)}ms — {preview}
                  </span>
                  {/* Inline label only on the most-recent bar */}
                  {isLast && (
                    <span className="obs-panel__sparkline-label">
                      {Math.round(metrics.total_duration_ms)}ms
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Section C: Live Streaming Indicator ---- */}
      {isStreaming && streamProgress && <LiveIndicator progress={streamProgress} />}

      {/* ---- Section D: Per-Message Metrics List ---- */}
      {hasMetrics && (
        <>
          <h4 className="obs-panel__metrics-title">Per-Message Metrics</h4>
          <div className="obs-panel__metrics-list">
            {metricsEntries.map(([id, metrics]) => {
              const preview = messageMap.get(id)?.slice(0, 60) ?? '';

              return (
                <div key={id} className="obs-panel__metric-row">
                  <div className="obs-panel__metric-row-header">
                    <span className="obs-panel__metric-preview" title={messageMap.get(id)}>
                      {preview || '(empty)'}
                    </span>
                    <span className="obs-panel__metric-model-badge">{metrics.model}</span>
                  </div>

                  {/* Segmented TTFT bar */}
                  <TTFTBar metrics={metrics} />

                  {/* Detail grid */}
                  <div className="obs-panel__detail-grid">
                    <span className="obs-panel__detail-label">Duration</span>
                    <span className="obs-panel__detail-value">{formatMs(metrics.total_duration_ms)}</span>

                    <span className="obs-panel__detail-label">
                      Tokens
                      {metrics.token_count_estimated && (
                        <span className="obs-panel__detail-estimated"> (est.)</span>
                      )}
                    </span>
                    <span className="obs-panel__detail-value">
                      {formatTokens(metrics.prompt_tokens)}/{formatTokens(metrics.completion_tokens)}
                    </span>

                    <span className="obs-panel__detail-label">Decode tok/s</span>
                    <span className="obs-panel__detail-value">
                      {metrics.token_count_estimated
                        ? 'n/a'
                        : metrics.decode_tokens_per_second.toFixed(1)}
                    </span>

                    <span className="obs-panel__detail-label">Cost</span>
                    <span className="obs-panel__detail-value">{formatCost(metrics.estimated_cost_usd)}</span>

                    {metrics.finish_reason && (
                      <>
                        <span
                          className="obs-panel__detail-label"
                          title="Why streaming stopped: 'stop' = standard completion, 'length' = hit token limit."
                        >
                          Finish
                        </span>
                        <span className="obs-panel__detail-value">{metrics.finish_reason}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---- Section E: Grounding Sources & Prompt Context ---- */}
      {hasMetrics && (
        <div className="obs-panel__grounding">
          <div className="obs-panel__grounding-header">
            <span className="obs-panel__grounding-title">
              <Database size={13} aria-hidden="true" /> Grounding Sources & Context
            </span>
            <button
              type="button"
              className="obs-panel__sources-btn"
              onClick={() => setShowSourcesModal(true)}
              title="Inspect full source materials fed to the model"
            >
              View Sources
            </button>
          </div>
          <p className="obs-panel__grounding-desc">
            Model replies are grounded in Chris&apos;s blog posts, guidebooks, and system architecture (~71K prefix tokens). Responses strictly adhere to Traditional Chinese (繁體中文).
          </p>
        </div>
      )}

      {/* ---- Section F: Learn More Footer ---- */}
      {hasMetrics && (
        <div className="obs-panel__footer">
          <BookOpen size={12} className="obs-panel__footer-icon" aria-hidden="true" />
          Interested in how this telemetry works{' '}
          <a href="/blog/demystifying-full-stack-monitoring-and-telemetry">under the hood</a>?
        </div>
      )}

      <ChatSourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
      />
    </div>
  );
};

export default ChatObservabilityPanel;
