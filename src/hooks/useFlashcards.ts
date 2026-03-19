"use client";

import { useState, useEffect, useCallback } from "react";
import { flashcardsAPI, questionsAPI, type Flashcard, type Question } from "@/lib/api";

interface UseFlashcardsOptions {
  subjectId?: string | null;
  documentIds?: string[];
  dueOnly?: boolean; // If true, only fetch flashcards due for review (SM-2)
  limit?: number; // Limit for due flashcards (default 20)
}

interface UseFlashcardsResult {
  flashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalDue?: number; // Total due flashcards (only when dueOnly is true)
  hasMore?: boolean; // Whether there are more due flashcards
}

export function useFlashcards(options: UseFlashcardsOptions | string | null): UseFlashcardsResult {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDue, setTotalDue] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean | undefined>(undefined);

  // Normalize options
  const subjectId = typeof options === "string" ? options : options?.subjectId;
  const documentIds = typeof options === "object" && options !== null ? options.documentIds : undefined;
  const dueOnly = typeof options === "object" && options !== null ? options.dueOnly : undefined;
  const limit = typeof options === "object" && options !== null ? options.limit : undefined;

  const fetchFlashcards = useCallback(async () => {
    // If dueOnly, use the due endpoint
    if (dueOnly) {
      try {
        setLoading(true);
        setError(null);
        const response = await flashcardsAPI.getDue({
          subjectId: subjectId || undefined,
          documentIds: documentIds,
          limit: limit,
        });
        setFlashcards(response.flashcards);
        setTotalDue(response.totalDue);
        setHasMore(response.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch due flashcards");
        setFlashcards([]);
        setTotalDue(undefined);
        setHasMore(undefined);
      } finally {
        setLoading(false);
      }
      return;
    }

    // If documentIds provided, fetch from multiple documents
    if (documentIds && documentIds.length > 0) {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardsAPI.getForDocuments(documentIds);
        setFlashcards(data);
        setTotalDue(undefined);
        setHasMore(undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flashcards");
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise use subjectId
    if (!subjectId) {
      setFlashcards([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await flashcardsAPI.getForSubject(subjectId);
      setFlashcards(data);
      setTotalDue(undefined);
      setHasMore(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flashcards");
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, documentIds?.join(","), dueOnly, limit]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    refetch: fetchFlashcards,
    totalDue,
    hasMore,
  };
}

interface UseQuestionsOptions {
  subjectId?: string | null;
  documentIds?: string[];
}

export function useQuestions(options: UseQuestionsOptions | string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize options
  const subjectId = typeof options === "string" ? options : options?.subjectId;
  const documentIds = typeof options === "object" && options !== null ? options.documentIds : undefined;

  const fetchQuestions = useCallback(async () => {
    // If documentIds provided, fetch from multiple documents
    if (documentIds && documentIds.length > 0) {
      try {
        setLoading(true);
        setError(null);
        const data = await questionsAPI.getForDocuments(documentIds);
        setQuestions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch questions");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise use subjectId
    if (!subjectId) {
      setQuestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await questionsAPI.getForSubject(subjectId);
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, documentIds?.join(",")]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
}
