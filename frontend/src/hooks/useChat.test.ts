import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from './useChat';

// Mock the API module so the hook never hits the network.
vi.mock('../api/backend', () => ({
  fetchChatModels: vi.fn(),
  sendChatMessage: vi.fn(),
}));

import { fetchChatModels, sendChatMessage } from '../api/backend';

describe('useChat hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads available models on mount', async () => {
    (fetchChatModels as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
        defaultModel: 'gemini-2.5-flash',
      },
      isFallback: false,
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.models.length).toBe(1);
    });
    expect(result.current.selectedModel).toBe('gemini-2.5-flash');
    expect(result.current.isFallback).toBe(false);
  });

  it('marks fallback when no models are configured', async () => {
    (fetchChatModels as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { models: [], defaultModel: 'gemini-2.5-flash' },
      isFallback: false,
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => {
      expect(result.current.isFallback).toBe(true);
    });
  });

  it('appends a user message and streams the assistant reply', async () => {
    (fetchChatModels as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
        defaultModel: 'gemini-2.5-flash',
      },
      isFallback: false,
    });

    // sendChatMessage calls onToken for each streamed chunk.
    (sendChatMessage as ReturnType<typeof vi.fn>).mockImplementation(
      async (_req: unknown, onToken: (t: string) => void) => {
        onToken('Hi ');
        onToken('there');
        return { isFallback: false };
      },
    );

    const { result } = renderHook(() => useChat());

    await waitFor(() => expect(result.current.models.length).toBe(1));

    await act(async () => {
      await result.current.sendMessage('What does Chris do?');
    });

    // 2 messages: user + assistant
    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('What does Chris do?');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('Hi there');
    expect(result.current.loading).toBe(false);
  });

  it('clearChat resets the conversation', async () => {
    (fetchChatModels as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
        defaultModel: 'gemini-2.5-flash',
      },
      isFallback: false,
    });
    (sendChatMessage as ReturnType<typeof vi.fn>).mockResolvedValue({ isFallback: false });

    const { result } = renderHook(() => useChat());

    await waitFor(() => expect(result.current.models.length).toBe(1));

    await act(async () => {
      await result.current.sendMessage('hello');
    });
    expect(result.current.messages.length).toBe(2);

    act(() => {
      result.current.clearChat();
    });
    expect(result.current.messages.length).toBe(0);
  });

  it('sets fallback when the stream fails', async () => {
    (fetchChatModels as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
        defaultModel: 'gemini-2.5-flash',
      },
      isFallback: false,
    });
    (sendChatMessage as ReturnType<typeof vi.fn>).mockResolvedValue({
      isFallback: true,
      error: 'HTTP 503',
    });

    const { result } = renderHook(() => useChat());

    await waitFor(() => expect(result.current.models.length).toBe(1));

    await act(async () => {
      await result.current.sendMessage('hello');
    });

    expect(result.current.isFallback).toBe(true);
    expect(result.current.error).toBe('HTTP 503');
    // The empty assistant bubble is replaced with a visible fallback message.
    expect(result.current.messages[1].content.length).toBeGreaterThan(0);
  });
});
