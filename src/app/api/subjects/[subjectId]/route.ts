import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ subjectId: string }> };

// Helper to verify subject ownership
async function verifySubjectOwnership(subjectId: string, userId: string) {
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId },
    include: {
      container: {
        select: { userId: true },
      },
    },
  });

  if (!subject || subject.container.userId !== userId) {
    return null;
  }

  return subject;
}

// GET /api/subjects/[subjectId] - Get a specific subject
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await params;

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId },
      include: {
        container: {
          select: { userId: true, name: true },
        },
        documents: {
          include: {
            _count: {
              select: { flashcards: true, questions: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!subject || subject.container.userId !== user.id) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      courseName: subject.container.name,
      documentsCount: subject._count.documents,
      flashcardsCount: subject.documents.reduce((acc, d) => acc + d._count.flashcards, 0),
      documents: subject.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        processingStatus: doc.processingStatus,
        flashcardsCount: doc._count.flashcards,
        questionsCount: doc._count.questions,
        createdAt: doc.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/subjects/[subjectId] - Update a subject
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await params;
    const body = await request.json();
    const { name, color, icon } = body;

    const existing = await verifySubjectOwnership(subjectId, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check for duplicate name if changing
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.subject.findUnique({
        where: {
          containerId_name: {
            containerId: existing.containerId,
            name: name.trim(),
          },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: "A subject with this name already exists in this course" }, { status: 400 });
      }
    }

    const subject = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/subjects/[subjectId] - Delete a subject
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await params;

    const existing = await verifySubjectOwnership(subjectId, user.id);
    if (!existing) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
