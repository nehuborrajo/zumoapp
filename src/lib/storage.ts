// Storage abstraction layer
// Currently uses Supabase Storage, can be swapped to Cloudflare R2 later

import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "documents";

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface StorageFile {
  name: string;
  size: number;
  type: string;
}

/**
 * Upload a file to storage
 * @param file - The file buffer or Blob
 * @param fileName - Original file name
 * @param userId - User ID for organizing files
 * @returns Upload result with URL
 */
export async function uploadFile(
  file: Buffer | Blob,
  fileName: string,
  userId: string
): Promise<UploadResult> {
  try {
    const supabase = await createClient();

    // Generate unique path: userId/timestamp-filename
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${userId}/${timestamp}-${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType: getContentType(fileName),
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a file from storage
 * @param path - The file path in storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error("Storage delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

/**
 * Get a signed URL for private file access
 * @param path - The file path in storage
 * @param expiresIn - Expiration time in seconds (default 1 hour)
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Signed URL error:", error);
    return null;
  }
}

/**
 * Download file content
 * @param path - The file path in storage
 */
export async function downloadFile(path: string): Promise<Blob | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(path);

    if (error) {
      console.error("Download error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Download error:", error);
    return null;
  }
}

/**
 * Get content type from file extension
 */
function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();

  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: { name: string; size: number; type: string },
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 10, allowedTypes = ["application/pdf", "text/plain"] } =
    options;

  // Check size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo ${maxSizeMB}MB`,
    };
  }

  // Check type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Usa: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}
