import { LeagueTier } from "@prisma/client";

// Constants
export const LEAGUE_SIZE = 30;
export const PROMOTION_ZONE = 3;
export const RELEGATION_ZONE = 3;

// Rewards by position
export const LEAGUE_REWARDS: Record<number | "default", { coins: number; xp: number }> = {
  1: { coins: 100, xp: 500 },
  2: { coins: 75, xp: 350 },
  3: { coins: 50, xp: 200 },
  4: { coins: 25, xp: 100 },
  5: { coins: 20, xp: 75 },
  default: { coins: 10, xp: 25 },
};

// Tier progression order
export const TIER_ORDER: LeagueTier[] = [
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "DIAMOND",
  "RUBY",
];

// Display names for tiers
const TIER_DISPLAY_NAMES: Record<LeagueTier, string> = {
  BRONZE: "Bronce",
  SILVER: "Plata",
  GOLD: "Oro",
  PLATINUM: "Platino",
  DIAMOND: "Diamante",
  RUBY: "Rubí",
};

/**
 * Get the next tier (for promotion)
 * Returns null if already at RUBY
 */
export function getNextTier(tier: LeagueTier): LeagueTier | null {
  const index = TIER_ORDER.indexOf(tier);
  if (index === -1 || index === TIER_ORDER.length - 1) return null;
  return TIER_ORDER[index + 1];
}

/**
 * Get the previous tier (for relegation)
 * Returns null if already at BRONZE
 */
export function getPreviousTier(tier: LeagueTier): LeagueTier | null {
  const index = TIER_ORDER.indexOf(tier);
  if (index <= 0) return null;
  return TIER_ORDER[index - 1];
}

/**
 * Get the week boundaries (Monday 00:00 to Sunday 23:59:59)
 * Uses UTC for consistency
 */
export function getWeekBoundaries(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const d = new Date(date);

  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = d.getUTCDay();

  // Calculate days since Monday (if Sunday, it's 6 days ago)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Set to Monday 00:00:00 UTC
  const start = new Date(d);
  start.setUTCDate(d.getUTCDate() - daysSinceMonday);
  start.setUTCHours(0, 0, 0, 0);

  // Set to Sunday 23:59:59.999 UTC
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get display name for a tier
 */
export function getTierDisplayName(tier: LeagueTier): string {
  return TIER_DISPLAY_NAMES[tier] || tier;
}

/**
 * Get rewards for a position
 */
export function getRewardsForPosition(position: number): { coins: number; xp: number } {
  return LEAGUE_REWARDS[position as keyof typeof LEAGUE_REWARDS] || LEAGUE_REWARDS.default;
}

/**
 * Calculate time remaining until end of week
 */
export function getTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return "Terminada";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} día${days !== 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `${hours} hora${hours !== 1 ? "s" : ""}`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} minuto${minutes !== 1 ? "s" : ""}`;
}

/**
 * Determine the zone for a participant based on position
 */
export function getParticipantZone(
  position: number,
  totalParticipants: number
): "promotion" | "safe" | "relegation" {
  // Adjust zones for small leagues
  const promotionCount = Math.min(PROMOTION_ZONE, Math.floor(totalParticipants / 3));
  const relegationStart = Math.max(
    totalParticipants - Math.min(RELEGATION_ZONE, Math.floor(totalParticipants / 3)) + 1,
    promotionCount + 1
  );

  if (position <= promotionCount) return "promotion";
  if (position >= relegationStart) return "relegation";
  return "safe";
}
