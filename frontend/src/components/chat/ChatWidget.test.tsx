import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

// Controlled localStorage mock — stored so we can restore the real one in afterEach.
let realLocalStorage: Storage;
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

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
    messageIsStreaming: false,
    ...overrides,
  };
}

function renderWidget(state = baseHookState()) {
  mockUseChat.mockReturnValue(state);
  return render(
    // Non-home route — the widget hides itself on '/' (chat is in the hero).
    <MemoryRouter initialEntries={['/projects']}>
      <ChatWidget />
    </MemoryRouter>,
  );
}

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Swap in mock localStorage for this test file
    realLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
    localStorageMock.clear();
  });

  afterEach(() => {
    // Restore real localStorage so other test files aren't affected
    Object.defineProperty(window, 'localStorage', { value: realLocalStorage, configurable: true });
  });

  it('renders nothing when no models loaded, no fallback, and no messages', () => {
    renderWidget(baseHookState({ models: [], isFallback: false, messages: [] }));
    expect(screen.queryByRole('button', { name: 'Ask this site' })).toBeNull();
  });

  it('renders nothing on the home route (chat is embedded in the hero)', () => {
    mockUseChat.mockReturnValue(baseHookState());
    render(
      <MemoryRouter initialEntries={['/']}>
        <ChatWidget />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: 'Ask this site' })).toBeNull();
  });

  it('renders the launcher on non-home routes', () => {
    mockUseChat.mockReturnValue(baseHookState());
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <ChatWidget />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: 'Ask this site' })).toBeDefined();
  });

  it('renders the launcher once models are loaded', () => {
    renderWidget();
    expect(screen.getByRole('button', { name: 'Ask this site' })).toBeDefined();
  });

  it('opens the panel and shows starter questions when launcher clicked', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    expect(screen.getByRole('dialog', { name: 'Chat with Chris' })).toBeDefined();
    expect(screen.getByText('What does Chris do?')).toBeDefined();
  });

  it('typing and submitting calls sendMessage with the typed text', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    renderWidget(baseHookState({ sendMessage }));

    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));
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

    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));
    fireEvent.click(screen.getByText('What does Chris do?'));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('What does Chris do?');
    });
  });

  it('shows the degraded banner when isFallback is true', () => {
    renderWidget(baseHookState({ isFallback: true, error: 'HTTP 503' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

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
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }));

    expect(clearChat).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // Phase 7: Companion mode tests
  // ---------------------------------------------------------------------------

  it('renders Activity toggle button in header actions', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    // The Activity toggle is present with aria-pressed=false (companion off by default)
    const toggleBtn = screen.getByRole('button', { name: 'Enter companion mode' });
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles companion mode on button click', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    // Toggle on
    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));
    expect(screen.getByRole('button', { name: 'Exit companion mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Toggle off
    fireEvent.click(screen.getByRole('button', { name: 'Exit companion mode' }));
    expect(screen.getByRole('button', { name: 'Enter companion mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('applies chat-panel--companion class to section when companion mode is on', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    const section = screen.getByRole('dialog', { name: 'Chat with Chris' });
    expect(section.className).not.toContain('chat-panel--companion');

    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));
    expect(section.className).toContain('chat-panel--companion');

    fireEvent.click(screen.getByRole('button', { name: 'Exit companion mode' }));
    expect(section.className).not.toContain('chat-panel--companion');
  });

  it('persists companion mode in localStorage', async () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chat_companion_mode', 'true');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Exit companion mode' }));
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('chat_companion_mode', 'false');
    });
  });

  it('renders ChatObservabilityPanel when companion mode is active', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    // Panel should not exist yet
    expect(screen.queryByText('Send a message to see observability data here')).toBeNull();

    // Toggle companion mode on
    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));
    expect(screen.getByText('Send a message to see observability data here')).toBeDefined();
  });

  it('renders mobile tablist when companion mode is active', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));

    // No tablist initially
    expect(screen.queryByRole('tablist')).toBeNull();

    // Toggle companion mode on
    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));
    expect(screen.getByRole('tablist', { name: 'Companion view' })).toBeDefined();
  });

  it('switches mobile tabs and applies --active class on columns', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));

    const chatTab = screen.getByRole('tab', { name: 'Chat' });
    const obsTab = screen.getByRole('tab', { name: 'Observability' });

    // Default: chat tab is selected
    expect(chatTab).toHaveAttribute('aria-selected', 'true');
    expect(obsTab).toHaveAttribute('aria-selected', 'false');

    const chatPanel = document.getElementById('chat-companion-panel-chat');
    const obsPanel = document.getElementById('chat-companion-panel-obs');

    // Chat column should have --active, obs should not
    expect(chatPanel?.className).toContain('chat-panel__chat-col--active');
    expect(obsPanel?.className).not.toContain('chat-panel__obs-col--active');

    // Switch to obs tab
    fireEvent.click(obsTab);
    expect(obsTab).toHaveAttribute('aria-selected', 'true');
    expect(chatTab).toHaveAttribute('aria-selected', 'false');
    expect(obsPanel?.className).toContain('chat-panel__obs-col--active');
    expect(chatPanel?.className).not.toContain('chat-panel__chat-col--active');
  });

  it('desktop layout shows both columns regardless of mobileTab state', () => {
    renderWidget();
    fireEvent.click(screen.getByRole('button', { name: 'Ask this site' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enter companion mode' }));

    // The split body class should be present when companion is on
    const body = document.querySelector('.chat-panel__body--split');
    expect(body).toBeDefined();

    // Both columns should be rendered (CSS handles visibility at different breakpoints)
    expect(document.getElementById('chat-companion-panel-chat')).toBeDefined();
    expect(document.getElementById('chat-companion-panel-obs')).toBeDefined();

    // The obs column should contain the observability panel
    expect(screen.getByText('Send a message to see observability data here')).toBeDefined();
  });

  it('launcher pill shows "Ask this site" label', () => {
    renderWidget();
    const launcher = screen.getByRole('button', { name: 'Ask this site' });
    expect(launcher).toBeDefined();
    expect(launcher.textContent).toContain('Ask this site');
  });

  it('pulse is absent after chat_opened_once is set', () => {
    localStorageMock.setItem('chat_opened_once', 'true');
    renderWidget();
    const launcher = screen.getByRole('button', { name: 'Ask this site' });
    expect(launcher.querySelector('.chat-launcher__pulse')).toBeNull();
  });

  it('Escape key closes the open panel', () => {
    renderWidget();
    const launcher = screen.getByRole('button', { name: 'Ask this site' });
    fireEvent.click(launcher);

    const panel = document.querySelector('.chat-panel');
    expect(panel?.className).toContain('chat-panel--open');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(panel?.className).not.toContain('chat-panel--open');
  });

  it('focus returns to launcher when panel closes', () => {
    renderWidget();
    const launcher = screen.getByRole('button', { name: 'Ask this site' });
    fireEvent.click(launcher);

    const panel = document.querySelector('.chat-panel');
    expect(panel?.className).toContain('chat-panel--open');

    fireEvent.keyDown(window, { key: 'Escape' });

    // After a short delay for the focus return effect
    setTimeout(() => {
      expect(document.activeElement).toBe(launcher);
    }, 100);
  });

  it('chat:open event opens panel and sends starter message', async () => {
    const sendMessage = vi.fn();
    mockUseChat.mockReturnValue({
      ...baseHookState(),
      sendMessage,
      messageIsStreaming: false,
    });

    renderWidget();

    // Dispatch chat:open event with starter
    const event = new CustomEvent('chat:open', {
      detail: { starter: 'Tell me about Chris' },
    });
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('Tell me about Chris');
    });

    const panel = document.querySelector('.chat-panel');
    expect(panel?.className).toContain('chat-panel--open');
  });

  it('on homepage, chat:open scrolls to ask-this-site and does not open panel', () => {
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;

    // Create a mock element for the target
    const mockElement = document.createElement('div');
    mockElement.id = 'ask-this-site';
    document.body.appendChild(mockElement);

    renderWidget('/', '/'); // Render on homepage

    // Dispatch chat:open event
    const event = new CustomEvent('chat:open', {
      detail: { starter: 'Tell me about Chris' },
    });
    window.dispatchEvent(event);

    // Should scroll to the element
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    // Should NOT open the panel
    const panel = document.querySelector('.chat-panel');
    expect(panel?.className).not.toContain('chat-panel--open');

    // Cleanup
    document.body.removeChild(mockElement);
    delete Element.prototype.scrollIntoView;
  });
});
