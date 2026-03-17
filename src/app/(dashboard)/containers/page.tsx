"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, Input, Badge } from "@/components/ui";
import { useCourses } from "@/hooks/useCourses";
import type { Course } from "@/lib/api";
import {
  Folder,
  Plus,
  MoreVertical,
  BookOpen,
  FileText,
  GraduationCap,
  Briefcase,
  Globe,
  Code,
  Music,
  Palette,
  Calculator,
  FlaskConical,
  X,
  ChevronRight,
  Clock,
  Loader2,
  Edit2,
  Trash2,
} from "lucide-react";

const iconOptions = [
  { id: "folder", icon: Folder, label: "Carpeta" },
  { id: "book", icon: BookOpen, label: "Libro" },
  { id: "graduation", icon: GraduationCap, label: "Universidad" },
  { id: "briefcase", icon: Briefcase, label: "Trabajo" },
  { id: "globe", icon: Globe, label: "Idiomas" },
  { id: "code", icon: Code, label: "Programación" },
  { id: "music", icon: Music, label: "Música" },
  { id: "palette", icon: Palette, label: "Arte" },
  { id: "calculator", icon: Calculator, label: "Matemáticas" },
  { id: "flask", icon: FlaskConical, label: "Ciencias" },
];

const colorOptions = [
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#6b7280", // Gray
];

const getIconComponent = (iconId: string) => {
  const found = iconOptions.find((opt) => opt.id === iconId);
  return found ? found.icon : Folder;
};

