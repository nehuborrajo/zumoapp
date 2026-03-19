import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculateSM2 } from "@/lib/sm2";

interface RouteParams {
  params: Promise<{ flashcardId: string }>;
}

// GET - Get a single flashcard
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;

    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        document: {
          include: {
            subject: {
              include: {
                container: true,
              },
            },
          },
        },
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    // Verify ownership
    if (flashcard.document.subject.container.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error fetching flashcard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update flashcard SM-2 data after user response
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;
    const body = await request.json();
    const { quality } = body;

    // Validate quality is a number between 0 and 5
    if (typeof quality !== "number" || quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be a number between 0 and 5" },
        { status: 400 }
      );
    }

    // Fetch the flashcard with ownership verification
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
      include: {
        document: {
          include: {
            subject: {
              include: {
                container: true,
              },
            },
          },
        },
      },
    });

    if (!flashcard) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    // Verify ownership
    if (flashcard.document.subject.container.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate new SM-2 values
    const sm2Result = calculateSM2({
      quality,
      easeFactor: flashcard.easeFactor,
      interval: flashcard.interval,
      repetitions: flashcard.repetitions,
    });

    // Update the flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewAt: sm2Result.nextReviewAt,
      },
    });

    return NextResponse.json({
      success: true,
      flashcard: {
        id: updatedFlashcard.id,
        easeFactor: updatedFlashcard.easeFactor,
        interval: updatedFlashcard.interval,
        repetitions: updatedFlashcard.repetitions,
        nextReviewAt: updatedFlashcard.nextReviewAt,
      },
    });
  } catch (error) {
    console.error("Error updating flashcard SM-2:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
