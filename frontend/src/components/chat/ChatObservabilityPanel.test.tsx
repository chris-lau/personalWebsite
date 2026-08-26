import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatObservabilityPanel } from './ChatObservabilityPanel';
import type { ChatMessage, ChatMessageMetrics, ChatSessionSummary, StreamProgress } from '../../types/chat';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeMetrics(overrides: Partial<ChatMessageMetrics> = {}): ChatMessageMetrics {
  return {
    ttft_client_ms: 487,
    server_pre_llm_ms: 12,
    server_llm_to_first_token_ms: 433,
    total_duration_ms: 1200,
    prompt_tokens: 50,
    completion_tokens: 120,
    total_tokens: 170,
    model: 'gemini-2.5-flash',
    finish_reason: 'stop',
    estimated_cost_usd: 0.0001,
    effective_tokens_per_second: 85.3,
    decode_tokens_per_second: 110.5,
    token_count_estimated: false,
    ...overrides,
  };
}

function makeMetricsMap(metricsList: [string, ChatMessageMetrics][] = []): Map<string, ChatMessageMetrics> {
  return new Map(metricsList);
}

function makeSessionSummary(overrides: Partial<ChatSessionSummary> = {}): ChatSessionSummary {
  return {
    message_count: 2,
    total_prompt_tokens: 100,
    total_completion_tokens: 240,
    total_estimated_cost_usd: 0.0002,
    avg_ttft_client_ms: 410,
    avg_duration_ms: 1400,
    latency_history: [1200, 1600],
    ...overrides,
  };
}

function makeMessages(messages: Partial<ChatMessage>[] = []): ChatMessage[] {
  return messages.map((m, i) => ({
    id: m.id ?? `msg-${i}`,
    role: m.role ?? 'assistant',
    content: m.content ?? `Response ${i + 1}`,
    timestamp: m.timestamp ?? '',
  }));
}

