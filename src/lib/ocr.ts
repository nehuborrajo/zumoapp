import Tesseract from "tesseract.js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import sharp from "sharp";

// Disable worker for server-side usage
pdfjs.GlobalWorkerOptions.workerSrc = "";

/**
 * Convert a PDF page to PNG buffer using PDF.js and sharp
 */
async function pdfPageToImageBuffer(
  pdfDocument: pdfjs.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 2.0
): Promise<Buffer> {
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  // Get the operator list and convert to image data
  const opList = await page.getOperatorList();

  // For PDF.js without canvas, we need a different approach
  // Use the page's built-in render to raw pixel data
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  // Create raw RGBA buffer
  const rawPixels = new Uint8ClampedArray(width * height * 4);
  rawPixels.fill(255); // White background

  // Note: Full rendering requires canvas. For now, we'll use a simpler approach
  // that extracts any embedded images from the PDF

  // Create a white image as placeholder (actual implementation below)
  const imageBuffer = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  return imageBuffer;
}

/**
 * Extract embedded images from PDF page
 */
async function extractImagesFromPage(
  pdfDocument: pdfjs.PDFDocumentProxy,
  pageNumber: number
): Promise<Buffer[]> {
  const page = await pdfDocument.getPage(pageNumber);
  const opList = await page.getOperatorList();
  const images: Buffer[] = [];

  // Look for image operators in the PDF
  for (let i = 0; i < opList.fnArray.length; i++) {
    const fn = opList.fnArray[i];
    // OPS.paintImageXObject = 85
    if (fn === 85) {
      try {
        const imgName = opList.argsArray[i][0];
        const imgObj = await page.objs.get(imgName);
        if (imgObj && imgObj.data) {
          // Convert raw image data to PNG using sharp
          const { width, height } = imgObj;
          const rawChannels = Math.round(imgObj.data.length / (width * height));
          const channels = (rawChannels === 1 || rawChannels === 3 || rawChannels === 4 ? rawChannels : 4) as 1 | 2 | 3 | 4;
          const imgBuffer = await sharp(Buffer.from(imgObj.data), {
            raw: {
              width,
              height,
              channels,
            },
          })
            .png()
            .toBuffer();
          images.push(imgBuffer);
        }
      } catch {
        // Skip images that can't be extracted
      }
    }
  }

  return images;
}

/**
 * Extract text from a scanned PDF using OCR
 * @param buffer - PDF file buffer
 * @param language - OCR language (default: Spanish + English)
 * @returns Extracted text from all pages
 */
export async function extractTextWithOCR(
  buffer: Buffer | Uint8Array,
  language: string = "spa+eng"
): Promise<string> {
  try {
    console.log("Starting OCR extraction...");

    // Convert to Uint8Array if needed
    const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    // Load PDF document
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    console.log(`PDF has ${numPages} pages for OCR`);

    const extractedTexts: string[] = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`OCR processing page ${pageNum}/${numPages}...`);

      try {
        // Try to extract embedded images from the page
        const images = await extractImagesFromPage(pdfDocument, pageNum);

        if (images.length > 0) {
          // Run OCR on each extracted image
          const pageTexts: string[] = [];
          for (let i = 0; i < images.length; i++) {
            const result = await Tesseract.recognize(images[i], language, {
              logger: (m) => {
                if (m.status === "recognizing text") {
                  console.log(`  Page ${pageNum}, image ${i + 1}: ${Math.round(m.progress * 100)}%`);
                }
              },
            });
            if (result.data.text.trim()) {
              pageTexts.push(result.data.text.trim());
            }
          }
          if (pageTexts.length > 0) {
            extractedTexts.push(`--- Página ${pageNum} ---\n${pageTexts.join("\n")}`);
          }
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
      }
    }

    const fullText = extractedTexts.join("\n\n");
    console.log(`OCR completed. Total characters extracted: ${fullText.length}`);

    return fullText;
  } catch (error) {
    console.error("OCR extraction error:", error);
    throw new Error(
      `Error en OCR: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Extract text from an image file using OCR
 * @param imageBuffer - Image file buffer (PNG, JPG, etc.)
 * @param language - OCR language (default: Spanish + English)
 * @returns Extracted text
 */
export async function extractTextFromImage(
  imageBuffer: Buffer | Uint8Array,
  language: string = "spa+eng"
): Promise<string> {
  try {
    console.log("Starting OCR on image...");

    // Ensure it's a Buffer for Tesseract
    const buffer = imageBuffer instanceof Buffer ? imageBuffer : Buffer.from(imageBuffer);

    const result = await Tesseract.recognize(buffer, language, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`  OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const text = result.data.text.trim();
    console.log(`OCR completed. Characters extracted: ${text.length}`);

    return text;
  } catch (error) {
    console.error("Image OCR error:", error);
    throw new Error(
      `Error en OCR de imagen: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Check if extracted text seems to be from a scanned document
 * (very little text despite having pages)
 */
export function isLikelyScannedPDF(extractedText: string, pageCount: number): boolean {
  // If we have very little text per page, it's likely scanned
  const avgCharsPerPage = extractedText.length / pageCount;
  return avgCharsPerPage < 100; // Less than 100 chars per page = likely scanned
}
