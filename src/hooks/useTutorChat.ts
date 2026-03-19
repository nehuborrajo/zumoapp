"use client";

import { useState, useRef, useCallback } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseTutorChatOptions {
  documentId?: string;
  subjectId?: string;
}

interface TutorSessionResult {
  session: {
    id: string;
    xpEarned: number;
    coinsEarned: number;
    messageCount: number;
    durationSeconds: number;
  };
  user: {
    totalXp: number;
    level: number;
    leveledUp: boolean;
    currentStreak: number;
    streakIncreased: boolean;
  };
  achievements: Array<{
    code: string;
    name: string;
    description: string;
    rewardXp: number;
    rewardCoins: number;
    rarity: string;
  }>;
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function useTutorChat(options: UseTutorChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      // Create placeholder for assistant message
      const assistantId = generateId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/tutor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: options.documentId,
            subjectId: options.subjectId,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage: content.trim(),
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, remove empty assistant message
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          const message = err instanceof Error ? err.message : "Error al enviar mensaje";
          setError(message);
          // Update assistant message with error
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Error: ${message}` }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [messages, isStreaming, options.documentId, options.subjectId]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const endSession = useCallback(async (): Promise<TutorSessionResult | null> => {
    const durationSeconds = Math.floor(
      (Date.now() - sessionStartRef.current) / 1000
    );
    const userMessageCount = messages.filter((m) => m.role === "user").length;

    // Don't save if no messages or too short
    if (userMessageCount < 1) {
      return null;
    }

    try {
      const response = await fetch("/api/tutor/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: options.documentId,
          subjectId: options.subjectId,
          messageCount: userMessageCount,
          durationSeconds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save session");
      }

      return await response.json();
    } catch (err) {
      console.error("Error saving tutor session:", err);
      return null;
    }
  }, [messages, options.documentId, options.subjectId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    sessionStartRef.current = Date.now();
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    endSession,
    clearMessages,
    cancelStream,
    messageCount: messages.filter((m) => m.role === "user").length,
    sessionDuration: Math.floor((Date.now() - sessionStartRef.current) / 1000),
  };
}
