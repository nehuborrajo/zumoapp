import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ subjectId: string }> };

// GET /api/subjects/[subjectId]/documents - Get all documents in a subject
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
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const documents = await prisma.document.findMany({
      where: { subjectId },
      include: {
        _count: {
          select: {
            flashcards: true,
            questions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const documentsWithStats = documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: doc.description,
      processingStatus: doc.processingStatus,
      flashcardsGenerated: doc.flashcardsGenerated,
      questionsGenerated: doc.questionsGenerated,
      flashcardsCount: doc._count.flashcards,
      questionsCount: doc._count.questions,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));

    return NextResponse.json(documentsWithStats);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/subjects/[subjectId]/documents - Create a new document
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await params;
    const body = await request.json();
    const { title, description, extractedText, originalFileUrl } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Verify subject ownership through container
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        container: { userId: user.id },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Determine processing status:
    // - READY if we have extracted text
    // - PROCESSING if we have a file URL but no text (PDF needs OCR)
    // - PENDING otherwise
    let processingStatus: "READY" | "PROCESSING" | "PENDING" = "PENDING";
    if (extractedText) {
      processingStatus = "READY";
    } else if (originalFileUrl) {
      processingStatus = "PROCESSING"; // PDF needs text extraction
    }

    const document = await prisma.document.create({
      data: {
        subjectId,
        title: title.trim(),
        description: description?.trim() || null,
        extractedText: extractedText || null,
        originalFileUrl: originalFileUrl || null,
        processingStatus,
      },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      description: document.description,
      processingStatus: document.processingStatus,
      flashcardsGenerated: document.flashcardsGenerated,
      questionsGenerated: document.questionsGenerated,
      flashcardsCount: 0,
      questionsCount: 0,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
