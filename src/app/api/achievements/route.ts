import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/achievements - Get all achievements with user's unlock status
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all achievements
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { rarity: "asc" },
        { code: "asc" },
      ],
    });

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    return NextResponse.json(
      achievements.map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        rarity: a.rarity,
        rewardXp: a.rewardXp,
        rewardCoins: a.rewardCoins,
        unlockedAt: unlockedMap.get(a.id)?.toISOString() || null,
      }))
    );
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
