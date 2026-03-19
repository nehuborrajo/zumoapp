"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Flame,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { leagueTierColors } from "@/lib/utils";
import { useLeague } from "@/hooks/useLeague";
import { LeagueTier } from "@/lib/api";

const leagueTiers: { name: string; tier: LeagueTier }[] = [
  { name: "Bronce", tier: "BRONZE" },
  { name: "Plata", tier: "SILVER" },
  { name: "Oro", tier: "GOLD" },
  { name: "Platino", tier: "PLATINUM" },
  { name: "Diamante", tier: "DIAMOND" },
  { name: "Rubí", tier: "RUBY" },
];

// Mock friends data (TODO: implement friends system)
const friendsLeaderboard = [
  { rank: 1, name: "Carlos R.", xp: 5240, avatar: "🐺", streak: 15, level: 18 },
  { rank: 2, name: "Tú", xp: 4850, avatar: "🐼", streak: 7, level: 12, isCurrentUser: true },
  { rank: 3, name: "María G.", xp: 4620, avatar: "🦊", streak: 12, level: 15 },
  { rank: 4, name: "Ana M.", xp: 3980, avatar: "🦁", streak: 5, level: 11 },
  { rank: 5, name: "Pedro S.", xp: 3450, avatar: "🐯", streak: 3, level: 10 },
];

// Avatar emojis by position for users without avatar
const avatarEmojis = ["🦊", "🐺", "🦁", "🐯", "🐼", "🐨", "🦈", "🦋", "🐸", "🐰", "🦉", "🐙"];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"league" | "friends">("league");
  const { league, currentUser, participants, zones, loading, error } = useLeague();

  const currentTier = league?.tier || "BRONZE";
  const colors = leagueTierColors[currentTier];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  };

  const getNextTierName = () => {
    const currentIndex = leagueTiers.findIndex((t) => t.tier === currentTier);
    if (currentIndex < leagueTiers.length - 1) {
      return leagueTiers[currentIndex + 1].name;
    }
    return null;
  };

  const getPrevTierName = () => {
    const currentIndex = leagueTiers.findIndex((t) => t.tier === currentTier);
    if (currentIndex > 0) {
      return leagueTiers[currentIndex - 1].name;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium">Error al cargar la liga</p>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Clasificación</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Compite con otros estudiantes y sube de liga
        </p>
      </div>

      {/* Current league card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className={`${colors.bg} border-2 ${colors.border}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${colors.bg} text-4xl`}>
                  🏆
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tu liga actual</p>
                  <h2 className={`text-2xl font-bold ${colors.text}`}>Liga {league?.tierName}</h2>
                  <p className="text-sm text-gray-500">
                    La semana termina en {league?.timeRemaining}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tu posición</p>
                <p className="text-3xl font-bold">#{currentUser?.position || "-"}</p>
                <Badge
                  variant={
                    currentUser?.position && zones
                      ? currentUser.position <= zones.promotionCount
                        ? "success"
                        : currentUser.position >= zones.relegationStart
                        ? "danger"
                        : "default"
                      : "default"
                  }
                  size="sm"
                  className="mt-1"
                >
                  {currentUser?.weeklyXp.toLocaleString() || 0} XP esta semana
                </Badge>
              </div>
            </div>

            {/* League tiers */}
            <div className="mt-6 flex items-center justify-between">
              {leagueTiers.map((tier) => {
                const tierColors = leagueTierColors[tier.tier];
                const isCurrentTier = tier.tier === currentTier;
                return (
                  <div
                    key={tier.tier}
                    className={`flex flex-col items-center ${
                      isCurrentTier ? "scale-110" : "opacity-60"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${tierColors.bg} ${tierColors.border} border-2`}
                    >
                      {isCurrentTier && <Star className={`h-5 w-5 ${tierColors.text}`} />}
                    </div>
                    <span className={`mt-1 text-xs font-medium ${tierColors.text}`}>
                      {tier.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "league" ? "default" : "outline"}
          onClick={() => setActiveTab("league")}
        >
          <Trophy className="h-4 w-4" />
          Liga semanal
        </Button>
        <Button
          variant={activeTab === "friends" ? "default" : "outline"}
          onClick={() => setActiveTab("friends")}
        >
          <Users className="h-4 w-4" />
          Amigos
        </Button>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-0">
          {activeTab === "league" ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Promotion zone indicator */}
              {zones && zones.promotionCount > 0 && (
                <div className="bg-green-50 px-6 py-2 text-center text-sm font-medium text-green-600 dark:bg-green-900/20">
                  <TrendingUp className="mr-1 inline h-4 w-4" />
                  Zona de ascenso (Top {zones.promotionCount})
                </div>
              )}

              {participants.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <Trophy className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                  <p>Aún no hay participantes en esta liga</p>
                  <p className="text-sm">¡Estudia para ser el primero!</p>
                </div>
              ) : (
                participants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center justify-between px-6 py-4 ${
                      participant.isCurrentUser
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : participant.zone === "relegation"
                        ? "bg-red-50/50 dark:bg-red-900/10"
                        : participant.zone === "promotion"
                        ? "bg-green-50/50 dark:bg-green-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex w-8 items-center justify-center">
                        {getRankIcon(participant.position)}
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800">
                        {participant.avatarUrl ? (
                          <img
                            src={participant.avatarUrl}
                            alt={participant.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          avatarEmojis[index % avatarEmojis.length]
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${participant.isCurrentUser ? "text-indigo-600" : ""}`}>
                          {participant.username}
                          {participant.isCurrentUser && (
                            <Badge variant="primary" size="sm" className="ml-2">
                              Tú
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{participant.weeklyXp.toLocaleString()} XP</p>
                      </div>
                      {participant.zone === "promotion" && (
                        <ChevronUp className="h-4 w-4 text-green-500" />
                      )}
                      {participant.zone === "relegation" && (
                        <ChevronDown className="h-4 w-4 text-red-500" />
                      )}
                      {participant.zone === "safe" && (
                        <Minus className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}

              {/* Relegation zone indicator */}
              {zones && participants.length >= 6 && (
                <div className="bg-red-50 px-6 py-2 text-center text-sm font-medium text-red-600 dark:bg-red-900/20">
                  <TrendingDown className="mr-1 inline h-4 w-4" />
                  Zona de descenso (Posición {zones.relegationStart}+)
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {friendsLeaderboard.map((friend, index) => (
                <motion.div
                  key={friend.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between px-6 py-4 ${
                    friend.isCurrentUser ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex w-8 items-center justify-center">
                      {getRankIcon(friend.rank)}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800">
                      {friend.avatar}
                    </div>
                    <div>
                      <p className={`font-semibold ${friend.isCurrentUser ? "text-indigo-600" : ""}`}>
                        {friend.name}
                        {friend.isCurrentUser && (
                          <Badge variant="primary" size="sm" className="ml-2">
                            Tú
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Nivel {friend.level}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {friend.streak} días
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{friend.xp.toLocaleString()} XP</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Ascenso</h3>
                <p className="text-sm text-gray-500">
                  {getNextTierName()
                    ? `Los top ${zones?.promotionCount || 3} suben a Liga ${getNextTierName()}`
                    : "¡Ya estás en la liga más alta!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 dark:bg-red-900/30">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold">Descenso</h3>
                <p className="text-sm text-gray-500">
                  {getPrevTierName()
                    ? `Los últimos 3 bajan a Liga ${getPrevTierName()}`
                    : "¡Ya estás en la liga inicial!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
