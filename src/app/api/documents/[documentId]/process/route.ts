import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { extractTextFromPDFUrl } from "@/lib/pdf";
import { extractTextWithOCR, extractTextFromImage, isLikelyScannedPDF } from "@/lib/ocr";

type RouteParams = { params: Promise<{ documentId: string }> };

// POST /api/documents/[documentId]/process - Extract text from PDF
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

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

    if (!document.originalFileUrl) {
      return NextResponse.json(
        { error: "No hay archivo para procesar" },
        { status: 400 }
      );
    }

    if (document.extractedText) {
      return NextResponse.json(
        { error: "El documento ya tiene texto extraído" },
        { status: 400 }
      );
    }

    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: "PROCESSING" },
    });

    try {
      let extractedText = "";
      let usedOCR = false;
      const fileUrl = document.originalFileUrl;
      const isPDF = fileUrl.toLowerCase().includes(".pdf");
      const isImage = /\.(png|jpg|jpeg|gif|webp|bmp|tiff?)$/i.test(fileUrl);

      if (isPDF) {
        // First try regular text extraction
        console.log("Attempting regular PDF text extraction...");
        try {
          extractedText = await extractTextFromPDFUrl(fileUrl);
        } catch (pdfError) {
          console.log("Regular extraction failed, will try OCR:", pdfError);
        }

        // If little/no text extracted, try OCR (likely scanned PDF)
        if (!extractedText || extractedText.length < 50) {
          console.log("PDF appears to be scanned, attempting OCR...");
          try {
            const response = await fetch(fileUrl);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            extractedText = await extractTextWithOCR(buffer);
            usedOCR = true;
          } catch (ocrError) {
            console.error("OCR extraction also failed:", ocrError);
            throw new Error(
              "No se pudo extraer texto del PDF ni con OCR. Verifica que el archivo sea válido."
            );
          }
        }
      } else if (isImage) {
        // For images, use OCR directly
        console.log("Processing image with OCR...");
        try {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          extractedText = await extractTextFromImage(buffer);
          usedOCR = true;
        } catch (ocrError) {
          console.error("Image OCR failed:", ocrError);
          throw new Error(
            "No se pudo extraer texto de la imagen. Verifica que el archivo sea válido."
          );
        }
      } else {
        throw new Error("Tipo de archivo no soportado. Solo se aceptan PDFs e imágenes.");
      }

      if (!extractedText || extractedText.length < 10) {
        throw new Error(
          "No se pudo extraer suficiente texto del archivo. " +
          "Asegúrate de que contenga texto legible."
        );
      }

      // Update document with extracted text
      const updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedText,
          processingStatus: "READY",
          processingError: null,
        },
      });

      return NextResponse.json({
        success: true,
        documentId: updatedDocument.id,
        textLength: extractedText.length,
        status: updatedDocument.processingStatus,
        usedOCR,
      });
    } catch (extractError) {
      const errorMessage = extractError instanceof Error
        ? extractError.message
        : "Error desconocido al procesar archivo";

      console.error("Extract error:", extractError);

      // Update with error status
      await prisma.document.update({
        where: { id: documentId },
        data: {
          processingStatus: "FAILED",
          processingError: errorMessage,
        },
      });

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Process document error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
