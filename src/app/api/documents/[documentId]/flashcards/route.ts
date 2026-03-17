import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ documentId: string }> };

// GET /api/documents/[documentId]/flashcards - Get all flashcards for a document
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        subject: {
          container: { userId: user.id },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { documentId },
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
