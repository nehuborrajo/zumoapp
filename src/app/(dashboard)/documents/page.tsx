"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input } from "@/components/ui";
import {
  FileText,
  Plus,
  Search,
  Grid,
  List,
  Filter,
  MoreVertical,
  Clock,
  BookOpen,
  Upload,
  X,
  Loader2,
  Sparkles,
  FolderOpen,
  Trash2,
  Edit2,
  Eye,
} from "lucide-react";

// Mock data
const mockDocuments = [
  {
    id: "1",
    title: "Biología - La Célula",
    subject: { name: "Biología", color: "#22c55e" },
    flashcards: 24,
    questions: 15,
    processingStatus: "READY",
    lastStudied: "2024-01-15T10:30:00",
    createdAt: "2024-01-10T08:00:00",
  },
  {
    id: "2",
    title: "Historia de España - Siglo XIX",
    subject: { name: "Historia", color: "#f59e0b" },
    flashcards: 45,
    questions: 30,
    processingStatus: "READY",
    lastStudied: "2024-01-14T15:00:00",
    createdAt: "2024-01-08T12:00:00",
  },
  {
    id: "3",
    title: "Matemáticas - Derivadas e Integrales",
    subject: { name: "Matemáticas", color: "#3b82f6" },
    flashcards: 18,
    questions: 12,
    processingStatus: "READY",
    lastStudied: "2024-01-12T09:00:00",
    createdAt: "2024-01-05T14:00:00",
  },
  {
    id: "4",
    title: "Física - Termodinámica",
    subject: { name: "Física", color: "#8b5cf6" },
    flashcards: 0,
    questions: 0,
    processingStatus: "PROCESSING",
    lastStudied: null,
    createdAt: "2024-01-15T16:00:00",
  },
];

const subjects = [
  { id: "all", name: "Todas", color: "#6b7280" },
  { id: "bio", name: "Biología", color: "#22c55e" },
  { id: "hist", name: "Historia", color: "#f59e0b" },
  { id: "math", name: "Matemáticas", color: "#3b82f6" },
  { id: "phys", name: "Física", color: "#8b5cf6" },
];

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsUploading(false);
    setShowUploadModal(false);
    setUploadedFile(null);
  };

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || doc.subject.name.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Mis Documentos</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {mockDocuments.length} documentos • {mockDocuments.reduce((acc, d) => acc + d.flashcards, 0)} flashcards totales
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="h-4 w-4" />
          Subir documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Subject filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <div className="flex gap-1">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id === "all" ? "all" : subject.name.toLowerCase())}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                        selectedSubject === (subject.id === "all" ? "all" : subject.name.toLowerCase())
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 ${
                  viewMode === "grid"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 ${
                  viewMode === "list"
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents grid/list */}
      {filteredDocuments.length > 0 ? (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {viewMode === "grid" ? (
                <Card className="card-hover group relative overflow-hidden">
                  <CardContent className="p-6">
                    {/* Processing indicator */}
                    {doc.processingStatus === "PROCESSING" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                          <p className="mt-2 text-sm font-medium">Procesando...</p>
                          <p className="text-xs text-gray-500">La IA está generando contenido</p>
                        </div>
                      </div>
                    )}

                    {/* Subject badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <Badge
                        style={{ backgroundColor: `${doc.subject.color}20`, color: doc.subject.color }}
                        className="font-medium"
                      >
                        {doc.subject.name}
                      </Badge>
                      <button className="rounded-lg p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-800">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Document icon */}
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                      <FileText className="h-7 w-7 text-gray-500" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold line-clamp-2">{doc.title}</h3>

                    {/* Stats */}
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {doc.flashcards} flashcards
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        {doc.questions} preguntas
                      </span>
                    </div>

                    {/* Last studied */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(doc.lastStudied)}
                      </span>
                      <Link href={`/study/${doc.id}`}>
                        <Button size="sm" variant="ghost">
                          Estudiar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="card-hover">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        <FileText className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.title}</h3>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <Badge
                            style={{ backgroundColor: `${doc.subject.color}20`, color: doc.subject.color }}
                            size="sm"
                          >
                            {doc.subject.name}
                          </Badge>
                          <span>{doc.flashcards} flashcards</span>
                          <span>•</span>
                          <span>{formatDate(doc.lastStudied)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/study/${doc.id}`}>
                        <Button size="sm">Estudiar</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold">No se encontraron documentos</h3>
            <p className="mt-2 text-gray-500">
              {searchQuery ? "Intenta con otra búsqueda" : "Sube tu primer documento para empezar"}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4" />
                Subir documento
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
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
                <h2 className="text-xl font-bold">Subir documento</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      isDragActive
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : "border-gray-300 hover:border-indigo-400 dark:border-gray-700"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 font-medium">
                      {isDragActive ? "Suelta el archivo aquí" : "Arrastra un archivo o haz click"}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">PDF o imagen (máx. 10MB)</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <FileText className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {uploadedFile && (
                  <div className="mt-4 space-y-4">
                    <Input label="Título del documento" placeholder="Ej: Biología - La Célula" />
                    <Input label="Materia (opcional)" placeholder="Ej: Biología" />
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!uploadedFile || isUploading}
                    isLoading={isUploading}
                    onClick={handleUpload}
                  >
                    <Sparkles className="h-4 w-4" />
                    Procesar con IA
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
