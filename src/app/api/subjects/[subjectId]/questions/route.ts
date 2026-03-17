import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ subjectId: string }> };

// GET /api/subjects/[subjectId]/questions - Get all questions for a subject
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

    const questions = await prisma.question.findMany({
      where: {
        documentId: { in: documentIds },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        correctAnswer: q.correctAnswer,
        options: q.options,
        explanation: q.explanation,
        createdAt: q.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
