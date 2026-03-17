"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useCourse } from "@/hooks/useCourses";
import { documentsAPI, subjectsAPI, uploadAPI } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  FileText,
  Upload,
  Sparkles,
  X,
  Folder,
  ChevronRight,
  Loader2,
  FileUp,
  Type,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  ExternalLink,
  CheckSquare,
  Square,
  Play,
} from "lucide-react";

// Dropdown Menu Component that renders via portal
function DropdownMenu({
  isOpen,
  onClose,
  triggerRef,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.right - 160, // 160px = menu width (w-40)
      });
    }
  }, [isOpen, triggerRef]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        style={{ top: position.top, left: position.left }}
      >
        {children}
      </motion.div>
    </>,
    document.body
  );
}

export default function ContainerDetailPage() {
  const params = useParams();
  const courseId = params.containerId as string;
  const { course, loading, error, createSubject, refetch } = useCourse(courseId);

  // Refs for menu triggers
  const subjectMenuRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const docMenuRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  // Subject modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [showDeleteSubjectConfirm, setShowDeleteSubjectConfirm] = useState(false);
  const [selectedSubjectData, setSelectedSubjectData] = useState<{ id: string; name: string } | null>(null);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState<string | null>(null);

  // Document modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditDocModal, setShowEditDocModal] = useState(false);
  const [showDeleteDocConfirm, setShowDeleteDocConfirm] = useState(false);
  const [selectedDocData, setSelectedDocData] = useState<{ id: string; title: string; description: string } | null>(null);
  const [docMenuOpen, setDocMenuOpen] = useState<string | null>(null);

  // UI state
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Form state
  const [newSubjectName, setNewSubjectName] = useState("");
  const [editSubjectName, setEditSubjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Document form state
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");
  const [docTitle, setDocTitle] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [docText, setDocText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(false);
  const [generatingDocId, setGeneratingDocId] = useState<string | null>(null);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selection mode for studying
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  // Toggle document selection
  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  // Select all documents in a subject
  const toggleSubjectSelection = (subjectDocs: any[]) => {
    const readyDocs = subjectDocs.filter((d: any) => d.processingStatus === "READY" && d.flashcardsCount > 0);
    const allSelected = readyDocs.every((d: any) => selectedDocuments.has(d.id));

    setSelectedDocuments(prev => {
      const next = new Set(prev);
      readyDocs.forEach((d: any) => {
        if (allSelected) {
          next.delete(d.id);
        } else {
          next.add(d.id);
        }
      });
      return next;
    });
  };

  // Start study session with selected documents
  const startStudyWithSelection = () => {
    if (selectedDocuments.size === 0) return;
    const docIds = Array.from(selectedDocuments).join(",");
    window.location.href = `/study?documents=${docIds}`;
  };

  // Cancel selection mode
  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedDocuments(new Set());
  };

  // Subject handlers
  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      setCreating(true);
      await createSubject({ name: newSubjectName.trim() });
      setNewSubjectName("");
      setShowAddSubjectModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating subject");
    } finally {
      setCreating(false);
    }
  };

  const openEditSubjectModal = (subject: { id: string; name: string }) => {
    setSelectedSubjectData(subject);
    setEditSubjectName(subject.name);
    setSubjectMenuOpen(null);
    setShowEditSubjectModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!selectedSubjectData || !editSubjectName.trim()) return;
    try {
      setUpdating(true);
      await subjectsAPI.update(selectedSubjectData.id, { name: editSubjectName.trim() });
      setShowEditSubjectModal(false);
      setSelectedSubjectData(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating subject");
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteSubjectConfirm = (subject: { id: string; name: string }) => {
    setSelectedSubjectData(subject);
    setSubjectMenuOpen(null);
    setShowDeleteSubjectConfirm(true);
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubjectData) return;
    try {
      setDeleting(true);
      await subjectsAPI.delete(selectedSubjectData.id);
      setShowDeleteSubjectConfirm(false);
      setSelectedSubjectData(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting subject");
    } finally {
      setDeleting(false);
    }
  };

  // Document handlers
  const openUploadModal = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setUploadMode("text");
    setDocTitle("");
    setDocDescription("");
    setDocText("");
    setSelectedFile(null);
    setUploadProgress("");
    setShowUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos PDF o TXT");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 10MB");
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from filename if empty
    if (!docTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(nameWithoutExt);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten archivos PDF o TXT");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo es muy grande. Máximo 10MB");
      return;
    }

    setSelectedFile(file);
    if (!docTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setDocTitle(nameWithoutExt);
    }
  };

  const handleCreateDocument = async () => {
    if (!selectedSubject || !docTitle.trim()) return;

    try {
      setCreatingDoc(true);

      let fileUrl: string | undefined;
      let extractedText = docText.trim() || undefined;
      const isPDF = selectedFile?.type === "application/pdf";

      // If file mode and file selected, upload it first
      if (uploadMode === "file" && selectedFile) {
        setUploadProgress("Subiendo archivo...");
        const uploadResult = await uploadAPI.uploadFile(selectedFile);

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || "Error al subir archivo");
        }

        fileUrl = uploadResult.url;
        setUploadProgress("Archivo subido. Creando documento...");

        // For TXT files, read content directly
        if (selectedFile.type === "text/plain") {
          extractedText = await selectedFile.text();
        }
      }

      // Create document
      const newDoc = await documentsAPI.create(selectedSubject, {
        title: docTitle.trim(),
        description: docDescription.trim() || undefined,
        extractedText: extractedText,
        originalFileUrl: fileUrl,
      });

      // If it's a PDF, process it to extract text
      if (isPDF && newDoc.id) {
        setUploadProgress("Extrayendo texto del PDF...");
        try {
          await documentsAPI.process(newDoc.id);
        } catch (processError) {
          console.error("PDF processing error:", processError);
          // Don't throw - document was created, just processing failed
        }
      }

      setShowUploadModal(false);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating document");
    } finally {
      setCreatingDoc(false);
      setUploadProgress("");
    }
  };

  const openEditDocModal = (doc: { id: string; title: string; description?: string | null }) => {
    setSelectedDocData({ id: doc.id, title: doc.title, description: doc.description || "" });
    setDocMenuOpen(null);
    setShowEditDocModal(true);
  };

  const handleUpdateDocument = async () => {
    if (!selectedDocData) return;
    try {
      setUpdatingDoc(true);
      await documentsAPI.update(selectedDocData.id, {
        title: selectedDocData.title.trim(),
        description: selectedDocData.description.trim() || undefined,
      });
      setShowEditDocModal(false);
      setSelectedDocData(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating document");
    } finally {
      setUpdatingDoc(false);
    }
  };

  const openDeleteDocConfirm = (doc: { id: string; title: string }) => {
    setSelectedDocData({ id: doc.id, title: doc.title, description: "" });
    setDocMenuOpen(null);
    setShowDeleteDocConfirm(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocData) return;
    try {
      setDeletingDoc(true);
      await documentsAPI.delete(selectedDocData.id);
      setShowDeleteDocConfirm(false);
      setSelectedDocData(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting document");
    } finally {
      setDeletingDoc(false);
    }
  };

  const handleGenerateFlashcards = async (documentId: string) => {
    try {
      setGeneratingDocId(documentId);
      await documentsAPI.generate(documentId, {
        generateFlashcardsFlag: true,
        generateQuestionsFlag: true,
        flashcardsCount: 10,
        questionsCount: 5,
      });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generating flashcards");
    } finally {
      setGeneratingDocId(null);
    }
  };

  const handleProcessDocument = async (documentId: string) => {
    try {
      setProcessingDocId(documentId);
      await documentsAPI.process(documentId);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error procesando documento");
    } finally {
      setProcessingDocId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-red-500">{error || "Curso no encontrado"}</p>
        <Link href="/containers">
          <Button variant="outline" className="mt-4">
            Volver a cursos
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/containers"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${course.color}20` }}
            >
              <Folder className="h-7 w-7" style={{ color: course.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{course.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {course.description || "Sin descripción"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectionMode ? (
              <>
                <Button variant="outline" onClick={cancelSelectionMode}>
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={startStudyWithSelection}
                  disabled={selectedDocuments.size === 0}
                >
                  <Play className="h-4 w-4" />
                  Estudiar ({selectedDocuments.size})
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectionMode(true)}>
                  <CheckSquare className="h-4 w-4" />
                  Seleccionar
                </Button>
                <Button onClick={() => setShowAddSubjectModal(true)}>
                  <Plus className="h-4 w-4" />
                  Nueva materia
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{course.subjectsCount}</p>
            <p className="text-sm text-gray-500">Materias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{course.documentsCount}</p>
            <p className="text-sm text-gray-500">Documentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{course.flashcardsCount || 0}</p>
            <p className="text-sm text-gray-500">Flashcards</p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects list */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Materias</h2>

        {course.subjects.length > 0 ? (
          <div className="space-y-3">
            {course.subjects.map((subject: any, index: number) => {
              const isExpanded = expandedSubject === subject.id;
              const isSubjectMenuOpen = subjectMenuOpen === subject.id;

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <div
                      className="h-1"
                      style={{ backgroundColor: subject.color || course.color }}
                    />
                    <CardContent className="p-0">
                      {/* Subject header */}
                      <div
                        className="flex cursor-pointer items-center justify-between p-4"
                        onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${subject.color || course.color}20` }}
                          >
                            <BookOpen
                              className="h-5 w-5"
                              style={{ color: subject.color || course.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{subject.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{subject.documentsCount || 0} documentos</span>
                              <span>•</span>
                              <span>{subject.flashcardsCount || 0} flashcards</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openUploadModal(subject.id);
                            }}
                          >
                            <Upload className="h-4 w-4" />
                            Subir
                          </Button>
                          {subject.flashcardsCount > 0 && (
                            <Link
                              href={`/study?subject=${subject.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button size="sm">
                                <Sparkles className="h-4 w-4" />
                                Estudiar
                              </Button>
                            </Link>
                          )}

                          {/* Subject menu */}
                          <button
                            ref={(el) => { subjectMenuRefs.current.set(subject.id, el); }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubjectMenuOpen(isSubjectMenuOpen ? null : subject.id);
                            }}
                            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>

                          <DropdownMenu
                            isOpen={isSubjectMenuOpen}
                            onClose={() => setSubjectMenuOpen(null)}
                            triggerRef={{ current: subjectMenuRefs.current.get(subject.id) || null }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditSubjectModal(subject);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <Edit2 className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteSubjectConfirm(subject);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </DropdownMenu>

                          <ChevronRight
                            className={`h-5 w-5 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded documents */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                              {subject.documents && subject.documents.length > 0 ? (
                                <div className="space-y-2">
                                  {/* Select all checkbox for subject in selection mode */}
                                  {selectionMode && subject.documents.some((d: any) => d.processingStatus === "READY" && d.flashcardsCount > 0) && (
                                    <button
                                      onClick={() => toggleSubjectSelection(subject.documents)}
                                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
                                    >
                                      {subject.documents
                                        .filter((d: any) => d.processingStatus === "READY" && d.flashcardsCount > 0)
                                        .every((d: any) => selectedDocuments.has(d.id)) ? (
                                        <CheckSquare className="h-4 w-4 text-indigo-500" />
                                      ) : (
                                        <Square className="h-4 w-4" />
                                      )}
                                      Seleccionar todos
                                    </button>
                                  )}
                                  {subject.documents.map((doc: any) => {
                                    const isDocMenuOpen = docMenuOpen === doc.id;
                                    const isSelected = selectedDocuments.has(doc.id);
                                    const canSelect = doc.processingStatus === "READY" && doc.flashcardsCount > 0;

                                    return (
                                      <div
                                        key={doc.id}
                                        className={`flex items-center justify-between rounded-lg bg-white p-3 dark:bg-gray-900 ${
                                          selectionMode && isSelected ? "ring-2 ring-indigo-500" : ""
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          {/* Checkbox in selection mode */}
                                          {selectionMode ? (
                                            <button
                                              onClick={() => canSelect && toggleDocumentSelection(doc.id)}
                                              disabled={!canSelect}
                                              className={`rounded p-1 ${!canSelect ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                                            >
                                              {isSelected ? (
                                                <CheckSquare className="h-5 w-5 text-indigo-500" />
                                              ) : (
                                                <Square className="h-5 w-5 text-gray-400" />
                                              )}
                                            </button>
                                          ) : (
                                            <div className={`rounded-lg p-2 ${
                                              doc.processingStatus === "READY"
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : doc.processingStatus === "FAILED"
                                                ? "bg-red-100 dark:bg-red-900/30"
                                                : doc.processingStatus === "PROCESSING"
                                                ? "bg-yellow-100 dark:bg-yellow-900/30"
                                                : "bg-gray-100 dark:bg-gray-800"
                                            }`}>
                                              {doc.processingStatus === "READY" ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                              ) : doc.processingStatus === "FAILED" ? (
                                                <AlertCircle className="h-5 w-5 text-red-600" />
                                              ) : doc.processingStatus === "PROCESSING" ? (
                                                <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                                              ) : (
                                                <Clock className="h-5 w-5 text-gray-400" />
                                              )}
                                            </div>
                                          )}
                                          <div>
                                            <p className="font-medium">{doc.title}</p>
                                            <p className="text-sm text-gray-500">
                                              {doc.processingStatus === "PROCESSING"
                                                ? "Procesando..."
                                                : doc.processingStatus === "FAILED"
                                                ? "Error al procesar"
                                                : doc.processingStatus === "PENDING"
                                                ? "Pendiente de procesar"
                                                : `${doc.flashcardsCount || 0} flashcards · ${doc.questionsCount || 0} preguntas`}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {/* View PDF button */}
                                          {doc.originalFileUrl && (
                                            <a
                                              href={doc.originalFileUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                                              title="Ver archivo original"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                            </a>
                                          )}
                                          {!selectionMode && doc.processingStatus === "READY" && doc.flashcardsCount > 0 && (
                                            <Link href={`/study?document=${doc.id}`}>
                                              <Button variant="ghost" size="sm">
                                                <Sparkles className="h-4 w-4" />
                                                Estudiar
                                              </Button>
                                            </Link>
                                          )}
                                          {!selectionMode && doc.processingStatus === "READY" && doc.flashcardsCount === 0 && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleGenerateFlashcards(doc.id)}
                                              disabled={generatingDocId === doc.id}
                                            >
                                              {generatingDocId === doc.id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                  Generando...
                                                </>
                                              ) : (
                                                <>
                                                  <Sparkles className="h-4 w-4" />
                                                  Generar
                                                </>
                                              )}
                                            </Button>
                                          )}
                                          {!selectionMode && doc.processingStatus === "PROCESSING" && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleProcessDocument(doc.id)}
                                              disabled={processingDocId === doc.id}
                                            >
                                              {processingDocId === doc.id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                  Procesando...
                                                </>
                                              ) : (
                                                <>
                                                  <FileUp className="h-4 w-4" />
                                                  Procesar PDF
                                                </>
                                              )}
                                            </Button>
                                          )}
                                          {!selectionMode && doc.processingStatus === "PENDING" && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleGenerateFlashcards(doc.id)}
                                              disabled={generatingDocId === doc.id}
                                            >
                                              {generatingDocId === doc.id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                  Generando...
                                                </>
                                              ) : (
                                                <>
                                                  <Sparkles className="h-4 w-4" />
                                                  Generar
                                                </>
                                              )}
                                            </Button>
                                          )}
                                          {!selectionMode && doc.processingStatus === "FAILED" && (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleProcessDocument(doc.id)}
                                              disabled={processingDocId === doc.id}
                                            >
                                              {processingDocId === doc.id ? (
                                                <>
                                                  <Loader2 className="h-4 w-4 animate-spin" />
                                                  Procesando...
                                                </>
                                              ) : (
                                                <>
                                                  <AlertCircle className="h-4 w-4" />
                                                  Reintentar
                                                </>
                                              )}
                                            </Button>
                                          )}

                                          {/* Document menu */}
                                          {!selectionMode && (
                                            <button
                                              ref={(el) => { docMenuRefs.current.set(doc.id, el); }}
                                              onClick={() => setDocMenuOpen(isDocMenuOpen ? null : doc.id)}
                                              className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                              <MoreVertical className="h-4 w-4 text-gray-400" />
                                            </button>
                                          )}

                                          <DropdownMenu
                                            isOpen={isDocMenuOpen}
                                            onClose={() => setDocMenuOpen(null)}
                                            triggerRef={{ current: docMenuRefs.current.get(doc.id) || null }}
                                          >
                                            <button
                                              onClick={() => openEditDocModal(doc)}
                                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                            >
                                              <Edit2 className="h-4 w-4" />
                                              Editar
                                            </button>
                                            <button
                                              onClick={() => openDeleteDocConfirm(doc)}
                                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                              Eliminar
                                            </button>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="py-6 text-center">
                                  <FileText className="mx-auto h-10 w-10 text-gray-300" />
                                  <p className="mt-2 text-sm text-gray-500">
                                    No hay documentos en esta materia
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => openUploadModal(subject.id)}
                                  >
                                    <Upload className="h-4 w-4" />
                                    Subir documento
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold">No hay materias</h3>
              <p className="mt-2 text-gray-500">
                Añade tu primera materia para empezar a organizar tus documentos
              </p>
              <Button className="mt-4" onClick={() => setShowAddSubjectModal(true)}>
                <Plus className="h-4 w-4" />
                Añadir materia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAddSubjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Nueva materia</h2>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <Input
                  label="Nombre de la materia"
                  placeholder="Ej: Programación, Matemáticas..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddSubjectModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddSubject}
                  disabled={!newSubjectName.trim() || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear materia"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {showEditSubjectModal && selectedSubjectData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowEditSubjectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar materia</h2>
                <button
                  onClick={() => setShowEditSubjectModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <Input
                  label="Nombre de la materia"
                  placeholder="Ej: Programación, Matemáticas..."
                  value={editSubjectName}
                  onChange={(e) => setEditSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateSubject()}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditSubjectModal(false)}
                  disabled={updating}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateSubject}
                  disabled={!editSubjectName.trim() || updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Subject Confirmation Modal */}
      <AnimatePresence>
        {showDeleteSubjectConfirm && selectedSubjectData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteSubjectConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold">Eliminar materia</h2>
                <p className="mt-2 text-sm text-gray-500">
                  ¿Estás seguro de que querés eliminar <strong>{selectedSubjectData.name}</strong>?
                  Esta acción eliminará todos los documentos y flashcards asociados.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteSubjectConfirm(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteSubject}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Agregar documento</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mode selector */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setUploadMode("text")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                    uploadMode === "text"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <Type className="h-5 w-5" />
                  <span className="font-medium">Pegar texto</span>
                </button>
                <button
                  onClick={() => setUploadMode("file")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                    uploadMode === "file"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <FileUp className="h-5 w-5" />
                  <span className="font-medium">Subir PDF</span>
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <Input
                  label="Título del documento"
                  placeholder="Ej: Tema 1 - Introducción"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />

                <Input
                  label="Descripción (opcional)"
                  placeholder="Ej: Capítulo introductorio del libro"
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                />

                {uploadMode === "text" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Contenido del documento
                    </label>
                    <textarea
                      className="h-40 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-indigo-900"
                      placeholder="Pega aquí el texto de tus apuntes, resúmenes o contenido de estudio..."
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {docText.length} caracteres
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                        selectedFile
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {selectedFile ? (
                        <>
                          <FileUp className="mx-auto h-12 w-12 text-green-500" />
                          <p className="mt-4 font-medium text-green-700 dark:text-green-400">
                            {selectedFile.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                            }}
                            className="mt-3 text-sm text-red-500 hover:text-red-700"
                          >
                            Quitar archivo
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 font-medium">
                            Arrastra un archivo o haz click
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            PDF o TXT (máx. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                    {uploadProgress && (
                      <p className="mt-2 text-sm text-indigo-600">
                        {uploadProgress}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowUploadModal(false)}
                  disabled={creatingDoc}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateDocument}
                  disabled={!docTitle.trim() || creatingDoc || (uploadMode === "file" && !selectedFile)}
                >
                  {creatingDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {uploadProgress || "Guardando..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Crear documento
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Document Modal */}
      <AnimatePresence>
        {showEditDocModal && selectedDocData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowEditDocModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar documento</h2>
                <button
                  onClick={() => setShowEditDocModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Input
                  label="Título del documento"
                  placeholder="Ej: Tema 1 - Introducción"
                  value={selectedDocData.title}
                  onChange={(e) => setSelectedDocData({ ...selectedDocData, title: e.target.value })}
                />

                <Input
                  label="Descripción (opcional)"
                  placeholder="Ej: Capítulo introductorio"
                  value={selectedDocData.description}
                  onChange={(e) => setSelectedDocData({ ...selectedDocData, description: e.target.value })}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditDocModal(false)}
                  disabled={updatingDoc}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateDocument}
                  disabled={!selectedDocData.title.trim() || updatingDoc}
                >
                  {updatingDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Document Confirmation Modal */}
      <AnimatePresence>
        {showDeleteDocConfirm && selectedDocData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteDocConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold">Eliminar documento</h2>
                <p className="mt-2 text-sm text-gray-500">
                  ¿Estás seguro de que querés eliminar <strong>{selectedDocData.title}</strong>?
                  Esta acción eliminará todas las flashcards y preguntas generadas.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteDocConfirm(false)}
                  disabled={deletingDoc}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteDocument}
                  disabled={deletingDoc}
                >
                  {deletingDoc ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
