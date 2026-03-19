"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useTutorChat } from "@/hooks/useTutorChat";
import { type TutorSessionResult } from "@/lib/api";
import {
  Brain,
  Send,
  ChevronLeft,
  Loader2,
  User,
  Sparkles,
  Clock,
  MessageSquare,
  Star,
  Coins,
  Trophy,
  Flame,
  TrendingUp,
} from "lucide-react";

interface TutorChatProps {
  documentId?: string;
  subjectId?: string;
  contextTitle: string;
  onEndSession: (result: TutorSessionResult | null) => void;
  onBack: () => void;
}

export function TutorChat({
  documentId,
  subjectId,
  contextTitle,
  onEndSession,
  onBack,
}: TutorChatProps) {
  const {
    messages,
    sendMessage,
    isStreaming,
    error,
    endSession,
    messageCount,
  } = useTutorChat({ documentId, subjectId });

  const [input, setInput] = useState("");
  const [sessionDuration, setSessionDuration] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndSession = async () => {
    setIsEnding(true);
    const result = await endSession();
    onEndSession(result);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowEndConfirm(true)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Salir
        </button>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Clock className="h-3 w-3" />
            {formatDuration(sessionDuration)}
          </Badge>
          <Badge variant="primary">
            <MessageSquare className="h-3 w-3" />
            {messageCount} mensajes
          </Badge>
        </div>
      </div>

      {/* Chat container */}
      <Card className="flex flex-col h-[600px]">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Tutor IA</h2>
            <p className="text-sm text-gray-500 truncate">{contextTitle}</p>
          </div>
          <Badge
            variant="premium"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <Sparkles className="h-3 w-3" />
            Premium
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center text-gray-500"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 mb-4">
                <Brain className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300">
                ¡Hola! Soy tu tutor IA
              </h3>
              <p className="mt-2 max-w-sm text-sm">
                Pregúntame cualquier cosa sobre tu material de estudio. Estoy
                aquí para ayudarte a comprender mejor los conceptos.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "¿Cuáles son los puntos clave?",
                  "Explícame el concepto principal",
                  "Dame un ejemplo práctico",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      msg.role === "user"
                        ? "bg-indigo-500"
                        : "bg-gradient-to-br from-amber-400 to-orange-500"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Brain className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-indigo-500 text-white rounded-br-md"
                        : "bg-gray-100 dark:bg-gray-800 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                      {msg.role === "assistant" &&
                        isStreaming &&
                        messages[messages.length - 1]?.id === msg.id && (
                          <span className="inline-block ml-1 animate-pulse">
                            ▋
                          </span>
                        )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={isStreaming}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
            />
            <Button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="rounded-xl"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-400">
            Mín. 2 min para ganar XP • 10 XP base + 5 XP/mensaje
          </p>
        </div>
      </Card>

      {/* End session confirmation modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="w-full max-w-sm">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold">¿Terminar sesión?</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Has estado estudiando por {formatDuration(sessionDuration)} y
                  enviado {messageCount} mensaje(s).
                </p>
                {sessionDuration < 120 && (
                  <p className="mt-2 text-xs text-amber-600">
                    Nota: Necesitas al menos 2 minutos para ganar XP.
                  </p>
                )}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEndConfirm(false)}
                  >
                    Continuar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleEndSession}
                    disabled={isEnding}
                  >
                    {isEnding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Terminar"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Premium gate component for non-premium users
export function TutorPremiumGate({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
            <Sparkles className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold">Tutor IA Premium</h2>
          <p className="mt-2 text-gray-500">
            El modo Tutor IA está disponible exclusivamente para usuarios
            Premium.
          </p>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:from-amber-900/20 dark:to-orange-900/20">
            <h3 className="font-semibold text-amber-700 dark:text-amber-300">
              Con Premium obtienes:
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-amber-600 dark:text-amber-400">
              <li>✨ Tutor IA conversacional</li>
              <li>🚀 Modelo GPT-4o más avanzado</li>
              <li>📚 Generación ilimitada de flashcards</li>
              <li>🏆 Sin anuncios</li>
            </ul>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onBack}>
              Volver
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              onClick={() => {
                // TODO: Navigate to subscription page
                alert("Página de suscripción próximamente");
              }}
            >
              <Sparkles className="h-4 w-4" />
              Ser Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Session complete modal for tutor
export function TutorSessionCompleteModal({
  result,
  onEnd,
}: {
  result: TutorSessionResult;
  onEnd: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="mb-4 text-6xl"
            >
              🎓
            </motion.div>

            <h2 className="text-2xl font-bold">¡Sesión completada!</h2>
            <p className="mt-2 text-gray-500">
              Has estudiado con el Tutor IA por{" "}
              {Math.floor(result.session.durationSeconds / 60)} minutos.
            </p>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
                <p className="text-2xl font-bold text-indigo-600">
                  {result.session.messageCount}
                </p>
                <p className="text-sm text-gray-500">Mensajes</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/20">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.floor(result.session.durationSeconds / 60)}m
                </p>
                <p className="text-sm text-gray-500">Duración</p>
              </div>
            </div>

            {/* Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 space-y-3"
            >
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Badge variant="xp" size="lg">
                  <Star className="h-4 w-4" />
                  +{result.session.xpEarned} XP
                </Badge>
                {result.session.coinsEarned > 0 && (
                  <Badge variant="coins" size="lg">
                    <Coins className="h-4 w-4" />
                    +{result.session.coinsEarned} monedas
                  </Badge>
                )}
              </div>

              {/* Level up */}
              {result.user.leveledUp && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-bold">
                      ¡Subiste al nivel {result.user.level}!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Streak */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant="streak" size="lg">
                  <Flame className="h-4 w-4" />
                  {result.user.streakIncreased
                    ? `¡Racha de ${result.user.currentStreak} días!`
                    : `Racha: ${result.user.currentStreak} días`}
                </Badge>
              </div>

              {/* Achievements */}
              {result.achievements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 space-y-2"
                >
                  <p className="text-sm font-semibold text-gray-600">
                    🎖️ Logros desbloqueados:
                  </p>
                  {result.achievements.map((achievement, i) => (
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
                          <p className="text-xs text-gray-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* If no XP earned */}
            {result.session.xpEarned === 0 && (
              <p className="mt-4 text-xs text-amber-600">
                Sesión muy corta. Estudia al menos 2 minutos para ganar XP.
              </p>
            )}

            <Button className="mt-8 w-full" onClick={onEnd}>
              Continuar
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
