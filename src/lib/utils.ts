import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number with K, M suffixes
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

// Calculate level from XP (simple formula: level = floor(sqrt(xp / 100)) + 1)
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Calculate XP needed for next level
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

// Calculate progress percentage to next level
export function levelProgress(xp: number): number {
  const level = calculateLevel(xp);
  const currentLevelXp = (level - 1) * (level - 1) * 100;
  const nextLevelXp = level * level * 100;
  const progressXp = xp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  return Math.min((progressXp / neededXp) * 100, 100);
}

// Format duration in seconds to human readable
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

// Get streak message based on streak count
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak < 7) return `${streak} days! You're building a habit!`;
  if (streak < 30) return `${streak} days! You're on fire!`;
  if (streak < 100) return `${streak} days! Incredible dedication!`;
  return `${streak} days! You're a legend!`;
}

// League tier colors
export const leagueTierColors: Record<string, { bg: string; text: string; border: string }> = {
  BRONZE: { bg: "bg-amber-900/20", text: "text-amber-700", border: "border-amber-700" },
  SILVER: { bg: "bg-gray-300/20", text: "text-gray-500", border: "border-gray-400" },
  GOLD: { bg: "bg-yellow-400/20", text: "text-yellow-600", border: "border-yellow-500" },
  PLATINUM: { bg: "bg-cyan-400/20", text: "text-cyan-600", border: "border-cyan-500" },
  DIAMOND: { bg: "bg-blue-400/20", text: "text-blue-500", border: "border-blue-400" },
  RUBY: { bg: "bg-red-500/20", text: "text-red-500", border: "border-red-500" },
};
