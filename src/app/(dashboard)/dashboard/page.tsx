"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import {
  BookOpen,
  Plus,
  ArrowRight,
  Flame,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Zap,
} from "lucide-react";

// Mock data (will come from API later)
const recentDocuments = [
  { id: "1", title: "Biología - Célula", subject: "Biología", flashcards: 24, lastStudied: "Hace 2h" },
  { id: "2", title: "Historia de España", subject: "Historia", flashcards: 45, lastStudied: "Ayer" },
  { id: "3", title: "Matemáticas - Derivadas", subject: "Matemáticas", flashcards: 18, lastStudied: "Hace 3 días" },
];

const weeklyActivity = [
  { day: "L", value: 45, active: true },
  { day: "M", value: 80, active: true },
  { day: "X", value: 30, active: true },
  { day: "J", value: 65, active: true },
  { day: "V", value: 90, active: true },
  { day: "S", value: 20, active: true },
  { day: "D", value: 0, active: false },
];

const achievements = [
  { icon: "🔥", name: "Racha de 7 días", progress: 100, unlocked: true },
  { icon: "📚", name: "100 flashcards", progress: 72, unlocked: false },
  { icon: "🏆", name: "Top 10 liga", progress: 45, unlocked: false },
];

export default function DashboardPage() {
  const { user } = useUser();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {greeting()}, {user?.firstName || "Estudiante"}! 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Continúa tu racha de estudio y alcanza tus metas.
          </p>
        </div>
        <Link href="/documents/new">
          <Button>
            <Plus className="h-4 w-4" />
            Subir documento
          </Button>
        </Link>
      </motion.div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <Badge variant="streak">+5 ayer</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold">7 días</p>
              <p className="text-sm text-gray-500">Racha actual</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <Badge variant="xp">+120 hoy</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold">1,250 XP</p>
              <p className="text-sm text-gray-500">Experiencia total</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold">87</p>
              <p className="text-sm text-gray-500">Flashcards estudiadas hoy</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold">92%</p>
              <p className="text-sm text-gray-500">Precisión promedio</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documentos recientes</CardTitle>
              <Link href="/documents" className="text-sm text-indigo-600 hover:text-indigo-500">
                Ver todos
                <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                          <BookOpen className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{doc.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="default" size="sm">{doc.subject}</Badge>
                            <span>•</span>
                            <span>{doc.flashcards} flashcards</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {doc.lastStudied}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-1">
                          <Zap className="h-4 w-4" />
                          Estudiar
                        </Button>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {recentDocuments.length === 0 && (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No tienes documentos aún</p>
                    <Link href="/documents/new">
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4" />
                        Subir tu primer documento
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Weekly activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  Actividad semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 rounded-lg transition-all ${
                          day.active
                            ? "bg-gradient-to-t from-indigo-500 to-purple-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                        style={{ height: `${Math.max(day.value, 10)}px` }}
                      />
                      <span
                        className={`text-xs font-medium ${
                          day.active ? "text-gray-900 dark:text-white" : "text-gray-400"
                        }`}
                      >
                        {day.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Esta semana</span>
                  <span className="flex items-center gap-1 font-semibold text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    +23% vs anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Logros cercanos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                          achievement.unlocked
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{achievement.name}</span>
                          <span className="text-xs text-gray-500">{achievement.progress}%</span>
                        </div>
                        <Progress
                          value={achievement.progress}
                          variant={achievement.unlocked ? "success" : "default"}
                          size="sm"
                          animated={false}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/profile#achievements">
                  <Button variant="ghost" size="sm" className="mt-4 w-full">
                    Ver todos los logros
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Daily goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">Meta diaria</span>
                </div>
                <div className="mt-4">
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold">87</span>
                    <span className="text-white/70">/ 100 flashcards</span>
                  </div>
                  <Progress value={87} variant="health" size="lg" className="mt-3 bg-white/20" />
                </div>
                <p className="mt-3 text-sm text-white/70">
                  ¡Solo te faltan 13 flashcards para completar tu meta de hoy!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
