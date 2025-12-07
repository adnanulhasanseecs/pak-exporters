/**
 * Security Headers Validation and Utilities
 */

export interface SecurityHeaders {
  "Strict-Transport-Security"?: string;
  "X-Frame-Options"?: string;
  "X-Content-Type-Options"?: string;
  "X-XSS-Protection"?: string;
  "Referrer-Policy"?: string;
  "Permissions-Policy"?: string;
  "Content-Security-Policy"?: string;
  "X-Permitted-Cross-Domain-Policies"?: string;
  "Cross-Origin-Embedder-Policy"?: string;
  "Cross-Origin-Opener-Policy"?: string;
  "Cross-Origin-Resource-Policy"?: string;
}

/**
 * Validate security headers
 */
export function validateSecurityHeaders(headers: Headers): {
  isValid: boolean;
  missing: string[];
  recommendations: string[];
} {
  const requiredHeaders: (keyof SecurityHeaders)[] = [
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Referrer-Policy",
    "Content-Security-Policy",
  ];

  const recommendedHeaders: (keyof SecurityHeaders)[] = [
    "Permissions-Policy",
    "X-Permitted-Cross-Domain-Policies",
    "Cross-Origin-Embedder-Policy",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
  ];

  const missing: string[] = [];
  const recommendations: string[] = [];

  // Check required headers
  for (const header of requiredHeaders) {
    if (!headers.get(header)) {
      missing.push(header);
    }
  }

  // Check recommended headers
  for (const header of recommendedHeaders) {
    if (!headers.get(header)) {
      recommendations.push(header);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    recommendations,
  };
}

/**
 * Get security headers score (0-100)
 */
export function getSecurityHeadersScore(headers: Headers): number {
  const allHeaders: (keyof SecurityHeaders)[] = [
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "X-XSS-Protection",
    "Referrer-Policy",
    "Permissions-Policy",
    "Content-Security-Policy",
    "X-Permitted-Cross-Domain-Policies",
    "Cross-Origin-Embedder-Policy",
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
  ];

  let score = 0;
  const pointsPerHeader = 100 / allHeaders.length;

  for (const header of allHeaders) {
    if (headers.get(header)) {
      score += pointsPerHeader;
    }
  }

  return Math.round(score);
}

/**
 * Recommended security headers configuration
 */
export const recommendedSecurityHeaders: SecurityHeaders = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

