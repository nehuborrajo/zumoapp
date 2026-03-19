import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import getOpenAIClient from "@/lib/openai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Get document context for the tutor
async function getDocumentContext(
  documentId: string | undefined,
  subjectId: string | undefined,
  userId: string
): Promise<{ text: string; title: string }> {
  if (documentId) {
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
        subject: { container: { userId } },
      },
      select: {
        title: true,
        extractedText: true,
      },
    });

    if (!doc || !doc.extractedText) {
      throw new Error("Document not found or has no content");
    }

    return { text: doc.extractedText, title: doc.title };
  }

  if (subjectId) {
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        container: { userId },
      },
      include: {
        documents: {
          select: {
            title: true,
            extractedText: true,
          },
          where: {
            extractedText: { not: null },
          },
        },
      },
    });

    if (!subject || subject.documents.length === 0) {
      throw new Error("Subject not found or has no documents with content");
    }

    // Combine all documents text (limit to avoid token limits)
    const combinedText = subject.documents
      .map((d) => `## ${d.title}\n\n${d.extractedText}`)
      .join("\n\n---\n\n");

    // Truncate to ~15000 chars to stay within token limits
    const truncated = combinedText.slice(0, 15000);

    return { text: truncated, title: subject.name };
  }

  throw new Error("documentId or subjectId required");
}

// POST /api/tutor/chat - Chat with the AI tutor (streaming)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check premium status
    if (!user.isPremium) {
      return new Response(JSON.stringify({ error: "Premium subscription required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { documentId, subjectId, messages, userMessage } = body as {
      documentId?: string;
      subjectId?: string;
      messages: ChatMessage[];
      userMessage: string;
    };

    if (!userMessage || typeof userMessage !== "string") {
      return new Response(JSON.stringify({ error: "userMessage required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get context from document/subject
    const context = await getDocumentContext(documentId, subjectId, user.id);

    const systemPrompt = `Eres un tutor educativo experto y amigable. Tu objetivo es ayudar al estudiante a comprender profundamente el material de estudio.

MATERIAL DE ESTUDIO (${context.title}):
"""
${context.text}
"""

REGLAS IMPORTANTES:
1. Responde siempre en español
2. Basa tus respuestas en el material proporcionado
3. Si el estudiante pregunta algo fuera del tema, indícalo amablemente y redirige al material
4. Usa ejemplos del material cuando sea posible
5. Si no estás seguro de algo, admítelo honestamente
6. Sé conciso pero completo en tus explicaciones
7. Usa analogías y ejemplos para conceptos difíciles
8. Anima al estudiante y celebra su progreso
9. Si el estudiante parece confundido, ofrece explicarlo de otra manera`;

    // Build conversation history (limit to last 20 messages for context)
    const conversationHistory = (messages || [])
      .slice(-20)
      .map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o", // Premium always uses the best model
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: userMessage },
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Convert OpenAI stream to ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in tutor chat:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
