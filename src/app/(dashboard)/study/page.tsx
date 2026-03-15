"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import {
  BookOpen,
  ArrowRight,
  Shuffle,
  Clock,
  Target,
  Zap,
  Brain,
  HelpCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Flame,
  Star,
  Trophy,
} from "lucide-react";

// Mock data - documents to study
const studyDocuments = [
  {
    id: "1",
    title: "Biología - La Célula",
    subject: "Biología",
    flashcards: 24,
    questions: 15,
    dueForReview: 8,
    masteryLevel: 72,
    color: "#22c55e",
  },
  {
    id: "2",
    title: "Historia de España",
    subject: "Historia",
    flashcards: 45,
    questions: 30,
    dueForReview: 12,
    masteryLevel: 58,
    color: "#f59e0b",
  },
  {
    id: "3",
    title: "Matemáticas - Derivadas",
    subject: "Matemáticas",
    flashcards: 18,
    questions: 12,
    dueForReview: 5,
    masteryLevel: 85,
    color: "#3b82f6",
  },
];

const studyModes = [
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Memorización con repetición espaciada",
    icon: "🎴",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Preguntas de opción múltiple",
    icon: "❓",
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "truefalse",
    name: "Verdadero/Falso",
    description: "Respuestas rápidas V/F",
    icon: "✅",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "tutor",
    name: "Tutor IA",
    description: "Chat sobre tu material",
    icon: "🤖",
    color: "from-amber-500 to-orange-600",
    premium: true,
  },
];

// Mock flashcard data
const mockFlashcards = [
  {
    id: "1",
    front: "¿Cuál es la función principal de las mitocondrias?",
    back: "Producir energía (ATP) a través de la respiración celular.",
    difficulty: "medium",
  },
  {
    id: "2",
    front: "¿Qué es el ADN?",
    back: "Ácido desoxirribonucleico, molécula que contiene la información genética.",
    difficulty: "easy",
  },
  {
    id: "3",
    front: "¿Cuáles son las fases de la mitosis?",
    back: "Profase, Metafase, Anafase y Telofase.",
    difficulty: "hard",
  },
];

