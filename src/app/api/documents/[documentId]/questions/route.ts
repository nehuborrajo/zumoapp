import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ documentId: string }> };

// GET /api/documents/[documentId]/questions - Get all questions for a document
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

    const questions = await prisma.question.findMany({
      where: { documentId },
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
