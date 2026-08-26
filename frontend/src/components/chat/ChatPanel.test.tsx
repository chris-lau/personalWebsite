import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatPanel } from './ChatPanel';

// Mock the hook so the component test doesn't depend on async API state.
const mockUseChat = vi.fn();
vi.mock('../../hooks/useChat', () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));

function baseHookState(overrides: Record<string, unknown> = {}) {
  return {
    messages: [],
    loading: false,
    error: null,
    isFallback: false,
    models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
    selectedModel: 'gemini-2.5-flash',
    setSelectedModel: vi.fn(),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    clearChat: vi.fn(),
    metricsMap: new Map(),
    streamProgress: null,
    ...overrides,
  };
}

function renderPanel(state = baseHookState(), props: Record<string, unknown> = {}) {
  mockUseChat.mockReturnValue(state);
  return render(
    <MemoryRouter>
      <ChatPanel chat={state as never} {...props} />
    </MemoryRouter>,
  );
}

describe('ChatPanel', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the skeleton while models/fallback resolve', () => {
    renderPanel(baseHookState({ models: [], isFallback: false }));
    expect(screen.getByLabelText('Loading chat')).toBeDefined();
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeDisabled();
  });

  it('renders starter chips from props and sends the question on click', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const state = baseHookState({ sendMessage });
    renderPanel(state, {
      starterQuestions: ['What does Chris do?', 'What is his tech stack?'],
    });

    fireEvent.click(screen.getByText('What does Chris do?'));
    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('What does Chris do?');
    });
  });

  it('renders streamed assistant messages as markdown with router links', () => {
    const state = baseHookState({
      messages: [
        { id: 'm1', role: 'user', content: 'what do you do?', timestamp: '' },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Chris leads AI initiatives. Read more: [About](/about) and [Blog](/blog).',
          timestamp: '',
        },
      ],
    });
    renderPanel(state, { starterQuestions: [] });

    expect(screen.getByText('what do you do?')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
    // Site-relative link renders as a router <a> without target=_blank
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(aboutLink).not.toHaveAttribute('target');
  });

  it('shows the degraded banner when isFallback is true', () => {
    renderPanel(baseHookState({ isFallback: true, error: 'HTTP 503' }));
    expect(screen.getByText(/Chat unavailable: HTTP 503/)).toBeDefined();
  });

  it('hides the header when showHeader is false', () => {
    renderPanel(baseHookState(), { showHeader: false });
    expect(screen.queryByText('Chat with Chris')).toBeNull();
  });

  it('opens grounding sources modal when clicking sources button', async () => {
    renderPanel(baseHookState());
    const sourcesBtn = screen.getByLabelText('View grounding source material');
    expect(sourcesBtn).toBeInTheDocument();
    fireEvent.click(sourcesBtn);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByText('Grounding Source Material')).toBeInTheDocument();
  });

  it('renders dynamic Chain of Thought block and expands on click', async () => {
    const state = baseHookState({
      messages: [
        { id: 'm1', role: 'user', content: 'solve this', timestamp: '' },
        {
          id: 'm2',
          role: 'assistant',
          content: 'Here is the final solution.',
          thought: 'Step 1: analyze input. Step 2: compute result.',
          thoughtDurationSec: 1.8,
          timestamp: '',
        },
      ],
    });
    renderPanel(state);

    expect(screen.getByText(/Thought for 1.8s/i)).toBeInTheDocument();

    const thoughtBtn = screen.getByRole('button', { name: /Thought for 1.8s/i });
    fireEvent.click(thoughtBtn);

    expect(screen.getByText(/Step 1: analyze input/i)).toBeInTheDocument();
  });
});
