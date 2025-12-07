/**
 * Image upload service
 * Real implementation using Next.js API routes (when available)
 */

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validTypes.join(", ")}`,
    };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check dimensions (optional - would require image loading)
  // For now, we'll skip dimension validation in mock

  return { valid: true };
}

/**
 * Upload a single image file
 * @param file - Image file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */
export async function uploadImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file");
  }

  const token = getAuthToken();
  const formData = new FormData();
  formData.append("file", file);

  // TODO: Implement /api/upload endpoint
  // For now, use data URL for preview
  // In production, this would upload to cloud storage (S3, Cloudinary, etc.)
  
  if (onProgress) {
    // Simulate progress
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      onProgress({
        loaded: (file.size * i) / steps,
        total: file.size,
        percentage: (i / steps) * 100,
      });
    }
  }

  // Use data URL for now (in real app, this would be the uploaded URL from API)
  const dataUrl = await fileToDataURL(file);

  return {
    url: dataUrl,
    filename: file.name,
    size: file.size,
    type: file.type,
  };
}

/**
 * Upload multiple image files
 * @param files - Array of image files to upload
 * @param onProgress - Optional progress callback for each file
 * @returns Promise with array of upload results
 */
export async function uploadImages(
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileProgress = onProgress
      ? (progress: UploadProgress) => onProgress(i, progress)
      : undefined;

    try {
      const result = await uploadImage(file, fileProgress);
      results.push(result);
    } catch (error) {
      // In real app, you might want to continue with other files
      // or stop on first error
      throw error;
    }
  }

  return results;
}

/**
 * Convert file to data URL for preview
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image (placeholder for future implementation)
 */
export async function compressImage(
  file: File,
  _maxWidth: number = 1920,
  _maxHeight: number = 1080,
  _quality: number = 0.8
): Promise<File> {
  // In real implementation, this would:
  // 1. Load image into canvas
  // 2. Resize if needed (using maxWidth, maxHeight)
  // 3. Compress with specified quality
  // 4. Return compressed File/Blob

  // For now, return original file
  return file;
}

/**
 * Delete uploaded image
 * @param url - URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  const token = getAuthToken();
  
  // TODO: Implement DELETE /api/upload/[id] endpoint
  // For now, just log (in production, this would call the API to delete from storage)
  console.log(`Deleting image at ${url}`);
}

