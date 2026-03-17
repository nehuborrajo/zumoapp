import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ courseId: string }> };

// GET /api/courses/[courseId]/subjects - Get all subjects in a course
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    // Verify course ownership
    const course = await prisma.container.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const subjects = await prisma.subject.findMany({
      where: { containerId: courseId },
      include: {
        _count: {
          select: { documents: true },
        },
        documents: {
          include: {
            _count: {
              select: { flashcards: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const subjectsWithStats = subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      icon: subject.icon,
      documentsCount: subject._count.documents,
      flashcardsCount: subject.documents.reduce((acc, d) => acc + d._count.flashcards, 0),
    }));

    return NextResponse.json(subjectsWithStats);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/courses/[courseId]/subjects - Create a new subject
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await request.json();
    const { name, color, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.container.findFirst({
      where: { id: courseId, userId: user.id },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check for duplicate name in this course
    const existing = await prisma.subject.findUnique({
      where: {
        containerId_name: {
          containerId: courseId,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A subject with this name already exists in this course" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        containerId: courseId,
        name: name.trim(),
        color: color || "#6366f1",
        icon: icon || "book",
      },
    });

    return NextResponse.json({
      ...subject,
      documentsCount: 0,
      flashcardsCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
