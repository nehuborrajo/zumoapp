import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/courses - Get all courses for current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.container.findMany({
      where: { userId: user.id },
      include: {
        subjects: {
          include: {
            _count: {
              select: { documents: true },
            },
          },
        },
        _count: {
          select: { subjects: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform data to include computed fields
    const coursesWithStats = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      color: course.color,
      icon: course.icon,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      subjectsCount: course._count.subjects,
      documentsCount: course.subjects.reduce((acc, s) => acc + s._count.documents, 0),
      subjects: course.subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        documentsCount: subject._count.documents,
      })),
    }));

    return NextResponse.json(coursesWithStats);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check for duplicate name
    const existing = await prisma.container.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: name.trim(),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "A course with this name already exists" }, { status: 400 });
    }

    const course = await prisma.container.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#6366f1",
        icon: icon || "folder",
      },
      include: {
        _count: {
          select: { subjects: true },
        },
      },
    });

    return NextResponse.json({
      ...course,
      subjectsCount: course._count.subjects,
      documentsCount: 0,
      subjects: [],
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
