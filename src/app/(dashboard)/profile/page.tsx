"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { formatNumber, leagueTierColors } from "@/lib/utils";
import { userAPI, studySessionsAPI, type User as UserType, type StudySession } from "@/lib/api";

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  rarity: string;
  unlockedAt: string | null;
}

// Calculate XP needed for a level
function xpForLevel(level: number): number {
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += 50 * i * (i + 1) / 2;
  }
  return total;
}

function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1);
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [user, sessions] = await Promise.all([
          userAPI.getMe(),
          studySessionsAPI.getRecent(10),
        ]);
        setUserData(user);
        setRecentSessions(sessions);

        // Fetch achievements
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error || "Error loading profile"}</p>
      </div>
    );
  }

  const leagueColors = leagueTierColors[userData.currentLeague] || leagueTierColors.BRONZE;
  const leagueNames: Record<string, string> = {
    BRONZE: "Bronce",
    SILVER: "Plata",
    GOLD: "Oro",
    PLATINUM: "Platino",
    DIAMOND: "Diamante",
    RUBY: "Rubí",
  };

  const formatStudyTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours < 1) return `${minutes}min`;
    return `${hours}h ${minutes % 60}min`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  const displayName = userData.displayName || userData.username || "Usuario";
  const username = userData.username || "usuario";
  const currentLevelXp = xpForLevel(userData.level);
  const nextLevelXp = xpForNextLevel(userData.level);
  const xpProgress = userData.totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  // Calculate stats from sessions
  const totalStudyTime = recentSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalQuestions = recentSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalCorrect = recentSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalSessions = userData._count?.studySessions || recentSessions.length;

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const rarityEmoji: Record<string, string> = {
    COMMON: "🎯",
    RARE: "💎",
    EPIC: "🌟",
    LEGENDARY: "👑",
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
                  {userData.avatarUrl ? (
                    <img src={userData.avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    "🐼"
                  )}
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
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {userData.isPremium && (
                    <Badge variant="premium">
                      <Crown className="h-3 w-3" />
                      PRO
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500">@{username}</p>

                {/* Level progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Nivel {userData.level}</span>
                    <span className="font-medium">{xpProgress} / {xpNeeded} XP</span>
                  </div>
                  <Progress
                    value={(xpProgress / xpNeeded) * 100}
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
                    <span className="text-lg font-bold">{leagueNames[userData.currentLeague]}</span>
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
                  <Star className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(userData.totalXp)}</p>
                  <p className="text-sm text-gray-500">XP Total</p>
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
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatStudyTime(totalStudyTime)}</p>
                  <p className="text-sm text-gray-500">Tiempo estudiando</p>
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
                  <p className="text-2xl font-bold">{avgAccuracy}%</p>
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
                  <p className="text-2xl font-bold">{totalSessions}</p>
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
                  {unlockedAchievements.length}/{achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Completa sesiones para desbloquear logros</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {[...unlockedAchievements, ...lockedAchievements].slice(0, 8).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`relative flex flex-col items-center rounded-xl p-3 transition-all ${
                        achievement.unlockedAt
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "bg-gray-100 opacity-50 dark:bg-gray-800 grayscale"
                      }`}
                      title={achievement.description}
                    >
                      <span className="text-3xl">{rarityEmoji[achievement.rarity] || "🎯"}</span>
                      <span className="mt-1 text-center text-xs font-medium line-clamp-2">
                        {achievement.name}
                      </span>
                      {achievement.unlockedAt && (
                        <Badge variant="success" size="sm" className="absolute -top-1 -right-1">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
              {recentSessions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aún no hay actividad</p>
              ) : (
                <div className="space-y-4">
                  {recentSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded-lg p-2"
                          style={{ backgroundColor: `${session.document.subjectColor}20` }}
                        >
                          <BookOpen className="h-4 w-4" style={{ color: session.document.subjectColor }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {session.mode === "FLASHCARDS" ? "Flashcards" : session.mode === "QUIZ" ? "Quiz" : "V/F"} - {session.document.subjectName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.correctAnswers}/{session.totalQuestions} correctas · {formatTimeAgo(session.completedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="xp" size="sm">
                        +{session.xpEarned} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
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
                  <Flame className={`h-8 w-8 text-orange-500 ${userData.currentStreak > 0 ? "animate-pulse" : ""}`} />
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
              <div className="h-16 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl">🧊</span>
                  <span className="text-4xl font-bold">{userData.streakFreezes}</span>
                </div>
                <p className="mt-1 text-gray-500">Streak Freezes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
