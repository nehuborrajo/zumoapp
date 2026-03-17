import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// XP per correct answer by mode
const XP_RATES = {
  FLASHCARDS: 10,
  QUIZ: 15,
  TRUE_FALSE: 5,
  TUTOR: 20,
  EXAM_SIMULATION: 25,
};

// Coins bonus based on accuracy
function calculateCoinsBonus(accuracy: number, totalQuestions: number): number {
  if (totalQuestions < 5) return 0;
  if (accuracy >= 100) return 25;
  if (accuracy >= 90) return 15;
  if (accuracy >= 80) return 10;
  if (accuracy >= 70) return 5;
  return 0;
}

// Calculate level from total XP
function calculateLevel(totalXp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 450 XP, etc.
  // Formula: XP needed for level N = 50 * N * (N - 1)
  let level = 1;
  let xpForNextLevel = 100;
  let accumulatedXp = 0;

  while (totalXp >= accumulatedXp + xpForNextLevel) {
    accumulatedXp += xpForNextLevel;
    level++;
    xpForNextLevel = 50 * level * (level + 1) / 2;
  }

  return level;
}

// Check if dates are consecutive or same day
function isStreakDay(lastDate: Date | null, currentDate: Date): "same" | "consecutive" | "broken" {
  if (!lastDate) return "consecutive"; // First study ever

  const last = new Date(lastDate);
  const current = new Date(currentDate);

  // Reset to start of day
  last.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffTime = current.getTime() - last.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "same";
  if (diffDays === 1) return "consecutive";
  return "broken";
}

// POST /api/study-sessions - Create a study session and update user stats
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subjectId,
      documentId: directDocumentId,
      documentIds, // Array of document IDs for multi-document study
      mode,
      correctAnswers,
      totalQuestions,
      durationSeconds,
    } = body;

    // Validate mode
    const validModes = ["FLASHCARDS", "QUIZ", "TRUE_FALSE", "TUTOR", "EXAM_SIMULATION"];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: "Invalid study mode" }, { status: 400 });
    }

    let documentId: string;

    // Priority: directDocumentId > documentIds[0] > subjectId lookup
    if (directDocumentId) {
      // Verify document ownership
      const doc = await prisma.document.findFirst({
        where: {
          id: directDocumentId,
          subject: { container: { userId: user.id } },
        },
      });
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      documentId = directDocumentId;
    } else if (documentIds && documentIds.length > 0) {
      // Use first document from array, verify ownership
      const doc = await prisma.document.findFirst({
        where: {
          id: documentIds[0],
          subject: { container: { userId: user.id } },
        },
      });
      if (!doc) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }
      documentId = documentIds[0];
    } else if (subjectId) {
      // Verify subject ownership and get a document from it
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
        return NextResponse.json({ error: "Subject not found or no documents" }, { status: 404 });
      }
      documentId = subject.documents[0].id;
    } else {
      return NextResponse.json({ error: "subjectId or documentId required" }, { status: 400 });
    }

    // Calculate XP and coins
    const xpPerCorrect = XP_RATES[mode as keyof typeof XP_RATES] || 10;
    const xpEarned = correctAnswers * xpPerCorrect;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const coinsEarned = calculateCoinsBonus(accuracy, totalQuestions);

    // Get current user data for streak calculation
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

    // Calculate new streak
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
      newStreak = 1; // Start new streak
      streakIncreased = currentUser.currentStreak === 0;
    }
    // If "same" day, streak stays the same

    // Calculate new total XP and level
    const newTotalXp = currentUser.totalXp + xpEarned;
    const newLevel = calculateLevel(newTotalXp);
    const oldLevel = calculateLevel(currentUser.totalXp);
    const leveledUp = newLevel > oldLevel;

    // Create session and update user in a transaction
    const [session] = await prisma.$transaction([
      // Create study session
      prisma.studySession.create({
        data: {
          userId: user.id,
          documentId,
          mode: mode as any,
          correctAnswers,
          totalQuestions,
          xpEarned,
          coinsEarned,
          durationSeconds: durationSeconds || 0,
          completedAt: now,
        },
      }),
      // Update user stats
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

    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievements(user.id, {
      totalXp: newTotalXp,
      currentStreak: newStreak,
      totalSessions: await prisma.studySession.count({ where: { userId: user.id } }),
      accuracy,
    });

    return NextResponse.json({
      session: {
        id: session.id,
        xpEarned,
        coinsEarned,
        accuracy: Math.round(accuracy),
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
    console.error("Error creating study session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Check and unlock achievements
async function checkAndUnlockAchievements(
  userId: string,
  stats: {
    totalXp: number;
    currentStreak: number;
    totalSessions: number;
    accuracy: number;
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

  // Get all achievements and user's unlocked ones
  const [allAchievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

  for (const achievement of allAchievements) {
    // Skip if already unlocked
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
      case "perfect_session":
        shouldUnlock = stats.accuracy === 100;
        break;
    }

    if (shouldUnlock) {
      // Unlock achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Grant rewards
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

// GET /api/study-sessions - Get user's study sessions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: "desc" },
      take: limit,
      include: {
        document: {
          select: {
            title: true,
            subject: {
              select: {
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        mode: s.mode,
        correctAnswers: s.correctAnswers,
        totalQuestions: s.totalQuestions,
        xpEarned: s.xpEarned,
        coinsEarned: s.coinsEarned,
        durationSeconds: s.durationSeconds,
        completedAt: s.completedAt?.toISOString(),
        document: {
          title: s.document.title,
          subjectName: s.document.subject.name,
          subjectColor: s.document.subject.color,
        },
      }))
    );
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
