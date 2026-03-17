import OpenAI from "openai";

// Lazy initialization of OpenAI client
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

// Model selection based on user tier
const MODELS = {
  FREE: "gpt-4o-mini",
  PREMIUM: "gpt-4o",
} as const;

export interface GeneratedFlashcard {
  front: string;
  back: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export interface GeneratedQuestion {
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  question: string;
  correctAnswer: string;
  options?: string[];
  explanation?: string;
}

// Generate flashcards from document text
export async function generateFlashcards(
  text: string,
  options: {
    count?: number;
    isPremium?: boolean;
    language?: string;
  } = {}
): Promise<GeneratedFlashcard[]> {
  const { count = 10, isPremium = false, language = "español" } = options;
  const model = isPremium ? MODELS.PREMIUM : MODELS.FREE;

  // Limit text to avoid token limits (roughly 4 chars per token)
  const maxChars = isPremium ? 20000 : 10000;
  const truncatedText = text.slice(0, maxChars);

  const systemPrompt = `Eres un experto en educación y aprendizaje. Tu tarea es crear flashcards de alta calidad para ayudar a estudiantes a memorizar y comprender el contenido proporcionado.

Reglas para crear flashcards:
1. Cada flashcard debe tener una pregunta/concepto (front) y una respuesta/explicación (back)
2. Las preguntas deben ser claras y específicas
3. Las respuestas deben ser concisas pero completas
4. Varía la dificultad: EASY (definiciones básicas), MEDIUM (conceptos que requieren comprensión), HARD (aplicación o síntesis)
5. Evita preguntas de sí/no
6. Usa el idioma ${language}

Responde ÚNICAMENTE con un array JSON válido de flashcards.`;

  const userPrompt = `Genera exactamente ${count} flashcards basadas en el siguiente texto:

"""
${truncatedText}
"""

Responde con un array JSON con este formato exacto (sin markdown, sin texto adicional):
[
  {
    "front": "pregunta o concepto",
    "back": "respuesta o explicación",
    "difficulty": "EASY" | "MEDIUM" | "HARD"
  }
]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse JSON response (handle potential markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }

    const flashcards = JSON.parse(jsonStr) as GeneratedFlashcard[];

    // Validate and clean
    return flashcards
      .filter((fc) => fc.front && fc.back)
      .map((fc) => ({
        front: fc.front.trim(),
        back: fc.back.trim(),
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(fc.difficulty)
          ? fc.difficulty
          : "MEDIUM",
      }));
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}

// Generate quiz questions from document text
export async function generateQuestions(
  text: string,
  options: {
    count?: number;
    types?: ("MULTIPLE_CHOICE" | "TRUE_FALSE")[];
    isPremium?: boolean;
    language?: string;
  } = {}
): Promise<GeneratedQuestion[]> {
  const {
    count = 5,
    types = ["MULTIPLE_CHOICE", "TRUE_FALSE"],
    isPremium = false,
    language = "español",
  } = options;
  const model = isPremium ? MODELS.PREMIUM : MODELS.FREE;

  const maxChars = isPremium ? 20000 : 10000;
  const truncatedText = text.slice(0, maxChars);

  const systemPrompt = `Eres un experto en educación y evaluación. Tu tarea es crear preguntas de quiz de alta calidad para evaluar la comprensión del contenido proporcionado.

Reglas:
1. Para MULTIPLE_CHOICE: 4 opciones, solo una correcta
2. Para TRUE_FALSE: afirmación clara que sea verdadera o falsa
3. Incluye una explicación breve de por qué la respuesta es correcta
4. Varía la dificultad de las preguntas
5. Usa el idioma ${language}

Responde ÚNICAMENTE con un array JSON válido.`;

  const typesStr = types.join(" y ");
  const userPrompt = `Genera exactamente ${count} preguntas (tipos: ${typesStr}) basadas en el siguiente texto:

"""
${truncatedText}
"""

Responde con un array JSON con este formato exacto (sin markdown, sin texto adicional):
[
  {
    "type": "MULTIPLE_CHOICE",
    "question": "¿Cuál es...?",
    "correctAnswer": "La respuesta correcta",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "explanation": "Explicación breve"
  },
  {
    "type": "TRUE_FALSE",
    "question": "Afirmación sobre el tema",
    "correctAnswer": "true" o "false",
    "explanation": "Explicación breve"
  }
]`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
    }

    const questions = JSON.parse(jsonStr) as GeneratedQuestion[];

    return questions
      .filter((q) => q.question && q.correctAnswer)
      .map((q) => ({
        type: q.type,
        question: q.question.trim(),
        correctAnswer: q.correctAnswer.trim(),
        options: q.options?.map((o) => o.trim()),
        explanation: q.explanation?.trim(),
      }));
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate questions");
  }
}

export { getOpenAIClient as default };