export default function StudyPage() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });

  const totalDueForReview = studyDocuments.reduce((acc, doc) => acc + doc.dueForReview, 0);

  const startStudy = () => {
    if (selectedDocument && selectedMode) {
      setIsStudying(true);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    }
  };

  const handleAnswer = (correct: boolean) => {
    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));
    setShowAnswer(false);

    if (currentCardIndex < mockFlashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const endSession = () => {
    setIsStudying(false);
    setSelectedDocument(null);
    setSelectedMode(null);
  };

  // Study session view
  if (isStudying) {
    const currentCard = mockFlashcards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / mockFlashcards.length) * 100;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={endSession}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Salir
          </button>
          <div className="flex items-center gap-4">
            <Badge variant="xp">
              <Star className="h-3 w-3" />
              +{sessionStats.correct * 10} XP
            </Badge>
            <span className="text-sm text-gray-500">
              {currentCardIndex + 1} / {mockFlashcards.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} variant="xp" size="sm" />

        {/* Stats */}
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">{sessionStats.correct}</span>
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">{sessionStats.incorrect}</span>
          </div>
        </div>

        {/* Flashcard */}
        <motion.div
          key={currentCard.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="perspective-1000"
        >
          <Card
            className="min-h-[300px] cursor-pointer"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <CardContent className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <AnimatePresence mode="wait">
                {!showAnswer ? (
                  <motion.div
                    key="question"
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge variant="primary" className="mb-4">
                      Pregunta
                    </Badge>
                    <p className="text-xl font-medium">{currentCard.front}</p>
                    <p className="mt-6 text-sm text-gray-400">
                      Toca para ver la respuesta
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="answer"
                    initial={{ rotateY: -180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: 180, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge variant="success" className="mb-4">
                      Respuesta
                    </Badge>
                    <p className="text-xl font-medium">{currentCard.back}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer buttons */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleAnswer(false)}
            >
              <XCircle className="h-5 w-5" />
              No lo sabía
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleAnswer(true)}
            >
              <HelpCircle className="h-5 w-5" />
              Más o menos
            </Button>
            <Button
              size="lg"
              variant="success"
              onClick={() => handleAnswer(true)}
            >
              <CheckCircle className="h-5 w-5" />
              ¡Lo sabía!
            </Button>
          </motion.div>
        )}

        {/* Session complete */}
        {currentCardIndex === mockFlashcards.length - 1 && sessionStats.total === mockFlashcards.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <Card className="w-full max-w-md">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-6xl">🎉</div>
                <h2 className="text-2xl font-bold">¡Sesión completada!</h2>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                    <p className="text-2xl font-bold text-green-600">{sessionStats.correct}</p>
                    <p className="text-sm text-gray-500">Correctas</p>
                  </div>
                  <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-2xl font-bold text-red-500">{sessionStats.incorrect}</p>
                    <p className="text-sm text-gray-500">Incorrectas</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                    </p>
                    <p className="text-sm text-gray-500">Precisión</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Badge variant="xp" size="lg">
                    <Star className="h-4 w-4" />
                    +{sessionStats.correct * 10} XP ganado
                  </Badge>
                  <Badge variant="streak" size="lg">
                    <Flame className="h-4 w-4" />
                    ¡Racha mantenida!
                  </Badge>
                </div>
                <div className="mt-8 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={endSession}>
                    Terminar
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    setCurrentCardIndex(0);
                    setShowAnswer(false);
                    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
                  }}>
                    <RotateCcw className="h-4 w-4" />
                    Repetir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Estudiar</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {totalDueForReview > 0
            ? `Tienes ${totalDueForReview} tarjetas pendientes de repasar`
            : "Selecciona un documento y modo de estudio"}
        </p>
      </div>

      {/* Quick review card */}
      {totalDueForReview > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white/20 p-3">
                  <Brain className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Repaso diario</h3>
                  <p className="text-white/80">
                    {totalDueForReview} tarjetas listas para repasar
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
              >
                <Zap className="h-5 w-5" />
                Empezar repaso
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 1: Select document */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">1. Selecciona un documento</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studyDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedDocument === doc.id
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : "hover:border-indigo-300"
                }`}
                onClick={() => setSelectedDocument(doc.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge style={{ backgroundColor: `${doc.color}20`, color: doc.color }}>
                      {doc.subject}
                    </Badge>
                    {doc.dueForReview > 0 && (
                      <Badge variant="warning" size="sm">
                        {doc.dueForReview} pendientes
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold">{doc.title}</h3>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>{doc.flashcards} flashcards</span>
                    <span>{doc.questions} preguntas</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Dominio</span>
                      <span className="font-medium">{doc.masteryLevel}%</span>
                    </div>
                    <Progress
                      value={doc.masteryLevel}
                      variant={doc.masteryLevel >= 80 ? "success" : "default"}
                      size="sm"
                      className="mt-2"
                      animated={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Step 2: Select mode */}
      <div className={selectedDocument ? "" : "pointer-events-none opacity-50"}>
        <h2 className="mb-4 text-lg font-semibold">2. Elige el modo de estudio</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {studyModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  selectedMode === mode.id
                    ? "ring-2 ring-indigo-500 ring-offset-2"
                    : "hover:border-indigo-300"
                } ${mode.premium ? "relative overflow-hidden" : ""}`}
                onClick={() => !mode.premium && setSelectedMode(mode.id)}
              >
                {mode.premium && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    PRO
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <div className="mb-4 text-5xl">{mode.icon}</div>
                  <h3 className="font-semibold">{mode.name}</h3>
                  <p className="mt-2 text-sm text-gray-500">{mode.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Button
          size="xl"
          disabled={!selectedDocument || !selectedMode}
          onClick={startStudy}
        >
          <Zap className="h-5 w-5" />
          Comenzar sesión de estudio
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
