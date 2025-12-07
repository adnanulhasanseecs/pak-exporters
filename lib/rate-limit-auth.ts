/**
 * Authentication-specific rate limiting
 * Stricter rate limits for login, register, and password reset endpoints
 */

import { EnhancedRateLimiter } from "./security-enhanced";

// Stricter rate limiter for authentication endpoints
// 5 attempts per 15 minutes (prevents brute force attacks)
export const authRateLimiter = new EnhancedRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  30 * 60 * 1000 // 30 minutes block duration (future use)
);

// Rate limiter for password reset requests
// 3 requests per hour (prevents abuse)
export const passwordResetRateLimiter = new EnhancedRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests
  60 * 60 * 1000 // 1 hour block duration
);

// Rate limiter for email verification
// 5 requests per hour
export const emailVerificationRateLimiter = new EnhancedRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 requests
  60 * 60 * 1000 // 1 hour block duration
);

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit for authentication endpoint
 */
export function checkAuthRateLimit(
  request: Request
): { allowed: boolean; retryAfter?: number; error?: string } {
  const clientIP = getClientIP(request);
  const result = authRateLimiter.check(clientIP);

  if (!result.allowed) {
    return {
      allowed: false,
      retryAfter: result.retryAfter,
      error: `Too many login attempts. Please try again after ${result.retryAfter} seconds.`,
    };
  }

  return { allowed: true };
}

/**
 * Check rate limit for password reset endpoint
 */
export function checkPasswordResetRateLimit(
  request: Request
): { allowed: boolean; retryAfter?: number; error?: string } {
  const clientIP = getClientIP(request);
  const result = passwordResetRateLimiter.check(clientIP);

  if (!result.allowed) {
    return {
      allowed: false,
      retryAfter: result.retryAfter,
      error: `Too many password reset requests. Please try again after ${result.retryAfter} seconds.`,
    };
  }

  return { allowed: true };
}

/**
 * Check rate limit for email verification endpoint
 */
export function checkEmailVerificationRateLimit(
  request: Request
): { allowed: boolean; retryAfter?: number; error?: string } {
  const clientIP = getClientIP(request);
  const result = emailVerificationRateLimiter.check(clientIP);

  if (!result.allowed) {
    return {
      allowed: false,
      retryAfter: result.retryAfter,
      error: `Too many verification requests. Please try again after ${result.retryAfter} seconds.`,
    };
  }

  return { allowed: true };
}

