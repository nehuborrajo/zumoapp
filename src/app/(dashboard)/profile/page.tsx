"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@/components/ui";
import {
  User,
  Settings,
  Star,
  Flame,
  Trophy,
  Target,
  Calendar,
  BookOpen,
  Award,
  Edit2,
  Crown,
  Share2,
  Clock,
} from "lucide-react";
import { formatNumber, leagueTierColors } from "@/lib/utils";

// Mock user data
const userData = {
  level: 12,
  totalXp: 4850,
  xpForNextLevel: 5625,
  coins: 340,
  currentStreak: 7,
  longestStreak: 15,
  currentLeague: "GOLD",
  isPremium: false,
  totalStudyTime: 4520, // minutes
  totalFlashcards: 487,
  totalSessions: 89,
  accuracy: 92,
  joinedAt: "2024-01-01",
};

const achievements = [
  { id: "1", name: "Primera sesión", description: "Completa tu primera sesión de estudio", icon: "🎯", unlocked: true, unlockedAt: "2024-01-01" },
  { id: "2", name: "Racha de 7 días", description: "Mantén una racha de 7 días consecutivos", icon: "🔥", unlocked: true, unlockedAt: "2024-01-08" },
  { id: "3", name: "100 flashcards", description: "Estudia 100 flashcards", icon: "📚", unlocked: true, unlockedAt: "2024-01-10" },
  { id: "4", name: "Perfeccionista", description: "Obtén 100% en una sesión de 20+ preguntas", icon: "💯", unlocked: true, unlockedAt: "2024-01-12" },
  { id: "5", name: "Racha de 30 días", description: "Mantén una racha de 30 días", icon: "🏆", unlocked: false, progress: 23 },
  { id: "6", name: "500 flashcards", description: "Estudia 500 flashcards", icon: "🎓", unlocked: false, progress: 97 },
  { id: "7", name: "Liga Diamante", description: "Alcanza la liga Diamante", icon: "💎", unlocked: false, progress: 0 },
  { id: "8", name: "Madrugador", description: "Estudia antes de las 7am", icon: "🌅", unlocked: false, progress: 0 },
];

const recentActivity = [
  { type: "study", description: "Sesión de flashcards - Biología", xp: 45, time: "Hace 2 horas" },
  { type: "achievement", description: "¡Logro desbloqueado: Perfeccionista!", xp: 100, time: "Hace 1 día" },
  { type: "study", description: "Quiz - Historia de España", xp: 60, time: "Hace 1 día" },
  { type: "streak", description: "¡Racha de 7 días alcanzada!", xp: 50, time: "Hace 2 días" },
];

export default function ProfilePage() {
  const { user } = useUser();
  const leagueColors = leagueTierColors[userData.currentLeague];

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}min`;
    return `${hours}h ${minutes % 60}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Mi Perfil</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
            Ajustes
          </Button>
        </div>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl">
                  🐼
                </div>
                <button className="absolute -bottom-1 -right-1 rounded-full bg-white p-2 shadow-lg dark:bg-gray-800">
                  <Edit2 className="h-4 w-4 text-gray-500" />
                </button>
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                  {userData.level}
                </div>
              </div>

              {/* User info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-2xl font-bold">{user?.fullName || "Usuario"}</h2>
                  {userData.isPremium && (
                    <Badge variant="premium">
                      <Crown className="h-3 w-3" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500">@{user?.username || "usuario"}</p>

                {/* Level progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Nivel {userData.level}</span>
                    <span className="font-medium">{userData.totalXp} / {userData.xpForNextLevel} XP</span>
                  </div>
                  <Progress
                    value={(userData.totalXp / userData.xpForNextLevel) * 100}
                    variant="xp"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold">{userData.currentStreak}</span>
                  </div>
                  <p className="text-xs text-gray-500">Racha</p>
                </div>
                <div className="text-center">
                  <div className={`flex items-center justify-center gap-1 ${leagueColors.text}`}>
                    <Trophy className="h-5 w-5" />
                    <span className="text-lg font-bold">Oro</span>
                  </div>
                  <p className="text-xs text-gray-500">Liga</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <Star className="h-5 w-5" />
                    <span className="text-2xl font-bold">{userData.coins}</span>
                  </div>
                  <p className="text-xs text-gray-500">Monedas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatStudyTime(userData.totalStudyTime)}</p>
                  <p className="text-sm text-gray-500">Tiempo estudiando</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(userData.totalFlashcards)}</p>
                  <p className="text-sm text-gray-500">Flashcards estudiadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userData.accuracy}%</p>
                  <p className="text-sm text-gray-500">Precisión promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-900/30">
                  <Calendar className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userData.totalSessions}</p>
                  <p className="text-sm text-gray-500">Sesiones completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Logros
                <Badge variant="default" className="ml-auto">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`relative flex flex-col items-center rounded-xl p-3 ${
                      achievement.unlocked
                        ? "bg-amber-50 dark:bg-amber-900/20"
                        : "bg-gray-100 opacity-50 dark:bg-gray-800"
                    }`}
                    title={achievement.description}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <span className="mt-1 text-center text-xs font-medium line-clamp-2">
                      {achievement.name}
                    </span>
                    {!achievement.unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Badge variant="default" size="sm">
                          {achievement.progress}%
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          activity.type === "study"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : activity.type === "achievement"
                            ? "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-orange-100 dark:bg-orange-900/30"
                        }`}
                      >
                        {activity.type === "study" ? (
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        ) : activity.type === "achievement" ? (
                          <Trophy className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Flame className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="xp" size="sm">
                      +{activity.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Streaks card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Rachas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-8 w-8 text-orange-500 animate-fire" />
                  <span className="text-4xl font-bold">{userData.currentStreak}</span>
                </div>
                <p className="mt-1 text-gray-500">Racha actual</p>
              </div>
              <div className="h-16 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-8 w-8 text-amber-500" />
                  <span className="text-4xl font-bold">{userData.longestStreak}</span>
                </div>
                <p className="mt-1 text-gray-500">Mejor racha</p>
              </div>
            </div>

            {/* Calendar heatmap (simplified) */}
            <div className="mt-6">
              <p className="mb-3 text-sm text-gray-500">Últimos 30 días</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-sm ${
                        intensity > 0.7
                          ? "bg-green-500"
                          : intensity > 0.4
                          ? "bg-green-300"
                          : intensity > 0.1
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
