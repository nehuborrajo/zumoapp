import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ courseId: string }> };

// GET /api/courses/[courseId] - Get a specific course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const course = await prisma.container.findFirst({
      where: {
        id: courseId,
        userId: user.id,
      },
      include: {
        subjects: {
          include: {
            documents: {
              include: {
                _count: {
                  select: { flashcards: true, questions: true },
                },
              },
            },
            _count: {
              select: { documents: true },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Transform data
    const courseWithStats = {
      id: course.id,
      name: course.name,
      description: course.description,
      color: course.color,
      icon: course.icon,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      subjectsCount: course.subjects.length,
      documentsCount: course.subjects.reduce((acc, s) => acc + s.documents.length, 0),
      flashcardsCount: course.subjects.reduce(
        (acc, s) => acc + s.documents.reduce((dAcc, d) => dAcc + d._count.flashcards, 0),
        0
      ),
      subjects: course.subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        icon: subject.icon,
        documentsCount: subject._count.documents,
        flashcardsCount: subject.documents.reduce((acc, d) => acc + d._count.flashcards, 0),
        documents: subject.documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          originalFileUrl: doc.originalFileUrl,
          processingStatus: doc.processingStatus,
          flashcardsCount: doc._count.flashcards,
          questionsCount: doc._count.questions,
          flashcardsGenerated: doc.flashcardsGenerated,
          questionsGenerated: doc.questionsGenerated,
          createdAt: doc.createdAt,
        })),
      })),
    };

    return NextResponse.json(courseWithStats);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/courses/[courseId] - Update a course
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { name, description, color, icon } = body;

    // Verify ownership
    const existing = await prisma.container.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check for duplicate name if changing
    if (name && name.trim() !== existing.name) {
      const duplicate = await prisma.container.findUnique({
        where: {
          userId_name: {
            userId: user.id,
            name: name.trim(),
          },
        },
      });
      if (duplicate) {
        return NextResponse.json({ error: "A course with this name already exists" }, { status: 400 });
      }
    }

    const course = await prisma.container.update({
      where: { id: courseId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/courses/[courseId] - Delete a course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    // Verify ownership
    const existing = await prisma.container.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Delete cascade is handled by Prisma schema
    await prisma.container.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
