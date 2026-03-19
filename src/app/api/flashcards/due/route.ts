import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get flashcards due for review
// Query params:
//   - subjectId: get due flashcards for a specific subject
//   - documentIds: comma-separated list of document IDs
//   - limit: max number of flashcards to return (default 20)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const documentIdsParam = searchParams.get("documentIds");
    const limitParam = searchParams.get("limit");

    const limit = limitParam ? parseInt(limitParam, 10) : 20;
    const documentIds = documentIdsParam?.split(",").filter(Boolean);

    // Build the where clause
    const now = new Date();

    // Base where clause - flashcards that are due
    const whereClause: {
      document: {
        subjectId?: string;
        id?: { in: string[] };
        subject: {
          container: {
            userId: string;
          };
        };
      };
      OR: Array<{ nextReviewAt: null } | { nextReviewAt: { lte: Date } }>;
    } = {
      document: {
        subject: {
          container: {
            userId: user.id,
          },
        },
      },
      OR: [
        { nextReviewAt: null }, // Never reviewed (new cards)
        { nextReviewAt: { lte: now } }, // Due for review
      ],
    };

    // Add subject or document filter
    if (subjectId) {
      whereClause.document.subjectId = subjectId;
    } else if (documentIds && documentIds.length > 0) {
      whereClause.document.id = { in: documentIds };
    }

    // Fetch due flashcards
    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      orderBy: [
        { nextReviewAt: "asc" }, // Most overdue first (nulls first in Prisma)
        { repetitions: "asc" }, // New cards (0 reps) before reviewed cards
        { createdAt: "asc" }, // Oldest first among same priority
      ],
      take: limit,
      select: {
        id: true,
        front: true,
        back: true,
        difficulty: true,
        easeFactor: true,
        interval: true,
        repetitions: true,
        nextReviewAt: true,
        createdAt: true,
        documentId: true,
      },
    });

    // Also get count of total due cards (for UI display)
    const totalDue = await prisma.flashcard.count({
      where: whereClause,
    });

    return NextResponse.json({
      flashcards,
      totalDue,
      limit,
      hasMore: totalDue > limit,
    });
  } catch (error) {
    console.error("Error fetching due flashcards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
