import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatWidget } from './ChatWidget';

// Mock the hook so the component test doesn't depend on async API state.
const mockUseChat = vi.fn();
vi.mock('../../hooks/useChat', () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));

// Mock BoxContainer to simplify DOM (it renders an h3 with the title).
vi.mock('../ui/BoxContainer', () => ({
  BoxContainer: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div data-testid="box-container">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  ),
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
    ...overrides,
  };
}

function renderWidget(state = baseHookState()) {
  mockUseChat.mockReturnValue(state);
  return render(
    <MemoryRouter>
      <ChatWidget />
    </MemoryRouter>,
  );
}

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when no models loaded, no fallback, and no messages', () => {
    renderWidget(baseHookState({ models: [], isFallback: false, messages: [] }));
    expect(screen.queryByRole('button', { name: 'Open chat' })).toBeNull();
  });

  it('renders the launcher once models are loaded', () => {
    renderWidget();
    expect(screen.getByRole('button', { name: 'Open chat' })).toBeDefined();
  });

  it('opens the panel and shows starter questions when launcher clicked', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getByRole('dialog', { name: 'Chat with Chris' })).toBeDefined();
    expect(screen.getByText('What does Chris do?')).toBeDefined();
  });

  it('typing and submitting calls sendMessage with the typed text', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    renderWidget(baseHookState({ sendMessage }));

    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    const input = screen.getByRole('textbox', { name: 'Message' });
    fireEvent.change(input, { target: { value: 'Tell me about the blog' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('Tell me about the blog');
    });
  });

  it('clicking a starter question calls sendMessage', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    renderWidget(baseHookState({ sendMessage }));

    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    fireEvent.click(screen.getByText('What does Chris do?'));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('What does Chris do?');
    });
  });

  it('shows the degraded banner when isFallback is true', () => {
    renderWidget(baseHookState({ isFallback: true, error: 'HTTP 503' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getByText(/Chat unavailable: HTTP 503/)).toBeDefined();
  });

  it('renders existing messages in the transcript', () => {
    renderWidget(
      baseHookState({
        messages: [
          { id: 'm1', role: 'user', content: 'hi', timestamp: '' },
          { id: 'm2', role: 'assistant', content: 'hello!', timestamp: '' },
        ],
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));

    expect(screen.getByText('hi')).toBeDefined();
    expect(screen.getByText('hello!')).toBeDefined();
  });

  it('clear button calls clearChat', () => {
    const clearChat = vi.fn();
    renderWidget(
      baseHookState({
        clearChat,
        messages: [{ id: 'm1', role: 'user', content: 'hi', timestamp: '' }],
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }));

    expect(clearChat).toHaveBeenCalled();
  });
});
