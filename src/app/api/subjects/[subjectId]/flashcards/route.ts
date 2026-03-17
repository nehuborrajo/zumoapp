import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ subjectId: string }> };

// GET /api/subjects/[subjectId]/flashcards - Get all flashcards for a subject
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await params;

    // Verify subject ownership through container
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        container: { userId: user.id },
      },
      include: {
        documents: {
          select: { id: true },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const documentIds = subject.documents.map((d) => d.id);

    const flashcards = await prisma.flashcard.findMany({
      where: {
        documentId: { in: documentIds },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      flashcards.map((fc) => ({
        id: fc.id,
        front: fc.front,
        back: fc.back,
        difficulty: fc.difficulty,
        easeFactor: fc.easeFactor,
        interval: fc.interval,
        repetitions: fc.repetitions,
        nextReviewAt: fc.nextReviewAt?.toISOString() || null,
        createdAt: fc.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