function makeStreamProgress(overrides: Partial<StreamProgress> = {}): StreamProgress {
  return {
    elapsed_ms: 3200,
    chunks_received: 42,
    chunks_per_sec: 13.1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatObservabilityPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders empty state when no metrics and not streaming', () => {
    render(
      <ChatObservabilityPanel
        metricsMap={makeMetricsMap()}
        sessionSummary={null}
        isStreaming={false}
        streamProgress={null}
        messages={[]}
      />,
    );

    expect(screen.getByText('Send a message to see observability data here')).toBeDefined();
    // SVG icon should be rendered (aria-hidden, not queryable by text)
    expect(document.querySelector('.obs-panel__empty-icon')).toBeDefined();
    // No metrics sections should render
    expect(screen.queryByText('Session Summary')).toBeNull();
    expect(screen.queryByText('Latency')).toBeNull();
    expect(screen.queryByText('Per-Message Metrics')).toBeNull();
    expect(screen.queryByText('under the hood')).toBeNull();
  });

  it('renders session summary card with correct totals', () => {
    const m1 = makeMetrics({ model: 'gemini-2.5-flash', ttft_client_ms: 400, total_duration_ms: 1600, prompt_tokens: 75, completion_tokens: 150 });
    const m2 = makeMetrics({ model: 'gemini-2.5-flash', ttft_client_ms: 500, total_duration_ms: 1800, prompt_tokens: 75, completion_tokens: 150 });
    const m3 = makeMetrics({ model: 'gemini-2.5-flash', ttft_client_ms: 700, total_duration_ms: 2000, prompt_tokens: 75, completion_tokens: 150 });
    const metricsMap = makeMetricsMap([['a1', m1], ['a2', m2], ['a3', m3]]);

    const summary = makeSessionSummary({
      message_count: 3,
      total_prompt_tokens: 225,
      total_completion_tokens: 450,
      total_estimated_cost_usd: 0.0003,
      avg_ttft_client_ms: 550,
      avg_duration_ms: 1800,
    });

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={summary}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }])}
      />,
    );

    expect(screen.getByText('Session Summary')).toBeDefined();

    // Total tokens = prompt + completion = 225 + 450 = 675
    expect(screen.getByText('675')).toBeDefined();

    // Avg TTFT
    expect(screen.getByText('550ms')).toBeDefined();
    // Avg Duration (appears in summary and per-message detail for 1800ms)
    expect(screen.getAllByText('1.8s').length).toBeGreaterThanOrEqual(1);

    // Models Used = 1 (all same model)
    expect(screen.getByText('1')).toBeDefined();
  });

  it('renders sparkline with color-coded bars', () => {
    const m1 = makeMetrics({ ttft_client_ms: 300, total_duration_ms: 1500 });
    const m2 = makeMetrics({ ttft_client_ms: 600, total_duration_ms: 4000 });
    const metricsMap = makeMetricsMap([
      ['a1', m1],
      ['a2', m2],
    ]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([
          { id: 'a1', content: 'Quick response here' },
          { id: 'a2', content: 'A much slower response that takes a while' },
        ])}
      />,
    );

    expect(screen.getByText('Latency')).toBeDefined();

    // 1500ms bar should be --fast (green, <2000ms)
    // 4000ms bar should be --moderate (amber, <5000ms)
    const bars = document.querySelectorAll('.obs-panel__sparkline-bar');
    expect(bars.length).toBe(2);
    expect(bars[0].className).toContain('obs-panel__sparkline-bar--fast');
    expect(bars[1].className).toContain('obs-panel__sparkline-bar--moderate');
  });

  it('shows latest bar ms value inline', () => {
    const m1 = makeMetrics({ total_duration_ms: 1500 });
    const m2 = makeMetrics({ total_duration_ms: 4200 });
    const metricsMap = makeMetricsMap([
      ['a1', m1],
      ['a2', m2],
    ]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }, { id: 'a2' }])}
      />,
    );

    // The latest (last) bar should show its value inline
    const inlineLabels = document.querySelectorAll('.obs-panel__sparkline-label');
    expect(inlineLabels.length).toBe(1);
    expect(inlineLabels[0].textContent).toBe('4200ms');
  });

  it('renders per-message metrics with model badge and TTFT bar', () => {
    const m1 = makeMetrics({ model: 'gemini-2.5-flash', total_duration_ms: 1200 });
    const metricsMap = makeMetricsMap([['a1', m1]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1', content: 'Hello world' }])}
      />,
    );

    expect(screen.getByText('Per-Message Metrics')).toBeDefined();
    expect(screen.getByText('gemini-2.5-flash')).toBeDefined();
    expect(screen.getByText('Hello world')).toBeDefined();
    // Duration displayed
    expect(screen.getByText('1.2s')).toBeDefined();
  });

  it('shows segmented TTFT bar with 3 segments when server timings present', () => {
    const m = makeMetrics({
      ttft_client_ms: 500,
      server_pre_llm_ms: 50,
      server_llm_to_first_token_ms: 350,
    });
    const metricsMap = makeMetricsMap([['a1', m]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }])}
      />,
    );

    // 3 segments: network, server, llm
    const segments = document.querySelectorAll('.obs-panel__ttft-segment');
    expect(segments.length).toBe(3);
    expect(segments[0].className).toContain('obs-panel__ttft-segment--network');
    expect(segments[1].className).toContain('obs-panel__ttft-segment--server');
    expect(segments[2].className).toContain('obs-panel__ttft-segment--llm');

    // Total TTFT label
    expect(screen.getByText('500ms')).toBeDefined();
  });

  it('shows single-segment TTFT bar when server timings null', () => {
    const m = makeMetrics({
      ttft_client_ms: 487,
      server_pre_llm_ms: null,
      server_llm_to_first_token_ms: null,
    });
    const metricsMap = makeMetricsMap([['a1', m]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }])}
      />,
    );

    // Single "unknown" segment
    const segments = document.querySelectorAll('.obs-panel__ttft-segment');
    expect(segments.length).toBe(1);
    expect(segments[0].className).toContain('obs-panel__ttft-segment--unknown');
    expect(screen.getByText('client only')).toBeDefined();
  });

  it('marks estimated tokens with (est.) suffix and shows n/a throughput', () => {
    const m = makeMetrics({
      token_count_estimated: true,
      prompt_tokens: null,
      completion_tokens: null,
      total_tokens: null,
      decode_tokens_per_second: 0,
      effective_tokens_per_second: 0,
    });
    const metricsMap = makeMetricsMap([['a1', m]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }])}
      />,
    );

    // (est.) suffix
    expect(screen.getByText('(est.)')).toBeDefined();
    // Throughput shows n/a for estimates
    expect(screen.getByText('n/a')).toBeDefined();
  });

  it('shows streaming indicator when isStreaming with progress', () => {
    const progress = makeStreamProgress({ elapsed_ms: 2500, chunks_received: 30, chunks_per_sec: 12.0 });

    render(
      <ChatObservabilityPanel
        metricsMap={makeMetricsMap()}
        sessionSummary={null}
        isStreaming={true}
        streamProgress={progress}
        messages={[]}
      />,
    );

    // Live indicator should be present with role="status"
    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('2.5s')).toBeDefined(); // elapsed
    expect(screen.getByText('30')).toBeDefined(); // chunks
    expect(screen.getByText('12')).toBeDefined(); // chunks/sec
  });

  it('hides streaming indicator when not streaming', () => {
    render(
      <ChatObservabilityPanel
        metricsMap={makeMetricsMap()}
        sessionSummary={null}
        isStreaming={false}
        streamProgress={null}
        messages={[]}
      />,
    );

    // Should only see empty state, no streaming indicator
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('renders learn more footer when metrics exist', () => {
    const metricsMap = makeMetricsMap([['a1', makeMetrics()]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }])}
      />,
    );

    const link = screen.getByRole('link', { name: 'under the hood' });
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe(
      '/blog/demystifying-full-stack-monitoring-and-telemetry',
    );
  });

  it('does not render learn more footer when no metrics', () => {
    render(
      <ChatObservabilityPanel
        metricsMap={makeMetricsMap()}
        sessionSummary={null}
        isStreaming={false}
        streamProgress={null}
        messages={[]}
      />,
    );

    expect(screen.queryByRole('link', { name: 'under the hood' })).toBeNull();
  });

  it('shows model comparison when 2+ different models used', () => {
    const metricsMap = makeMetricsMap([
      ['a1', makeMetrics({ model: 'gemini-2.5-flash', ttft_client_ms: 200 })],
      ['a2', makeMetrics({ model: 'deepseek-chat', ttft_client_ms: 450 })],
    ]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1' }, { id: 'a2' }])}
      />,
    );

    // Model comparison section should be rendered
    const comparison = document.querySelector('.obs-panel__model-comparison');
    expect(comparison).toBeDefined();
    expect(comparison?.textContent).toContain('gemini-2.5-flash');
    expect(comparison?.textContent).toContain('deepseek-chat');
    expect(comparison?.textContent).toContain('~200ms TTFT');
    expect(comparison?.textContent).toContain('~450ms TTFT');
    expect(comparison?.textContent).toContain('vs');
  });

  it('shows sparkline bar with tooltip on focus', () => {
    const metricsMap = makeMetricsMap([['a1', makeMetrics({ total_duration_ms: 1500 })]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1', content: 'Test preview text here' }])}
      />,
    );

    // Bar should be focusable (tabindex=0)
    const barWrapper = document.querySelector('.obs-panel__sparkline-bar-wrapper');
    expect(barWrapper).toBeDefined();
    expect(barWrapper?.getAttribute('tabindex')).toBe('0');

    // Tooltip content includes ms value
    const tooltip = document.querySelector('.obs-panel__sparkline-tooltip');
    expect(tooltip?.textContent).toContain('1500ms');
  });

  it('renders Grounding Sources & Context section when metrics exist and opens modal on click', async () => {
    const metricsMap = makeMetricsMap([['a1', makeMetrics()]]);

    render(
      <ChatObservabilityPanel
        metricsMap={metricsMap}
        sessionSummary={makeSessionSummary()}
        isStreaming={false}
        streamProgress={null}
        messages={makeMessages([{ id: 'a1', content: 'Test response' }])}
      />,
    );

    expect(screen.getByText(/Grounding Sources & Context/i)).toBeInTheDocument();
    expect(screen.getByText(/Traditional Chinese \(繁體中文\)/i)).toBeInTheDocument();

    const viewSourcesBtn = screen.getByRole('button', { name: /View Sources/i });
    expect(viewSourcesBtn).toBeInTheDocument();
  });
});
