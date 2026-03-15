"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Card, CardContent, Badge, Progress } from "@/components/ui";
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
} from "lucide-react";
import { leagueTierColors } from "@/lib/utils";

// Mock leaderboard data
const leagueData = {
  tier: "GOLD",
  name: "Liga Oro",
  weekEndsIn: "3 días",
  participants: [
    { rank: 1, name: "María G.", xp: 2450, avatar: "🦊", change: "up", isCurrentUser: false },
    { rank: 2, name: "Carlos R.", xp: 2380, avatar: "🐺", change: "up", isCurrentUser: false },
    { rank: 3, name: "Ana M.", xp: 2210, avatar: "🦁", change: "same", isCurrentUser: false },
    { rank: 4, name: "Pedro S.", xp: 2100, avatar: "🐯", change: "down", isCurrentUser: false },
    { rank: 5, name: "Tú", xp: 1980, avatar: "🐼", change: "up", isCurrentUser: true },
    { rank: 6, name: "Laura P.", xp: 1850, avatar: "🐨", change: "down", isCurrentUser: false },
    { rank: 7, name: "Diego L.", xp: 1720, avatar: "🦈", change: "same", isCurrentUser: false },
    { rank: 8, name: "Sofía T.", xp: 1650, avatar: "🦋", change: "up", isCurrentUser: false },
    { rank: 9, name: "Javier M.", xp: 1580, avatar: "🐸", change: "down", isCurrentUser: false },
    { rank: 10, name: "Elena R.", xp: 1490, avatar: "🐰", change: "same", isCurrentUser: false },
  ],
  promotionZone: 3,
  relegationZone: 8,
};

const friendsLeaderboard = [
  { rank: 1, name: "Carlos R.", xp: 5240, avatar: "🐺", streak: 15, level: 18 },
  { rank: 2, name: "Tú", xp: 4850, avatar: "🐼", streak: 7, level: 12, isCurrentUser: true },
  { rank: 3, name: "María G.", xp: 4620, avatar: "🦊", streak: 12, level: 15 },
  { rank: 4, name: "Ana M.", xp: 3980, avatar: "🦁", streak: 5, level: 11 },
  { rank: 5, name: "Pedro S.", xp: 3450, avatar: "🐯", streak: 3, level: 10 },
];

const leagueTiers = [
  { name: "Bronce", tier: "BRONZE", minXp: 0 },
  { name: "Plata", tier: "SILVER", minXp: 500 },
  { name: "Oro", tier: "GOLD", minXp: 1500 },
  { name: "Platino", tier: "PLATINUM", minXp: 3000 },
  { name: "Diamante", tier: "DIAMOND", minXp: 5000 },
  { name: "Rubí", tier: "RUBY", minXp: 10000 },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"league" | "friends">("league");
  const colors = leagueTierColors[leagueData.tier];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  };

  const getChangeIcon = (change: string) => {
    if (change === "up") return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (change === "down") return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

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
                  <h2 className={`text-2xl font-bold ${colors.text}`}>{leagueData.name}</h2>
                  <p className="text-sm text-gray-500">La semana termina en {leagueData.weekEndsIn}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tu posición</p>
                <p className="text-3xl font-bold">#5</p>
                <Badge variant="success" size="sm" className="mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2 posiciones
                </Badge>
              </div>
            </div>

            {/* League tiers */}
            <div className="mt-6 flex items-center justify-between">
              {leagueTiers.map((tier, index) => {
                const tierColors = leagueTierColors[tier.tier];
                const isCurrentTier = tier.tier === leagueData.tier;
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
              <div className="bg-green-50 px-6 py-2 text-center text-sm font-medium text-green-600 dark:bg-green-900/20">
                <TrendingUp className="mr-1 inline h-4 w-4" />
                Zona de ascenso (Top {leagueData.promotionZone})
              </div>

              {leagueData.participants.map((participant, index) => (
                <motion.div
                  key={participant.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between px-6 py-4 ${
                    participant.isCurrentUser
                      ? "bg-indigo-50 dark:bg-indigo-900/20"
                      : index >= leagueData.relegationZone - 1
                      ? "bg-red-50/50 dark:bg-red-900/10"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex w-8 items-center justify-center">
                      {getRankIcon(participant.rank)}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800">
                      {participant.avatar}
                    </div>
                    <div>
                      <p className={`font-semibold ${participant.isCurrentUser ? "text-indigo-600" : ""}`}>
                        {participant.name}
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
                      <p className="font-bold">{participant.xp.toLocaleString()} XP</p>
                    </div>
                    {getChangeIcon(participant.change)}
                  </div>
                </motion.div>
              ))}

              {/* Relegation zone indicator */}
              <div className="bg-red-50 px-6 py-2 text-center text-sm font-medium text-red-600 dark:bg-red-900/20">
                <TrendingDown className="mr-1 inline h-4 w-4" />
                Zona de descenso (Posición {leagueData.relegationZone}+)
              </div>
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
                  Los top 3 suben a Liga Platino
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
                  Los últimos 3 bajan a Liga Plata
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
