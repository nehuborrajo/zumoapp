"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import { useCourses } from "@/hooks/useCourses";
import { useUser } from "@/hooks/useUser";
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
  Folder,
  Loader2,
} from "lucide-react";

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
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const { user, loading: userLoading } = useUser();
  const { courses, loading: coursesLoading } = useCourses();

  useEffect(() => {
    const loadUser = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setSupabaseUser(user);
    };
    loadUser();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const userName = user?.displayName || supabaseUser?.user_metadata?.display_name || supabaseUser?.user_metadata?.name || "Estudiante";

  // Get recent courses (last 3)
  const recentCourses = courses.slice(0, 3);

  // Stats from user data
  const stats = {
    currentStreak: user?.currentStreak ?? 0,
    totalXp: user?.totalXp ?? 0,
    coins: user?.coins ?? 100,
    level: user?.level ?? 1,
  };

  const loading = userLoading || coursesLoading;

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
            {greeting()}, {userName}! 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Continúa tu racha de estudio y alcanza tus metas.
          </p>
        </div>
        <Link href="/containers">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo curso
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
                {stats.currentStreak > 0 && (
                  <Badge variant="streak">🔥 Activa</Badge>
                )}
              </div>
              <p className="mt-4 text-3xl font-bold">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `${stats.currentStreak} días`}
              </p>
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
                <Badge variant="xp">Nivel {stats.level}</Badge>
              </div>
              <p className="mt-4 text-3xl font-bold">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `${stats.totalXp} XP`}
              </p>
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
                  <Folder className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : courses.length}
              </p>
              <p className="text-sm text-gray-500">Cursos activos</p>
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
                <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
                  <Target className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold">
                {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `${stats.coins}`}
              </p>
              <p className="text-sm text-gray-500">Monedas</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mis Cursos</CardTitle>
              <Link href="/containers" className="text-sm text-indigo-600 hover:text-indigo-500">
                Ver todos
                <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Link
                        href={`/containers/${course.id}`}
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/20"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${course.color}20` }}
                          >
                            <Folder className="h-6 w-6" style={{ color: course.color }} />
                          </div>
                          <div>
                            <h3 className="font-semibold">{course.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{course.subjectsCount} materias</span>
                              <span>•</span>
                              <span>{course.documentsCount} documentos</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(course.updatedAt).toLocaleDateString()}
                          </div>
                          <Button variant="ghost" size="sm" className="mt-1">
                            <Zap className="h-4 w-4" />
                            Estudiar
                          </Button>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  {recentCourses.length === 0 && (
                    <div className="py-12 text-center">
                      <Folder className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-4 text-gray-500">No tienes cursos aún</p>
                      <Link href="/containers">
                        <Button variant="outline" className="mt-4">
                          <Plus className="h-4 w-4" />
                          Crear tu primer curso
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
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
                    <span className="text-4xl font-bold">0</span>
                    <span className="text-white/70">/ 50 XP</span>
                  </div>
                  <Progress value={0} variant="health" size="lg" className="mt-3 bg-white/20" />
                </div>
                <p className="mt-3 text-sm text-white/70">
                  ¡Estudia para ganar XP y completar tu meta diaria!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
