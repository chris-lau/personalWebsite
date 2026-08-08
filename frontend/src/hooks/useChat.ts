import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatModelInfo } from '../types/chat';
import { sendChatMessage, fetchChatModels } from '../api/backend';

const FALLBACK_REPLY =
  "I'm unable to connect to the chat service right now. Please try again later, or browse Chris's blog posts directly.";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return { id: newId(), role, content, timestamp: new Date().toISOString() };
}

export interface UseChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  models: ChatModelInfo[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

/**
 * Chat hook — mirrors the useGitHubData shape: manages messages, loading,
 * error, and fallback state, plus the model switcher selection.
 */
export function useChat(): UseChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [models, setModels] = useState<ChatModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Track the in-flight request so we can abort it on unmount / clear.
  const abortRef = useRef<AbortController | null>(null);

  // Load available models once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetchChatModels();
      if (cancelled) return;
      if (res.data && res.data.models.length > 0) {
        setModels(res.data.models);
        setSelectedModel(res.data.defaultModel);
      } else {
        // Backend reachable but no keys configured — mark degraded.
        setIsFallback(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      // Cancel any prior in-flight stream.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setIsFallback(false);

      const userMessage = makeMessage('user', trimmed);
      const assistantMessage = makeMessage('assistant', '');
      // Seed the assistant message up front so the UI shows a streaming bubble.
      const history = [...messages];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setLoading(true);

      const result = await sendChatMessage(
        { message: trimmed, history, model: selectedModel, signal: controller.signal },
        (token) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: m.content + token } : m)),
          );
        },
      );

      setLoading(false);

      if (result.isFallback) {
        setIsFallback(true);
        if (result.error && result.error !== 'cancelled') {
          setError(result.error);
        }
        // If the assistant bubble is still empty, surface a visible fallback.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id && m.content === '' ? { ...m, content: FALLBACK_REPLY } : m,
          ),
        );
      }
    },
    [loading, messages, selectedModel],
  );

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsFallback(false);
  }, []);

  // Abort any in-flight stream when the hook unmounts.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    messages,
    loading,
    error,
    isFallback,
    models,
    selectedModel,
    setSelectedModel,
    sendMessage,
    clearChat,
  };
}
