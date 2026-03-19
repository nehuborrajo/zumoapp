"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, Badge, Progress } from "@/components/ui";
import { useCourses, useCourse } from "@/hooks/useCourses";
import { useFlashcards, useQuestions } from "@/hooks/useFlashcards";
import { useUser } from "@/hooks/useUser";
import { studySessionsAPI, flashcardsAPI, type Flashcard, type Question, type StudySessionResult, type TutorSessionResult } from "@/lib/api";
import { TutorChat, TutorPremiumGate, TutorSessionCompleteModal } from "@/components/study/TutorChat";
import { QUALITY_MAP } from "@/lib/sm2";
import {
  BookOpen,
  ArrowRight,
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
  Folder,
  Loader2,
  AlertCircle,
  Trophy,
  TrendingUp,
  Coins,
  Gift,
  Sparkles,
  Clock,
} from "lucide-react";

const studyModes = [
  {
    id: "flashcards",
    name: "Flashcards",
    description: "Memorización con tarjetas",
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

// Wrapper component with Suspense for useSearchParams
export default function StudyPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <StudyPageContent />
    </Suspense>
  );
}

function StudyPageContent() {
  const searchParams = useSearchParams();
  const { courses, loading: coursesLoading } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { course: selectedCourseData, loading: courseLoading } = useCourse(selectedCourseId);
  const { refetch: refetchUser, user } = useUser();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [studyType, setStudyType] = useState<"all" | "due">("all"); // "all" = all flashcards, "due" = smart review (SM-2)
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"true" | "false" | null>(null);

  // Session tracking
  const sessionStartTime = useRef<number>(0);
  const [sessionResult, setSessionResult] = useState<StudySessionResult | null>(null);
  const [tutorSessionResult, setTutorSessionResult] = useState<TutorSessionResult | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  // Check for documents param in URL
  useEffect(() => {
    const documentsParam = searchParams.get("documents");
    if (documentsParam) {
      const docIds = documentsParam.split(",").filter(Boolean);
      if (docIds.length > 0) {
        setSelectedDocumentIds(docIds);
      }
    }
  }, [searchParams]);

  // Fetch flashcards and questions for selected subject OR documents
  // When studyType is "due", we fetch due flashcards separately during startStudy
  const { flashcards, loading: flashcardsLoading } = useFlashcards(
    selectedDocumentIds.length > 0
      ? { documentIds: selectedDocumentIds }
      : selectedSubject
  );
  const { questions, loading: questionsLoading } = useQuestions(
    selectedDocumentIds.length > 0
      ? { documentIds: selectedDocumentIds }
      : selectedSubject
  );

  // For smart review mode, fetch due flashcards count
  const { flashcards: dueFlashcards, loading: dueLoading, totalDue } = useFlashcards(
    (selectedSubject || selectedDocumentIds.length > 0)
      ? {
          subjectId: selectedSubject || undefined,
          documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
          dueOnly: true,
          limit: 50,
        }
      : null
  );

  // Filter questions by type for different modes
  const multipleChoiceQuestions = questions.filter((q) => q.type === "MULTIPLE_CHOICE");
  const trueFalseQuestions = questions.filter((q) => q.type === "TRUE_FALSE");

  // Current study items based on mode
  const [currentItems, setCurrentItems] = useState<(Flashcard | Question)[]>([]);
  const [shuffledItems, setShuffledItems] = useState<(Flashcard | Question)[]>([]);

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startStudy = () => {
    // Can start if we have either selectedSubject OR selectedDocumentIds
    const canStart = (selectedSubject || selectedDocumentIds.length > 0) && selectedMode;

    if (canStart) {
      // Tutor mode doesn't need flashcards/questions - it uses document text
      if (selectedMode === "tutor") {
        setIsStudying(true);
        return;
      }

      let items: (Flashcard | Question)[] = [];

      if (selectedMode === "flashcards") {
        // Use due flashcards for smart review, or all flashcards otherwise
        items = studyType === "due" ? dueFlashcards : flashcards;
      } else if (selectedMode === "quiz") {
        items = multipleChoiceQuestions;
      } else if (selectedMode === "truefalse") {
        items = trueFalseQuestions;
      }

      if (items.length === 0) {
        if (selectedMode === "flashcards" && studyType === "due") {
          alert("¡Bien hecho! No tienes tarjetas pendientes de repaso.");
        } else {
          alert("No hay contenido disponible para este modo de estudio");
        }
        return;
      }

      sessionStartTime.current = Date.now();

      const shuffled = shuffleArray(items);
      setCurrentItems(items);
      setShuffledItems(shuffled);
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

    if (currentCardIndex < shuffledItems.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  // Handle flashcard answer with SM-2 update
  const handleFlashcardAnswer = async (flashcardId: string, quality: number) => {
    // Update SM-2 data in backend (fire and forget - don't block UI)
    flashcardsAPI.updateSM2(flashcardId, quality).catch((err) => {
      console.error("Error updating flashcard SM-2:", err);
    });

    // Update local stats
    const correct = quality >= 3; // SM-2: quality >= 3 is correct
    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
      total: prev.total + 1,
    }));

    // Advance to next card
    setShowAnswer(false);
    if (currentCardIndex < shuffledItems.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const endSession = () => {
    setIsStudying(false);
    setSelectedCourseId(null);
    setSelectedSubject(null);
    setSelectedDocumentIds([]);
    setSelectedMode(null);
    setStudyType("all");
    setShuffledItems([]);
    setCurrentItems([]);
    setSessionResult(null);
    setTutorSessionResult(null);
  };

  // Save session to database
  const saveSession = async (stats: { correct: number; incorrect: number; total: number }) => {
    // Can save if we have either selectedSubject OR selectedDocumentIds
    if ((!selectedSubject && selectedDocumentIds.length === 0) || !selectedMode || savingSession) return;

    setSavingSession(true);
    try {
      const modeMap: Record<string, "FLASHCARDS" | "QUIZ" | "TRUE_FALSE"> = {
        flashcards: "FLASHCARDS",
        quiz: "QUIZ",
        truefalse: "TRUE_FALSE",
      };

      const durationSeconds = Math.floor((Date.now() - sessionStartTime.current) / 1000);

      const result = await studySessionsAPI.create({
        subjectId: selectedSubject || undefined,
        documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
        mode: modeMap[selectedMode],
        correctAnswers: stats.correct,
        totalQuestions: stats.total,
        durationSeconds,
      });

      setSessionResult(result);

      // Refresh user data to update XP, coins, streak in sidebar/header
      await refetchUser();
    } catch (error) {
      console.error("Error saving session:", error);
    } finally {
      setSavingSession(false);
    }
  };

  const resetSelection = () => {
    setSelectedCourseId(null);
    setSelectedSubject(null);
    setSelectedDocumentIds([]);
    setSelectedMode(null);
  };

  // Get available content count for each mode
  const getAvailableCount = (mode: string) => {
    if (mode === "flashcards") {
      // When flashcards mode is selected, show count based on studyType
      return studyType === "due" ? (totalDue || 0) : flashcards.length;
    }
    if (mode === "quiz") return multipleChoiceQuestions.length;
    if (mode === "truefalse") return trueFalseQuestions.length;
    return 0;
  };

  // Check if session is complete and save it
  const isSessionComplete = isStudying && shuffledItems.length > 0 && sessionStats.total === shuffledItems.length;

  useEffect(() => {
    if (isSessionComplete && !sessionResult && !savingSession) {
      saveSession(sessionStats);
    }
  }, [isSessionComplete, sessionResult, savingSession, sessionStats]);

  // Get context title for tutor mode
  const selectedSubjectName = selectedCourseData?.subjects.find(
    (s: { id: string; name: string }) => s.id === selectedSubject
  )?.name;
  const tutorContextTitle = selectedSubjectName
    ? `${selectedCourseData?.name} - ${selectedSubjectName}`
    : selectedCourseData?.name || "Material de estudio";

  // Study session view - Tutor IA mode
  if (isStudying && selectedMode === "tutor") {
    // Check premium status
    if (!user?.isPremium) {
      return <TutorPremiumGate onBack={endSession} />;
    }

    // Show session complete modal if we have a result
    if (tutorSessionResult) {
      return (
        <TutorSessionCompleteModal
          result={tutorSessionResult}
          onEnd={endSession}
        />
      );
    }

    return (
      <TutorChat
        documentId={selectedDocumentIds[0]}
        subjectId={selectedSubject || undefined}
        contextTitle={tutorContextTitle}
        onEndSession={async (result) => {
          if (result) {
            setTutorSessionResult(result);
            await refetchUser();
          } else {
            endSession();
          }
        }}
        onBack={endSession}
      />
    );
  }

  // Study session view - Flashcards mode
  if (isStudying && selectedMode === "flashcards") {
    const currentCard = shuffledItems[currentCardIndex] as Flashcard;
    const progress = ((currentCardIndex + 1) / shuffledItems.length) * 100;

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
            {studyType === "due" && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Sparkles className="h-3 w-3" />
                Repaso SM-2
              </Badge>
            )}
            <Badge variant="xp">
              <Star className="h-3 w-3" />
              +{sessionStats.correct * 10} XP
            </Badge>
            <span className="text-sm text-gray-500">
              {currentCardIndex + 1} / {shuffledItems.length}
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
        {currentCard && (
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
        )}

        {/* Answer buttons */}
        {showAnswer && !isSessionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <Button
              variant="outline"
              size="lg"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleFlashcardAnswer(currentCard.id, QUALITY_MAP.again)}
            >
              <XCircle className="h-5 w-5" />
              No lo sabía
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
              onClick={() => handleFlashcardAnswer(currentCard.id, QUALITY_MAP.hard)}
            >
              <HelpCircle className="h-5 w-5" />
              Más o menos
            </Button>
            <Button
              size="lg"
              variant="success"
              onClick={() => handleFlashcardAnswer(currentCard.id, QUALITY_MAP.easy)}
            >
              <CheckCircle className="h-5 w-5" />
              ¡Lo sabía!
            </Button>
          </motion.div>
        )}

        {/* Session complete */}
        {isSessionComplete && (
          <SessionCompleteModal
            stats={sessionStats}
            sessionResult={sessionResult}
            savingSession={savingSession}
            onEnd={endSession}
            onRepeat={() => {
              const shuffled = shuffleArray(currentItems);
              setShuffledItems(shuffled);
              setCurrentCardIndex(0);
              setShowAnswer(false);
              setSessionStats({ correct: 0, incorrect: 0, total: 0 });
              setSessionResult(null);
              sessionStartTime.current = Date.now();
            }}
          />
        )}
      </div>
    );
  }

  // Study session view - Quiz mode
  if (isStudying && selectedMode === "quiz") {
    const currentQuestion = shuffledItems[currentCardIndex] as Question;
    const progress = ((currentCardIndex + 1) / shuffledItems.length) * 100;

    const handleQuizAnswer = (option: string) => {
      if (showAnswer) return;
      setSelectedOption(option);
      setShowAnswer(true);
    };

    const handleNextQuestion = () => {
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      handleAnswer(isCorrect);
      setSelectedOption(null);
    };

    const userWasCorrect = selectedOption === currentQuestion?.correctAnswer;

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
              +{sessionStats.correct * 15} XP
            </Badge>
            <span className="text-sm text-gray-500">
              {currentCardIndex + 1} / {shuffledItems.length}
            </span>
          </div>
        </div>

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

        {/* Question */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className={showAnswer ? (userWasCorrect ? "border-green-400" : "border-red-400") : ""}>
              <CardContent className="p-6">
                {/* Feedback banner */}
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 p-3 rounded-xl ${
                      userWasCorrect
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {userWasCorrect ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-700 dark:text-green-400">¡Correcto! +15 XP</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-700 dark:text-red-400">Incorrecto</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                <p className="text-lg font-medium mb-6">{currentQuestion.question}</p>

                <div className="space-y-3">
                  {(currentQuestion.options as string[] || []).map((option, index) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const showResult = showAnswer;

                    return (
                      <motion.button
                        key={index}
                        whileHover={!showAnswer ? { scale: 1.01 } : {}}
                        whileTap={!showAnswer ? { scale: 0.99 } : {}}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={showAnswer}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showResult
                            ? isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isSelected
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-gray-200 dark:border-gray-700 opacity-50"
                            : isSelected
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                            showResult
                              ? isCorrect
                                ? "bg-green-500 text-white"
                                : isSelected
                                ? "bg-red-500 text-white"
                                : "bg-gray-100 dark:bg-gray-800"
                              : isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {showAnswer && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20"
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>💡 Explicación:</strong> {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Next button */}
        {showAnswer && !isSessionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Button size="lg" onClick={handleNextQuestion}>
              Siguiente pregunta
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Session complete */}
        {isSessionComplete && (
          <SessionCompleteModal
            stats={sessionStats}
            xpPerCorrect={15}
            sessionResult={sessionResult}
            savingSession={savingSession}
            onEnd={endSession}
            onRepeat={() => {
              const shuffled = shuffleArray(currentItems);
              setShuffledItems(shuffled);
              setCurrentCardIndex(0);
              setShowAnswer(false);
              setSessionStats({ correct: 0, incorrect: 0, total: 0 });
              setSelectedOption(null);
              setSessionResult(null);
              sessionStartTime.current = Date.now();
            }}
          />
        )}
      </div>
    );
  }

  // Study session view - True/False mode
  if (isStudying && selectedMode === "truefalse") {
    const currentQuestion = shuffledItems[currentCardIndex] as Question;
    const progress = ((currentCardIndex + 1) / shuffledItems.length) * 100;

    const handleTrueFalseAnswer = (answer: "true" | "false") => {
      if (showAnswer) return;
      setSelectedAnswer(answer);
      const isCorrect = answer === currentQuestion.correctAnswer.toLowerCase();
      setShowAnswer(true);

      // Auto advance after showing feedback
      setTimeout(() => {
        handleAnswer(isCorrect);
        setSelectedAnswer(null);
      }, 1800);
    };

    const userWasCorrect = selectedAnswer === currentQuestion?.correctAnswer?.toLowerCase();

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
              +{sessionStats.correct * 5} XP
            </Badge>
            <span className="text-sm text-gray-500">
              {currentCardIndex + 1} / {shuffledItems.length}
            </span>
          </div>
        </div>

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

        {/* Question */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className={showAnswer ? (userWasCorrect ? "border-green-400" : "border-red-400") : ""}>
              <CardContent className="p-8 text-center">
                {/* Feedback banner */}
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-3 rounded-xl ${
                      userWasCorrect
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {userWasCorrect ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-700 dark:text-green-400">¡Correcto!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-700 dark:text-red-400">
                            Incorrecto - La respuesta es: {currentQuestion.correctAnswer === "true" || currentQuestion.correctAnswer.toLowerCase() === "true" ? "Verdadero" : "Falso"}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                <p className="text-xl font-medium mb-8">{currentQuestion.question}</p>

                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={!showAnswer ? { scale: 1.05 } : {}}
                    whileTap={!showAnswer ? { scale: 0.95 } : {}}
                    disabled={showAnswer}
                    onClick={() => handleTrueFalseAnswer("true")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                      showAnswer
                        ? currentQuestion.correctAnswer.toLowerCase() === "true"
                          ? "bg-green-500 text-white ring-4 ring-green-300"
                          : selectedAnswer === "true"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Verdadero
                  </motion.button>
                  <motion.button
                    whileHover={!showAnswer ? { scale: 1.05 } : {}}
                    whileTap={!showAnswer ? { scale: 0.95 } : {}}
                    disabled={showAnswer}
                    onClick={() => handleTrueFalseAnswer("false")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                      showAnswer
                        ? currentQuestion.correctAnswer.toLowerCase() === "false"
                          ? "bg-green-500 text-white ring-4 ring-green-300"
                          : selectedAnswer === "false"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    <XCircle className="h-6 w-6" />
                    Falso
                  </motion.button>
                </div>

                {showAnswer && currentQuestion.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-left"
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>💡 Explicación:</strong> {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Session complete */}
        {isSessionComplete && (
          <SessionCompleteModal
            stats={sessionStats}
            xpPerCorrect={5}
            sessionResult={sessionResult}
            savingSession={savingSession}
            onEnd={endSession}
            onRepeat={() => {
              const shuffled = shuffleArray(currentItems);
              setShuffledItems(shuffled);
              setCurrentCardIndex(0);
              setShowAnswer(false);
              setSessionStats({ correct: 0, incorrect: 0, total: 0 });
              setSelectedAnswer(null);
              setSessionResult(null);
              sessionStartTime.current = Date.now();
            }}
          />
        )}
      </div>
    );
  }

  // Main selection view
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Estudiar</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Selecciona un curso y materia para empezar
        </p>
      </div>

      {/* Step 1: Select course */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">1. Selecciona un curso</h2>
          {(selectedCourseId || selectedDocumentIds.length > 0) && (
            <button
              onClick={resetSelection}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Cambiar selección
            </button>
          )}
        </div>

        {/* Show selected documents from URL */}
        {selectedDocumentIds.length > 0 ? (
          <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <BookOpen className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-semibold">Documentos seleccionados</p>
                <p className="text-sm text-gray-500">{selectedDocumentIds.length} documento(s)</p>
              </div>
              <CheckCircle className="ml-auto h-5 w-5 text-indigo-500" />
            </CardContent>
          </Card>
        ) : coursesLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : !selectedCourseId ? (
          courses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer transition-all hover:border-indigo-300 hover:shadow-md"
                    onClick={() => setSelectedCourseId(course.id)}
                  >
                    <div className="h-2" style={{ backgroundColor: course.color }} />
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${course.color}20` }}
                        >
                          <Folder className="h-6 w-6" style={{ color: course.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{course.name}</h3>
                          <p className="text-sm text-gray-500">
                            {course.subjectsCount} materias
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>{course.flashcardsCount || 0} flashcards</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Folder className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No tienes cursos aún</p>
                <Link href="/containers">
                  <Button variant="outline" className="mt-4">
                    Crear un curso
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${selectedCourseData?.color || '#6366f1'}20` }}
              >
                <Folder className="h-5 w-5" style={{ color: selectedCourseData?.color || '#6366f1' }} />
              </div>
              <div>
                <p className="font-semibold">{selectedCourseData?.name || 'Cargando...'}</p>
                <p className="text-sm text-gray-500">{selectedCourseData?.subjectsCount || 0} materias</p>
              </div>
              <CheckCircle className="ml-auto h-5 w-5 text-indigo-500" />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Step 2: Select subject */}
      <div className={(selectedCourseId || selectedDocumentIds.length > 0) ? "" : "pointer-events-none opacity-50"}>
        <h2 className="mb-4 text-lg font-semibold">2. Selecciona una materia</h2>

        {selectedDocumentIds.length > 0 ? (
          // When documents are pre-selected from URL, show as completed
          <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
            <CardContent className="flex items-center gap-4 p-4">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="font-semibold">Contenido seleccionado</p>
                <p className="text-sm text-gray-500">
                  {flashcardsLoading ? "Cargando..." : `${flashcards.length} flashcards · ${questions.length} preguntas`}
                </p>
              </div>
              <CheckCircle className="ml-auto h-5 w-5 text-indigo-500" />
            </CardContent>
          </Card>
        ) : courseLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : selectedCourseId && !selectedSubject ? (
          selectedCourseData && selectedCourseData.subjects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedCourseData.subjects.map((subject: any, index: number) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      subject.flashcardsCount > 0
                        ? "hover:border-indigo-300"
                        : "opacity-60"
                    }`}
                    onClick={() => subject.flashcardsCount > 0 && setSelectedSubject(subject.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <Badge style={{ backgroundColor: `${subject.color || '#6366f1'}20`, color: subject.color || '#6366f1' }}>
                          {subject.name}
                        </Badge>
                        {subject.flashcardsCount === 0 && (
                          <Badge variant="warning">Sin contenido</Badge>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>{subject.documentsCount || 0} docs</span>
                        <span>{subject.flashcardsCount || 0} flashcards</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-4 text-gray-500">No hay materias en este curso</p>
                <Link href={`/containers/${selectedCourseId}`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    Agregar materias
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : selectedSubject ? (
          <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20">
            <CardContent className="flex items-center gap-4 p-4">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="font-semibold">
                  {selectedCourseData?.subjects.find((s: any) => s.id === selectedSubject)?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {flashcardsLoading ? "Cargando..." : `${flashcards.length} flashcards · ${questions.length} preguntas`}
                </p>
              </div>
              <CheckCircle className="ml-auto h-5 w-5 text-indigo-500" />
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-500">Selecciona un curso primero</p>
        )}
      </div>

      {/* Step 3: Select mode */}
      <div className={(selectedSubject || selectedDocumentIds.length > 0) ? "" : "pointer-events-none opacity-50"}>
        <h2 className="mb-4 text-lg font-semibold">3. Elige el modo de estudio</h2>

        {(flashcardsLoading || questionsLoading) && (selectedSubject || selectedDocumentIds.length > 0) ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studyModes.map((mode, index) => {
              const count = getAvailableCount(mode.id);
              // Tutor mode is enabled for premium users (doesn't need flashcard count)
              const isTutorMode = mode.id === "tutor";
              const isPremiumLocked = mode.premium && !user?.isPremium;
              const isDisabled = isTutorMode ? isPremiumLocked : (count === 0);

              return (
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
                        : isDisabled
                        ? "opacity-50"
                        : "hover:border-indigo-300"
                    } ${mode.premium ? "relative overflow-hidden" : ""}`}
                    onClick={() => !isDisabled && setSelectedMode(mode.id)}
                  >
                    {mode.premium && !user?.isPremium && (
                      <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white">
                        PRO
                      </div>
                    )}
                    {mode.premium && user?.isPremium && (
                      <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                        ✓ PRO
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 text-5xl">{mode.icon}</div>
                      <h3 className="font-semibold">{mode.name}</h3>
                      <p className="mt-2 text-sm text-gray-500">{mode.description}</p>
                      {!mode.premium && (selectedSubject || selectedDocumentIds.length > 0) && (
                        <Badge variant={count > 0 ? "primary" : "default"} className="mt-3">
                          {count} disponibles
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Study type toggle for flashcards mode */}
        {selectedMode === "flashcards" && (selectedSubject || selectedDocumentIds.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <p className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              Tipo de sesión:
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStudyType("all")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  studyType === "all"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 hover:border-indigo-300 dark:border-gray-700"
                }`}
              >
                <BookOpen className={`h-5 w-5 ${studyType === "all" ? "text-indigo-500" : "text-gray-500"}`} />
                <div className="text-left">
                  <p className={`font-medium ${studyType === "all" ? "text-indigo-700 dark:text-indigo-300" : ""}`}>
                    Todas las tarjetas
                  </p>
                  <p className="text-xs text-gray-500">{flashcards.length} disponibles</p>
                </div>
              </button>
              <button
                onClick={() => setStudyType("due")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  studyType === "due"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 hover:border-purple-300 dark:border-gray-700"
                }`}
              >
                <Sparkles className={`h-5 w-5 ${studyType === "due" ? "text-purple-500" : "text-gray-500"}`} />
                <div className="text-left">
                  <p className={`font-medium ${studyType === "due" ? "text-purple-700 dark:text-purple-300" : ""}`}>
                    Repaso inteligente
                  </p>
                  <p className="text-xs text-gray-500">
                    {dueLoading ? "..." : `${totalDue || 0} pendientes`}
                  </p>
                </div>
              </button>
            </div>
            {studyType === "due" && (totalDue || 0) === 0 && !dueLoading && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                ¡No tienes tarjetas pendientes de repaso!
              </p>
            )}
          </motion.div>
        )}
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
          disabled={
            (!selectedSubject && selectedDocumentIds.length === 0) ||
            !selectedMode ||
            (selectedMode !== "tutor" && getAvailableCount(selectedMode || "") === 0)
          }
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

// Session Complete Modal Component
function SessionCompleteModal({
  stats,
  xpPerCorrect = 10,
  sessionResult,
  savingSession,
  onEnd,
  onRepeat,
}: {
  stats: { correct: number; incorrect: number; total: number };
  xpPerCorrect?: number;
  sessionResult: StudySessionResult | null;
  savingSession: boolean;
  onEnd: () => void;
  onRepeat: () => void;
}) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8 text-center">
          {savingSession ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-500" />
              <p className="mt-4 text-gray-500">Guardando sesión...</p>
            </>
          ) : (
            <>
              {/* Emoji based on performance */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="mb-4 text-6xl"
              >
                {accuracy >= 90 ? "🏆" : accuracy >= 70 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}
              </motion.div>

              <h2 className="text-2xl font-bold">
                {accuracy >= 90
                  ? "¡Excelente!"
                  : accuracy >= 70
                  ? "¡Muy bien!"
                  : accuracy >= 50
                  ? "¡Buen intento!"
                  : "¡Sigue practicando!"}
              </h2>

              {/* Stats grid */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
                  <p className="text-sm text-gray-500">Correctas</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-2xl font-bold text-red-500">{stats.incorrect}</p>
                  <p className="text-sm text-gray-500">Incorrectas</p>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
                  <p className="text-2xl font-bold text-purple-600">{accuracy}%</p>
                  <p className="text-sm text-gray-500">Precisión</p>
                </div>
              </div>

              {/* Rewards from server */}
              {sessionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 space-y-3"
                >
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Badge variant="xp" size="lg">
                      <Star className="h-4 w-4" />
                      +{sessionResult.session.xpEarned} XP
                    </Badge>
                    {sessionResult.session.coinsEarned > 0 && (
                      <Badge variant="coins" size="lg">
                        <Coins className="h-4 w-4" />
                        +{sessionResult.session.coinsEarned} monedas
                      </Badge>
                    )}
                  </div>

                  {/* Level up notification */}
                  {sessionResult.user.leveledUp && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="font-bold">¡Subiste al nivel {sessionResult.user.level}!</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Streak info */}
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="streak" size="lg">
                      <Flame className="h-4 w-4" />
                      {sessionResult.user.streakIncreased
                        ? `¡Racha de ${sessionResult.user.currentStreak} días!`
                        : `Racha: ${sessionResult.user.currentStreak} días`}
                    </Badge>
                  </div>

                  {/* Achievements unlocked */}
                  {sessionResult.achievements.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="mt-4 space-y-2"
                    >
                      <p className="text-sm font-semibold text-gray-600">🎖️ Logros desbloqueados:</p>
                      {sessionResult.achievements.map((achievement, i) => (
                        <motion.div
                          key={achievement.code}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className={`rounded-xl p-3 ${
                            achievement.rarity === "LEGENDARY"
                              ? "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30"
                              : achievement.rarity === "EPIC"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                              : achievement.rarity === "RARE"
                              ? "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Trophy
                              className={`h-6 w-6 ${
                                achievement.rarity === "LEGENDARY"
                                  ? "text-yellow-500"
                                  : achievement.rarity === "EPIC"
                                  ? "text-purple-500"
                                  : achievement.rarity === "RARE"
                                  ? "text-blue-500"
                                  : "text-gray-500"
                              }`}
                            />
                            <div className="text-left flex-1">
                              <p className="font-semibold">{achievement.name}</p>
                              <p className="text-xs text-gray-500">{achievement.description}</p>
                            </div>
                            <div className="text-right text-xs">
                              {achievement.rewardXp > 0 && (
                                <span className="text-indigo-600">+{achievement.rewardXp} XP</span>
                              )}
                              {achievement.rewardCoins > 0 && (
                                <span className="text-yellow-600 ml-2">+{achievement.rewardCoins}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Fallback XP display if no server result */}
              {!sessionResult && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <Badge variant="xp" size="lg">
                    <Star className="h-4 w-4" />
                    +{stats.correct * xpPerCorrect} XP
                  </Badge>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onEnd}>
                  Terminar
                </Button>
                <Button className="flex-1" onClick={onRepeat}>
                  <RotateCcw className="h-4 w-4" />
                  Repetir
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
