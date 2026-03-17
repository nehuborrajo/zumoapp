"use client";

import { useState, useEffect, useCallback } from "react";
import { documentsAPI, type DocumentSummary, type Document } from "@/lib/api";

export function useDocuments(subjectId: string | null) {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!subjectId) {
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await documentsAPI.getAllForSubject(subjectId);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const createDocument = async (data: { title: string; description?: string; extractedText?: string }) => {
    if (!subjectId) throw new Error("No subject selected");

    const newDoc = await documentsAPI.create(subjectId, data);
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const updateDocument = async (documentId: string, data: { title?: string; description?: string }) => {
    const updated = await documentsAPI.update(documentId, data);
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === documentId ? { ...doc, ...updated } : doc))
    );
    return updated;
  };

  const deleteDocument = async (documentId: string) => {
    await documentsAPI.delete(documentId);
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
}

// Hook for a single document with full details
export function useDocument(documentId: string | null) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await documentsAPI.getOne(documentId);
      setDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch document");
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const updateDocument = async (data: { title?: string; description?: string; extractedText?: string }) => {
    if (!documentId) throw new Error("No document selected");

    const updated = await documentsAPI.update(documentId, data);
    setDocument(updated);
    return updated;
  };

  return {
    document,
    loading,
    error,
    refetch: fetchDocument,
    updateDocument,
  };
}
