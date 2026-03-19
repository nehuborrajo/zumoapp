import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getWeekBoundaries } from "@/lib/leagues";

// Calculate level from total XP
function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpForNextLevel = 100;
  let accumulatedXp = 0;

  while (totalXp >= accumulatedXp + xpForNextLevel) {
    accumulatedXp += xpForNextLevel;
    level++;
    xpForNextLevel = (50 * level * (level + 1)) / 2;
  }

  return level;
}

// Check if dates are consecutive or same day
function isStreakDay(
  lastDate: Date | null,
  currentDate: Date
): "same" | "consecutive" | "broken" {
  if (!lastDate) return "consecutive";

  const last = new Date(lastDate);
  const current = new Date(currentDate);

  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - last.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "same";
  if (diffDays === 1) return "consecutive";
  return "broken";
}

// Calculate XP for tutor session
function calculateTutorXp(messageCount: number, durationSeconds: number): number {
  // Minimum 2 minutes (120 seconds) to get XP
  if (durationSeconds < 120) {
    return 0;
  }

  let xpEarned = 10; // Base XP

  // Per message (user messages): 5 XP each, max 50 XP
  xpEarned += Math.min(messageCount * 5, 50);

  // Time bonus
  if (durationSeconds > 300) xpEarned += 10; // >5 min
  if (durationSeconds > 600) xpEarned += 10; // >10 min

  // Cap at 100 XP per session
  return Math.min(xpEarned, 100);
}

// Calculate coins bonus based on engagement
function calculateCoinsBonus(messageCount: number, durationSeconds: number): number {
  if (durationSeconds < 120 || messageCount < 2) {
    return 0;
  }

  let coins = 0;

  // Engagement bonus
  if (messageCount >= 10) coins += 10;
  else if (messageCount >= 5) coins += 5;

  // Time bonus
  if (durationSeconds >= 600) coins += 10; // 10+ minutes
  else if (durationSeconds >= 300) coins += 5; // 5+ minutes

  return coins;
}

// Update weekly XP in the user's league
async function updateLeagueXp(userId: string, xpEarned: number) {
  if (xpEarned <= 0) return;

  try {
    const { start: weekStart } = getWeekBoundaries();

    const participation = await prisma.leagueParticipant.findFirst({
      where: {
        userId,
        league: {
          weekStartDate: weekStart,
        },
      },
    });

    if (participation) {
      await prisma.leagueParticipant.update({
        where: { id: participation.id },
        data: {
          weeklyXp: { increment: xpEarned },
        },
      });
    }
  } catch (error) {
    console.error("Error updating league XP:", error);
  }
}

// Check and unlock achievements
async function checkAndUnlockAchievements(
  userId: string,
  stats: {
    totalXp: number;
    currentStreak: number;
    totalSessions: number;
  }
) {
  const unlockedAchievements: Array<{
    code: string;
    name: string;
    description: string;
    rewardXp: number;
    rewardCoins: number;
    rarity: string;
  }> = [];

  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    const req = achievement.requirement as { type: string; value: number };
    let shouldUnlock = false;

    switch (req.type) {
      case "first_session":
        shouldUnlock = stats.totalSessions >= 1;
        break;
      case "sessions":
        shouldUnlock = stats.totalSessions >= req.value;
        break;
      case "streak":
        shouldUnlock = stats.currentStreak >= req.value;
        break;
      case "xp":
        shouldUnlock = stats.totalXp >= req.value;
        break;
    }

    if (shouldUnlock) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      if (achievement.rewardXp > 0 || achievement.rewardCoins > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalXp: { increment: achievement.rewardXp },
            coins: { increment: achievement.rewardCoins },
          },
        });
      }

      unlockedAchievements.push({
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        rewardXp: achievement.rewardXp,
        rewardCoins: achievement.rewardCoins,
        rarity: achievement.rarity,
      });
    }
  }

  return unlockedAchievements;
}

// POST /api/tutor/session - Save tutor session and calculate XP
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!user.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documentId, subjectId, messageCount, durationSeconds } = body as {
      documentId?: string;
      subjectId?: string;
      messageCount: number;
      durationSeconds: number;
    };

    if (typeof messageCount !== "number" || typeof durationSeconds !== "number") {
      return NextResponse.json(
        { error: "messageCount and durationSeconds required" },
        { status: 400 }
      );
    }

    // Get a document ID for the session record
    let sessionDocumentId: string;

    if (documentId) {
      const doc = await prisma.document.findFirst({
        where: {
          id: documentId,
          subject: { container: { userId: user.id } },
        },
      });
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      sessionDocumentId = documentId;
    } else if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: {
          id: subjectId,
          container: { userId: user.id },
        },
        include: {
          documents: {
            take: 1,
            select: { id: true },
          },
        },
      });

      if (!subject || subject.documents.length === 0) {
        return NextResponse.json(
          { error: "Subject not found or no documents" },
          { status: 404 }
        );
      }
      sessionDocumentId = subject.documents[0].id;
    } else {
      return NextResponse.json(
        { error: "documentId or subjectId required" },
        { status: 400 }
      );
    }

    // Calculate XP and coins
    const xpEarned = calculateTutorXp(messageCount, durationSeconds);
    const coinsEarned = calculateCoinsBonus(messageCount, durationSeconds);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        totalXp: true,
        coins: true,
        currentStreak: true,
        longestStreak: true,
        lastStudyDate: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate streak
    const now = new Date();
    const streakStatus = isStreakDay(currentUser.lastStudyDate, now);

    let newStreak = currentUser.currentStreak;
    let newLongestStreak = currentUser.longestStreak;
    let streakIncreased = false;

    if (streakStatus === "consecutive") {
      newStreak = currentUser.currentStreak + 1;
      streakIncreased = true;
      if (newStreak > newLongestStreak) {
        newLongestStreak = newStreak;
      }
    } else if (streakStatus === "broken") {
      newStreak = 1;
      streakIncreased = currentUser.currentStreak === 0;
    }

    // Calculate level
    const newTotalXp = currentUser.totalXp + xpEarned;
    const newLevel = calculateLevel(newTotalXp);
    const oldLevel = calculateLevel(currentUser.totalXp);
    const leveledUp = newLevel > oldLevel;

    // Create session and update user
    const [session] = await prisma.$transaction([
      prisma.studySession.create({
        data: {
          userId: user.id,
          documentId: sessionDocumentId,
          mode: "TUTOR",
          correctAnswers: messageCount, // Store message count as "correct answers" for tutor
          totalQuestions: messageCount, // Same for total
          xpEarned,
          coinsEarned,
          durationSeconds: durationSeconds || 0,
          completedAt: now,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalXp: newTotalXp,
          coins: { increment: coinsEarned },
          level: newLevel,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          lastStudyDate: now,
        },
      }),
    ]);

    // Update league XP
    await updateLeagueXp(user.id, xpEarned);

    // Check achievements
    const totalSessions = await prisma.studySession.count({
      where: { userId: user.id },
    });

    const newAchievements = await checkAndUnlockAchievements(user.id, {
      totalXp: newTotalXp,
      currentStreak: newStreak,
      totalSessions,
    });

    return NextResponse.json({
      session: {
        id: session.id,
        xpEarned,
        coinsEarned,
        messageCount,
        durationSeconds,
      },
      user: {
        totalXp: newTotalXp,
        level: newLevel,
        leveledUp,
        currentStreak: newStreak,
        streakIncreased,
      },
      achievements: newAchievements,
    });
  } catch (error) {
    console.error("Error creating tutor session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
