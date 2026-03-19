import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PROMOTION_ZONE,
  RELEGATION_ZONE,
  getWeekBoundaries,
  getNextTier,
  getPreviousTier,
  getRewardsForPosition,
} from "@/lib/leagues";

// POST /api/cron/process-leagues - Process weekly leagues
// This should be called every Monday at 00:00 UTC by Vercel Cron
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last week's boundaries
    const now = new Date();
    const lastWeekDate = new Date(now);
    lastWeekDate.setUTCDate(lastWeekDate.getUTCDate() - 7);
    const { start: lastWeekStart } = getWeekBoundaries(lastWeekDate);

    // Get all leagues from last week
    const leagues = await prisma.league.findMany({
      where: {
        weekStartDate: lastWeekStart,
      },
      include: {
        participants: {
          orderBy: { weeklyXp: "desc" },
          include: {
            user: {
              select: {
                id: true,
                currentLeague: true,
              },
            },
          },
        },
      },
    });

    let processedLeagues = 0;
    let promotions = 0;
    let relegations = 0;
    let rewardsGiven = 0;

    for (const league of leagues) {
      const totalParticipants = league.participants.length;
      if (totalParticipants === 0) continue;

      // Calculate dynamic zones based on league size
      const promotionCount = Math.min(
        PROMOTION_ZONE,
        Math.max(1, Math.floor(totalParticipants / 3))
      );
      const relegationCount = Math.min(
        RELEGATION_ZONE,
        Math.max(1, Math.floor(totalParticipants / 3))
      );
      const relegationStart = totalParticipants - relegationCount + 1;

      for (let i = 0; i < league.participants.length; i++) {
        const participant = league.participants[i];
        const position = i + 1;

        // Give rewards based on position
        const rewards = getRewardsForPosition(position);
        if (rewards.coins > 0 || rewards.xp > 0) {
          await prisma.user.update({
            where: { id: participant.userId },
            data: {
              coins: { increment: rewards.coins },
              totalXp: { increment: rewards.xp },
            },
          });
          rewardsGiven++;
        }

        // Handle promotion (top positions)
        if (position <= promotionCount) {
          const nextTier = getNextTier(participant.user.currentLeague);
          if (nextTier) {
            await prisma.user.update({
              where: { id: participant.userId },
              data: { currentLeague: nextTier },
            });
            promotions++;
          }
        }
        // Handle relegation (bottom positions)
        else if (position >= relegationStart && totalParticipants >= 6) {
          // Only relegate if league has at least 6 participants
          const prevTier = getPreviousTier(participant.user.currentLeague);
          if (prevTier) {
            await prisma.user.update({
              where: { id: participant.userId },
              data: { currentLeague: prevTier },
            });
            relegations++;
          }
        }
      }

      processedLeagues++;
    }

    return NextResponse.json({
      success: true,
      processed: {
        leagues: processedLeagues,
        promotions,
        relegations,
        rewardsGiven,
      },
      weekProcessed: lastWeekStart.toISOString(),
    });
  } catch (error) {
    console.error("Error processing leagues:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/cron/process-leagues - Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    description: "Weekly league processing endpoint",
    schedule: "Every Monday at 00:00 UTC",
  });
}
