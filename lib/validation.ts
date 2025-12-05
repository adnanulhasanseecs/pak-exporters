/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Sanitize HTML content (for rich text editors)
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  // Basic HTML sanitization - in production, use a library like DOMPurify
  // For now, we'll just escape HTML entities
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // Remove common phone number characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  
  // Check if it's all digits and has reasonable length
  return /^\d{7,15}$/.test(cleaned);
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== "string") {
    return "file";
  }

  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars with underscore
    .replace(/\.\./g, "") // Remove path traversal attempts
    .substring(0, 255); // Limit length
}

/**
 * Validate and sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== "string") {
    return "";
  }

  return sanitizeInput(query)
    .substring(0, 200) // Limit length
    .trim();
}

/**
 * Validate numeric input
 */
export function isValidNumber(value: string | number, min?: number, max?: number): boolean {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num) || !isFinite(num)) {
    return false;
  }

  if (min !== undefined && num < min) {
    return false;
  }

  if (max !== undefined && num > max) {
    return false;
  }

  return true;
}

/**
 * Escape special characters for use in regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

