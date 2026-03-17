import { extractText } from "unpdf";

/**
 * Extract text from a PDF buffer
 * @param buffer - PDF file buffer or Uint8Array
 * @returns Extracted text
 */
export async function extractTextFromPDF(buffer: Buffer | Uint8Array): Promise<string> {
  try {
    // Convert Buffer to Uint8Array if needed
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const result = await extractText(uint8Array);

    // Handle different return formats
    let text: string;
    if (typeof result === "string") {
      text = result;
    } else if (result && typeof result.text === "string") {
      text = result.text;
    } else if (result && Array.isArray(result.text)) {
      text = result.text.join("\n");
    } else if (result && "pages" in result && Array.isArray((result as any).pages)) {
      text = (result as any).pages.map((p: any) => p.text || "").join("\n");
    } else {
      text = JSON.stringify(result);
    }

    return text.trim();
  } catch (error) {
    console.error("PDF extraction error details:", error);
    throw new Error(
      `Error al extraer texto del PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract text from a PDF URL
 * @param url - URL of the PDF file
 * @returns Extracted text
 */
export async function extractTextFromPDFUrl(url: string): Promise<string> {
  try {
    console.log("Fetching PDF from URL:", url);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("PDF downloaded, size:", arrayBuffer.byteLength, "bytes");

    const uint8Array = new Uint8Array(arrayBuffer);
    return extractTextFromPDF(uint8Array);
  } catch (error) {
    console.error("PDF URL extraction error details:", error);
    throw new Error(
      `Error al procesar PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
