import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ documentId: string }> };

// Helper to verify document ownership
async function getDocumentWithAuth(documentId: string, userId: string) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      subject: {
        container: { userId },
      },
    },
    include: {
      subject: {
        include: {
          container: true,
        },
      },
      _count: {
        select: {
          flashcards: true,
          questions: true,
        },
      },
    },
  });
}

// GET /api/documents/[documentId] - Get a single document with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;
    const document = await getDocumentWithAuth(documentId, user.id);

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: document.id,
      title: document.title,
      description: document.description,
      extractedText: document.extractedText,
      processingStatus: document.processingStatus,
      processingError: document.processingError,
      flashcardsGenerated: document.flashcardsGenerated,
      questionsGenerated: document.questionsGenerated,
      flashcardsCount: document._count.flashcards,
      questionsCount: document._count.questions,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      subject: {
        id: document.subject.id,
        name: document.subject.name,
        color: document.subject.color,
      },
      course: {
        id: document.subject.container.id,
        name: document.subject.container.name,
        color: document.subject.container.color,
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/documents/[documentId] - Update a document
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;
    const body = await request.json();
    const { title, description, extractedText, processingStatus } = body;

    // Verify ownership
    const existing = await getDocumentWithAuth(documentId, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (extractedText !== undefined) updateData.extractedText = extractedText;
    if (processingStatus !== undefined) updateData.processingStatus = processingStatus;

    const document = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
      include: {
        subject: {
          include: {
            container: true,
          },
        },
        _count: {
          select: {
            flashcards: true,
            questions: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: document.id,
      title: document.title,
      description: document.description,
      extractedText: document.extractedText,
      processingStatus: document.processingStatus,
      processingError: document.processingError,
      flashcardsGenerated: document.flashcardsGenerated,
      questionsGenerated: document.questionsGenerated,
      flashcardsCount: document._count.flashcards,
      questionsCount: document._count.questions,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
      subject: {
        id: document.subject.id,
        name: document.subject.name,
        color: document.subject.color,
      },
      course: {
        id: document.subject.container.id,
        name: document.subject.container.name,
        color: document.subject.container.color,
      },
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/documents/[documentId] - Delete a document
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    // Verify ownership
    const existing = await getDocumentWithAuth(documentId, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the document (flashcards and questions cascade)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
