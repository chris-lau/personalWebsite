import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatModelInfo, ChatMessageMetrics, StreamProgress } from '../types/chat';
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
  /** Per-message observability metrics, keyed by assistant message id. */
  metricsMap: Map<string, ChatMessageMetrics>;
  /** Live stream progress while a reply is in flight; null otherwise. */
  streamProgress: StreamProgress | null;
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
  const [metricsMap, setMetricsMap] = useState<Map<string, ChatMessageMetrics>>(new Map());
  const [streamProgress, setStreamProgress] = useState<StreamProgress | null>(null);

  // Track the in-flight request so we can abort it on unmount / clear.
  const abortRef = useRef<AbortController | null>(null);

  // Refs for live progress tracking (mutable, avoid stale closures)
  const chunkCountRef = useRef<number>(0);
  const streamStartRef = useRef<number>(0);
  const thoughtStartTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      thoughtStartTimeRef.current = null;

      const userMessage = makeMessage('user', trimmed);
      const assistantMessage = makeMessage('assistant', '');
      // Seed the assistant message up front so the UI shows a streaming bubble.
      const history = [...messages];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setLoading(true);

      const result = await sendChatMessage(
        { message: trimmed, history, model: selectedModel, signal: controller.signal },
        {
          onThought: (thoughtChunk) => {
            if (!thoughtStartTimeRef.current) {
              thoughtStartTimeRef.current = performance.now();
            }
            const duration = Math.max(
              0.1,
              Math.round(((performance.now() - thoughtStartTimeRef.current) / 1000) * 10) / 10,
            );
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? {
                      ...m,
                      thought: (m.thought || '') + thoughtChunk,
                      thoughtDurationSec: duration,
                    }
                  : m,
              ),
            );
          },
          onToken: (token) => {
            chunkCountRef.current += 1;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMessage.id ? { ...m, content: m.content + token } : m)),
            );
          },
          onFirstToken: () => {
            chunkCountRef.current = 0;
            streamStartRef.current = performance.now();
            progressIntervalRef.current = setInterval(() => {
              const elapsed = performance.now() - streamStartRef.current;
              const chunks = chunkCountRef.current;
              const cps = elapsed > 0 ? chunks / (elapsed / 1000) : 0;
              setStreamProgress({
                elapsed_ms: Math.round(elapsed),
                chunks_received: chunks,
                chunks_per_sec: Math.round(cps * 10) / 10,
              });
            }, 500);
          },
          onComplete: (metrics) => {
            setMetricsMap((prev) => new Map(prev).set(assistantMessage.id, metrics));
          },
        },
      );

      // Clear progress interval and reset live readout
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setStreamProgress(null);
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
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setMessages([]);
    setMetricsMap(new Map());
    setStreamProgress(null);
    setError(null);
    setIsFallback(false);
  }, []);

  // Abort any in-flight stream and clear progress interval on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
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
    metricsMap,
    streamProgress,
  };
}
