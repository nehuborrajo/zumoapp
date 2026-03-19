import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  LEAGUE_SIZE,
  PROMOTION_ZONE,
  RELEGATION_ZONE,
  getWeekBoundaries,
  getTierDisplayName,
  getTimeRemaining,
  getParticipantZone,
} from "@/lib/leagues";

// GET /api/leagues/current - Get current user's league
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { start: weekStart, end: weekEnd } = getWeekBoundaries();

    // Find user's participation for this week
    let participation = await prisma.leagueParticipant.findFirst({
      where: {
        userId: user.id,
        league: {
          weekStartDate: weekStart,
        },
      },
      include: {
        league: true,
      },
    });

    // If user has no participation this week, assign them to a league
    if (!participation) {
      participation = await assignUserToLeague(user.id, user.currentLeague, weekStart, weekEnd);
    }

    // Get all participants in this league, ordered by weeklyXp desc
    const participants = await prisma.leagueParticipant.findMany({
      where: { leagueId: participation.leagueId },
      orderBy: { weeklyXp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Calculate positions and update them
    const participantsWithPosition = participants.map((p, index) => ({
      position: index + 1,
      id: p.id,
      userId: p.user.id,
      username: p.user.displayName || p.user.username,
      avatarUrl: p.user.avatarUrl,
      weeklyXp: p.weeklyXp,
      isCurrentUser: p.userId === user.id,
      zone: getParticipantZone(index + 1, participants.length),
    }));

    // Find current user's position
    const currentUserData = participantsWithPosition.find((p) => p.isCurrentUser);

    // Determine promotion and relegation thresholds based on league size
    const totalParticipants = participants.length;
    const promotionCount = Math.min(PROMOTION_ZONE, Math.floor(totalParticipants / 3));
    const relegationStart = Math.max(
      totalParticipants - Math.min(RELEGATION_ZONE, Math.floor(totalParticipants / 3)) + 1,
      promotionCount + 1
    );

    return NextResponse.json({
      league: {
        id: participation.league.id,
        tier: participation.league.tier,
        tierName: getTierDisplayName(participation.league.tier),
        weekStartDate: participation.league.weekStartDate.toISOString(),
        weekEndDate: participation.league.weekEndDate.toISOString(),
        timeRemaining: getTimeRemaining(participation.league.weekEndDate),
      },
      currentUser: {
        position: currentUserData?.position || 0,
        weeklyXp: currentUserData?.weeklyXp || 0,
      },
      participants: participantsWithPosition,
      zones: {
        promotionCount,
        relegationStart,
      },
    });
  } catch (error) {
    console.error("Error fetching current league:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Assign user to an existing league or create a new one
 */
async function assignUserToLeague(
  userId: string,
  tier: string,
  weekStart: Date,
  weekEnd: Date
) {
  // Try to find an existing league with space
  const existingLeague = await prisma.league.findFirst({
    where: {
      tier: tier as any,
      weekStartDate: weekStart,
    },
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let leagueId: string;

  if (existingLeague && existingLeague._count.participants < LEAGUE_SIZE) {
    leagueId = existingLeague.id;
  } else {
    // Create new league
    const newLeague = await prisma.league.create({
      data: {
        tier: tier as any,
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
      },
    });
    leagueId = newLeague.id;
  }

  // Create participation
  const participation = await prisma.leagueParticipant.create({
    data: {
      leagueId,
      userId,
      weeklyXp: 0,
      position: 0,
    },
    include: {
      league: true,
    },
  });

  return participation;
}
