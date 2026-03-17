"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Brain,
  Trophy,
  Users,
  Zap,
  Upload,
  Sparkles,
  Target,
  Flame,
  Crown,
  ArrowRight,
  Check,
  Star,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Upload,
    title: "Sube tu material",
    description: "PDFs, apuntes escaneados, o cualquier documento. Nuestra IA lo procesa todo.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Brain,
    title: "IA genera contenido",
    description: "Flashcards, quizzes, y preguntas automáticamente desde tu material.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Estudia de forma interactiva",
    description: "Múltiples modos de estudio: flashcards, quiz, verdadero/falso, y más.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Trophy,
    title: "Gana recompensas",
    description: "XP, monedas, logros, rachas. Haz el estudio adictivo como un videojuego.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

const studyModes = [
  { name: "Flashcards", icon: "🎴", description: "Memorización con repetición espaciada" },
  { name: "Quiz", icon: "❓", description: "Preguntas de opción múltiple" },
  { name: "V/F", icon: "✅", description: "Verdadero o falso rápido" },
  { name: "Tutor IA", icon: "🤖", description: "Chat con IA sobre tu material", premium: true },
];

const stats = [
  { value: "10M+", label: "Flashcards creadas" },
  { value: "500K+", label: "Estudiantes activos" },
  { value: "95%", label: "Mejora en notas" },
  { value: "4.9", label: "Valoración App Store" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Zumo</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Funciones
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Precios
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Cómo funciona
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Iniciar sesión</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="primary" size="lg" className="mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Potenciado por IA
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            >
              Convierte tus apuntes en{" "}
              <span className="text-gradient">superpoderes</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400 sm:text-xl"
            >
              Sube tus PDFs o apuntes. La IA genera flashcards y quizzes automáticamente.
              Estudia con gamificación que te mantiene enganchado como un videojuego.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/sign-up">
                <Button size="xl" className="w-full sm:w-auto">
                  Empezar gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Ver cómo funciona
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
              {/* Mock app interface */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="p-8">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Stats sidebar */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
                      <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-300" />
                        <span className="font-semibold">Racha: 7 días</span>
                      </div>
                      <div className="mt-2 text-3xl font-bold">1,250 XP</div>
                      <div className="mt-1 text-sm text-white/80">Nivel 12</div>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                      <div className="text-sm text-gray-500">Monedas</div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        <span className="text-2xl font-bold">340</span>
                      </div>
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                      <div className="mb-4 text-center text-sm text-gray-500">Flashcard 3/10</div>
                      <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-900">
                        <p className="text-xl font-medium">
                          ¿Cuál es la función principal de las mitocondrias?
                        </p>
                      </div>
                      <div className="mt-6 flex justify-center gap-4">
                        <button className="rounded-xl bg-red-100 px-6 py-3 font-medium text-red-600 transition hover:bg-red-200">
                          No lo sé
                        </button>
                        <button className="rounded-xl bg-green-100 px-6 py-3 font-medium text-green-600 transition hover:bg-green-200">
                          ¡Lo sé!
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -right-4 -top-4 rounded-xl bg-white p-3 shadow-lg dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                <span className="font-semibold">¡Logro desbloqueado!</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -left-4 bottom-20 rounded-xl bg-white p-3 shadow-lg dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold">¡Racha de 7 días!</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="primary" className="mb-4">Funciones</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Todo lo que necesitas para estudiar mejor
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Herramientas poderosas combinadas con gamificación para hacer el estudio efectivo y divertido.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-hover h-full">
                  <CardContent className="p-6">
                    <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.bgColor}`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Modes Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-900/50 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="primary" className="mb-4">Modos de estudio</Badge>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Múltiples formas de aprender
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Elige el modo que mejor se adapte a tu estilo de aprendizaje.
                La IA genera contenido específico para cada modo.
              </p>

              <div className="mt-8 space-y-4">
                {studyModes.map((mode, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <span className="text-3xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{mode.name}</span>
                        {mode.premium && (
                          <Badge variant="premium" size="sm">
                            <Crown className="h-3 w-3" />
                            PRO
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{mode.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                <div className="rounded-xl bg-white p-8 dark:bg-gray-900">
                  <div className="mb-6 text-center">
                    <span className="text-6xl">🎴</span>
                    <h3 className="mt-4 text-xl font-bold">Modo Flashcards</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Repetición espaciada automática</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Swipe o botones para responder</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Estadísticas de retención</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>XP por cada respuesta correcta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Section */}
      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="streak" className="mb-4">
              <Flame className="h-3.5 w-3.5" />
              Gamificación
            </Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Estudiar nunca fue tan adictivo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 dark:text-gray-400">
              Sistema de recompensas inspirado en los mejores juegos móviles.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold">XP y Niveles</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Gana XP por cada sesión de estudio y sube de nivel.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Flame className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold">Rachas diarias</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Mantén tu racha estudiando cada día. ¡No la pierdas!
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold">Ligas semanales</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Compite con otros estudiantes y sube de liga cada semana.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold">Monedas y tienda</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Gana monedas y personaliza tu avatar en la tienda.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Target className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold">Logros</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Desbloquea logros completando objetivos especiales.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Social</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Agrega amigos y compara tu progreso con ellos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20 dark:bg-gray-900/50 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="primary" className="mb-4">Precios</Badge>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Empieza gratis, mejora cuando quieras
            </h2>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Free Plan */}
            <Card className="card-hover">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold">Gratis</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Todo lo esencial para empezar a estudiar.
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Hasta 5 documentos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Flashcards y quizzes con IA</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Gamificación completa</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Ligas y social</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="mt-8 block">
                  <Button variant="outline" size="lg" className="w-full">
                    Empezar gratis
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border-2 border-indigo-500">
              <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-1 text-sm font-semibold text-white">
                Popular
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold">Premium</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Para estudiantes que quieren el máximo rendimiento.
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">$6.99</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  o $59.99/año (ahorra 29%)
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Documentos ilimitados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Tutor IA conversacional</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Simulacros de examen</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Estadísticas avanzadas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Sin anuncios</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Items exclusivos de tienda</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="mt-8 block">
                  <Button size="lg" className="w-full">
                    Empezar prueba de 7 días
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center text-white sm:p-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              ¿Listo para estudiar de forma inteligente?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Únete a miles de estudiantes que ya mejoraron sus notas con Zumo.
            </p>
            <Link href="/sign-up">
              <Button
                size="xl"
                variant="secondary"
                className="mt-8 bg-white text-indigo-600 hover:bg-gray-100"
              >
                Crear cuenta gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">Zumo</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
                Privacidad
              </Link>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
                Términos
              </Link>
              <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">
                Contacto
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Zumo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
