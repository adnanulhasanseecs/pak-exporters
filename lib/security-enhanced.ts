/**
 * Enhanced Security Utilities
 * Comprehensive security functions for input validation, sanitization, and protection
 */

import { z } from "zod";

/**
 * Enhanced input sanitization with comprehensive XSS prevention
 */
export function sanitizeInputEnhanced(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data: protocol (can be dangerous)
    .replace(/vbscript:/gi, "") // Remove vbscript: protocol
    .replace(/<script/gi, "") // Remove script tags
    .replace(/<\/script>/gi, "") // Remove closing script tags
    .replace(/<iframe/gi, "") // Remove iframe tags
    .replace(/<object/gi, "") // Remove object tags
    .replace(/<embed/gi, "") // Remove embed tags
    .replace(/expression\(/gi, "") // Remove CSS expressions
    .trim();
}

/**
 * Sanitize HTML while preserving safe tags (for rich text)
 */
export function sanitizeHTML(html: string): string {
  // For production, use a library like DOMPurify
  // This is a basic implementation
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>.*?<\/object>/gi, "")
    .replace(/<embed[^>]*>.*?<\/embed>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Validate password strength
 */
export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4 (0=weak, 4=very strong)
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push("Password must be at least 8 characters long");
    return { isValid: false, score: 0, feedback };
  }
  score++;

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("Add uppercase letters");
  }

  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add numbers");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("Add special characters");
  }

  // Check for common patterns
  const commonPatterns = [
    /12345/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    feedback.push("Avoid common patterns");
    score = Math.max(0, score - 1);
  }

  const isValid = score >= 3 && password.length >= 8;

  if (isValid && feedback.length === 0) {
    feedback.push("Strong password");
  }

  return { isValid, score, feedback };
}

/**
 * Validate and sanitize email
 */
export function validateAndSanitizeEmail(email: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!email || typeof email !== "string") {
    return { isValid: false, sanitized: "", error: "Email is required" };
  }

  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: "Invalid email format" };
  }

  // Check for dangerous characters
  if (containsDangerousContent(sanitized)) {
    return { isValid: false, sanitized, error: "Email contains invalid characters" };
  }

  // Check length
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: "Email is too long" };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate and sanitize URL
 */
export function validateAndSanitizeURL(url: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!url || typeof url !== "string") {
    return { isValid: false, sanitized: "", error: "URL is required" };
  }

  const sanitized = url.trim();

  try {
    const parsedUrl = new URL(sanitized);
    
    // Only allow http and https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return { isValid: false, sanitized, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    // Check for dangerous protocols in the URL
    if (sanitized.toLowerCase().includes("javascript:") || 
        sanitized.toLowerCase().includes("data:") ||
        sanitized.toLowerCase().includes("vbscript:")) {
      return { isValid: false, sanitized, error: "URL contains dangerous protocols" };
    }

    return { isValid: true, sanitized };
  } catch {
    return { isValid: false, sanitized, error: "Invalid URL format" };
  }
}

/**
 * Check if string contains dangerous content (enhanced)
 */
export function containsDangerousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\(/gi,
    /<svg[^>]*onload/gi,
    /<img[^>]*onerror/gi,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate file upload
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): FileValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file extension
  const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed. Allowed extensions: ${allowedExtensions.join(", ")}`,
    };
  }

  // Check for dangerous file names
  if (containsDangerousContent(file.name)) {
    return {
      isValid: false,
      error: "File name contains invalid characters",
    };
  }

  return { isValid: true };
}

/**
 * Validate request body size
 */
export function validateRequestBodySize(
  body: string | object,
  maxSize: number = 1024 * 1024 // 1MB default
): { isValid: boolean; error?: string } {
  const bodyString = typeof body === "string" ? body : JSON.stringify(body);
  const size = new Blob([bodyString]).size;

  if (size > maxSize) {
    return {
      isValid: false,
      error: `Request body size (${Math.round(size / 1024)}KB) exceeds maximum allowed size of ${Math.round(maxSize / 1024)}KB`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize object recursively (for nested objects)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as T;

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      (sanitized as any)[key] = sanitizeInputEnhanced(sanitized[key] as string);
    } else if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      if (Array.isArray(sanitized[key])) {
        (sanitized as any)[key] = (sanitized[key] as any[]).map((item: any) =>
          typeof item === "string" ? sanitizeInputEnhanced(item) : item
        );
      } else {
        (sanitized as any)[key] = sanitizeObject(sanitized[key] as Record<string, any>);
      }
    }
  }

  return sanitized;
}

/**
 * Common validation schemas using Zod
 */
export const validationSchemas = {
  email: z.string().email("Invalid email format").max(254, "Email is too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  url: z.string().url("Invalid URL format"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  uuid: z.string().uuid("Invalid UUID format"),
  positiveInteger: z.number().int().positive("Must be a positive integer"),
  nonEmptyString: z.string().min(1, "String cannot be empty"),
};

/**
 * Rate limiting with IP-based tracking
 */
export class EnhancedRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(
    windowMs: number = 60000, // 1 minute
    maxRequests: number = 100,
    _blockDurationMs: number = 300000 // 5 minutes (reserved for future use)
  ) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      // Calculate retry after time
      const oldestRequest = Math.min(...validRequests);
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return { allowed: true };
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  clear(): void {
    this.requests.clear();
  }
}

// Export enhanced rate limiter instance
export const enhancedRateLimiter = new EnhancedRateLimiter(60000, 100);

