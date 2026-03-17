import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateFlashcards, generateQuestions } from "@/lib/openai";

type RouteParams = { params: Promise<{ documentId: string }> };

// POST /api/documents/[documentId]/generate - Generate flashcards and questions with AI
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;
    const body = await request.json();
    const {
      generateFlashcardsFlag = true,
      generateQuestionsFlag = true,
      flashcardsCount = 10,
      questionsCount = 5,
    } = body;

    // Get document and verify ownership
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

    if (!document.extractedText) {
      return NextResponse.json(
        { error: "Document has no text content to process" },
        { status: 400 }
      );
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "PROCESSING" },
    });

    try {
      const results: {
        flashcardsCreated: number;
        questionsCreated: number;
      } = {
        flashcardsCreated: 0,
        questionsCreated: 0,
      };

      // Generate flashcards
      if (generateFlashcardsFlag) {
        const flashcards = await generateFlashcards(document.extractedText, {
          count: Math.min(flashcardsCount, 20), // Max 20 at a time
          isPremium: user.isPremium,
          language: "español",
        });

        if (flashcards.length > 0) {
          await prisma.flashcard.createMany({
            data: flashcards.map((fc) => ({
              documentId,
              front: fc.front,
              back: fc.back,
              difficulty: fc.difficulty,
            })),
          });
          results.flashcardsCreated = flashcards.length;
        }
      }

      // Generate questions
      if (generateQuestionsFlag) {
        const questions = await generateQuestions(document.extractedText, {
          count: Math.min(questionsCount, 10), // Max 10 at a time
          types: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
          isPremium: user.isPremium,
          language: "español",
        });

        if (questions.length > 0) {
          await prisma.question.createMany({
            data: questions.map((q) => ({
              documentId,
              type: q.type,
              question: q.question,
              correctAnswer: q.correctAnswer,
              options: q.options || undefined,
              explanation: q.explanation || undefined,
            })),
          });
          results.questionsCreated = questions.length;
        }
      }

      // Update document status to ready
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: "READY",
          flashcardsGenerated: generateFlashcardsFlag,
          questionsGenerated: generateQuestionsFlag,
        },
      });

      return NextResponse.json({
        success: true,
        ...results,
      });
    } catch (aiError) {
      // Update document status to failed
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: "FAILED",
          processingError: aiError instanceof Error ? aiError.message : "AI generation failed",
        },
      });

      throw aiError;
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}
