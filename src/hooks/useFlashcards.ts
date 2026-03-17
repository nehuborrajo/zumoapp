"use client";

import { useState, useEffect, useCallback } from "react";
import { flashcardsAPI, questionsAPI, type Flashcard, type Question } from "@/lib/api";

interface UseFlashcardsOptions {
  subjectId?: string | null;
  documentIds?: string[];
}

export function useFlashcards(options: UseFlashcardsOptions | string | null) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize options
  const subjectId = typeof options === "string" ? options : options?.subjectId;
  const documentIds = typeof options === "object" && options !== null ? options.documentIds : undefined;

  const fetchFlashcards = useCallback(async () => {
    // If documentIds provided, fetch from multiple documents
    if (documentIds && documentIds.length > 0) {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardsAPI.getForDocuments(documentIds);
        setFlashcards(data);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flashcards");
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, documentIds?.join(",")]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    refetch: fetchFlashcards,
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