export default function ContainersPage() {
  const { courses, loading, error, createCourse, updateCourse, deleteCourse } = useCourses();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedContainer, setExpandedContainer] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newContainer, setNewContainer] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    icon: "folder",
  });
  const [editContainer, setEditContainer] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    icon: "folder",
  });

  const handleCreateContainer = async () => {
    if (!newContainer.name.trim()) return;

    try {
      setCreating(true);
      await createCourse({
        name: newContainer.name.trim(),
        description: newContainer.description.trim() || undefined,
        color: newContainer.color,
        icon: newContainer.icon,
      });
      setNewContainer({ name: "", description: "", color: "#6366f1", icon: "folder" });
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating course");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (course: Course) => {
    setSelectedCourse(course);
    setEditContainer({
      name: course.name,
      description: course.description || "",
      color: course.color,
      icon: course.icon,
    });
    setMenuOpen(null);
    setShowEditModal(true);
  };

  const handleUpdateContainer = async () => {
    if (!selectedCourse || !editContainer.name.trim()) return;

    try {
      setUpdating(true);
      await updateCourse(selectedCourse.id, {
        name: editContainer.name.trim(),
        description: editContainer.description.trim() || undefined,
        color: editContainer.color,
        icon: editContainer.icon,
      });
      setShowEditModal(false);
      setSelectedCourse(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating course");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenDeleteConfirm = (course: Course) => {
    setSelectedCourse(course);
    setMenuOpen(null);
    setShowDeleteConfirm(true);
  };

  const handleDeleteContainer = async () => {
    if (!selectedCourse) return;

    try {
      setDeleting(true);
      await deleteCourse(selectedCourse.id);
      setShowDeleteConfirm(false);
      setSelectedCourse(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting course");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Mis Cursos</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Organiza tus materias de estudio en cursos
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Nuevo curso
        </Button>
      </div>

      {/* Containers grid */}
      {courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((container, index) => {
            const IconComponent = getIconComponent(container.icon);
            const isExpanded = expandedContainer === container.id;
            const isMenuOpen = menuOpen === container.id;

            return (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Link href={`/containers/${container.id}`}>
                  <Card
                    className="card-hover cursor-pointer overflow-hidden"
                  >
                    {/* Color bar */}
                    <div className="h-2" style={{ backgroundColor: container.color }} />

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${container.color}20` }}
                          >
                            <IconComponent
                              className="h-6 w-6"
                              style={{ color: container.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{container.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {container.description || "Sin descripción"}
                            </p>
                          </div>
                        </div>

                        {/* Menu button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpen(isMenuOpen ? null : container.id);
                            }}
                            className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>

                          {/* Dropdown menu */}
                          <AnimatePresence>
                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setMenuOpen(null);
                                  }}
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleOpenEditModal(container);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                    Editar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleOpenDeleteConfirm(container);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {container.subjectsCount} materias
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {container.documentsCount} docs
                        </span>
                      </div>

                      {/* Last studied + expand arrow */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(container.updatedAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setExpandedContainer(isExpanded ? null : container.id);
                          }}
                          className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <ChevronRight
                            className={`h-4 w-4 text-gray-400 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expanded subjects */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">
                                  Materias
                                </span>
                              </div>
                              <div className="space-y-2">
                                {container.subjects.map((subject) => (
                                  <div
                                    key={subject.id}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
                                  >
                                    <span>{subject.name}</span>
                                    <Badge variant="default" size="sm">
                                      {subject.documentsCount} docs
                                    </Badge>
                                  </div>
                                ))}
                                {container.subjects.length === 0 && (
                                  <p className="text-center text-sm text-gray-400 py-2">
                                    No hay materias aún
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Folder className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold">No tienes cursos</h3>
            <p className="mt-2 text-gray-500">
              Crea tu primer curso para organizar tus materias de estudio
            </p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Crear curso
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Container Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Nuevo curso</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Input
                  label="Nombre"
                  placeholder="Ej: Mi Carrera, Curso de Inglés..."
                  value={newContainer.name}
                  onChange={(e) =>
                    setNewContainer({ ...newContainer, name: e.target.value })
                  }
                />

                <Input
                  label="Descripción (opcional)"
                  placeholder="Ej: Materias del 3er año..."
                  value={newContainer.description}
                  onChange={(e) =>
                    setNewContainer({ ...newContainer, description: e.target.value })
                  }
                />

                {/* Icon selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Icono</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setNewContainer({ ...newContainer, icon: opt.id })
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
                          newContainer.icon === opt.id
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                        }`}
                        title={opt.label}
                      >
                        <opt.icon
                          className={`h-5 w-5 ${
                            newContainer.icon === opt.id
                              ? "text-indigo-500"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setNewContainer({ ...newContainer, color })
                        }
                        className={`h-8 w-8 rounded-full transition-all ${
                          newContainer.color === color
                            ? "ring-2 ring-offset-2"
                            : "hover:scale-110"
                        }`}
                        style={{
                          backgroundColor: color,
                          // @ts-expect-error - CSS custom property for ring color
                          "--tw-ring-color": color,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="mb-2 text-xs text-gray-500">Vista previa</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${newContainer.color}20` }}
                    >
                      {(() => {
                        const Icon = getIconComponent(newContainer.icon);
                        return (
                          <Icon
                            className="h-5 w-5"
                            style={{ color: newContainer.color }}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {newContainer.name || "Nombre del curso"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {newContainer.description || "Descripción"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateContainer}
                  disabled={!newContainer.name.trim() || creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear curso"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Container Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Editar curso</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Input
                  label="Nombre"
                  placeholder="Ej: Mi Carrera, Curso de Inglés..."
                  value={editContainer.name}
                  onChange={(e) =>
                    setEditContainer({ ...editContainer, name: e.target.value })
                  }
                />

                <Input
                  label="Descripción (opcional)"
                  placeholder="Ej: Materias del 3er año..."
                  value={editContainer.description}
                  onChange={(e) =>
                    setEditContainer({ ...editContainer, description: e.target.value })
                  }
                />

                {/* Icon selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Icono</label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setEditContainer({ ...editContainer, icon: opt.id })
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all ${
                          editContainer.icon === opt.id
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                        }`}
                        title={opt.label}
                      >
                        <opt.icon
                          className={`h-5 w-5 ${
                            editContainer.icon === opt.id
                              ? "text-indigo-500"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          setEditContainer({ ...editContainer, color })
                        }
                        className={`h-8 w-8 rounded-full transition-all ${
                          editContainer.color === color
                            ? "ring-2 ring-offset-2"
                            : "hover:scale-110"
                        }`}
                        style={{
                          backgroundColor: color,
                          // @ts-expect-error - CSS custom property for ring color
                          "--tw-ring-color": color,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <p className="mb-2 text-xs text-gray-500">Vista previa</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${editContainer.color}20` }}
                    >
                      {(() => {
                        const Icon = getIconComponent(editContainer.icon);
                        return (
                          <Icon
                            className="h-5 w-5"
                            style={{ color: editContainer.color }}
                          />
                        );
                      })()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {editContainer.name || "Nombre del curso"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {editContainer.description || "Descripción"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                  disabled={updating}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateContainer}
                  disabled={!editContainer.name.trim() || updating}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
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
                <h2 className="mt-4 text-lg font-bold">Eliminar curso</h2>
                <p className="mt-2 text-sm text-gray-500">
                  ¿Estás seguro de que querés eliminar <strong>{selectedCourse.name}</strong>?
                  Esta acción eliminará todas las materias y documentos asociados.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteContainer}
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
    </div>
  );
}
