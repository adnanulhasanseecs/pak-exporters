/**
 * Next.js Middleware
 * Handles i18n routing, security, CSRF protection, rate limiting, and request validation
 */

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { enhancedRateLimiter } from "@/lib/security-enhanced";
import { routing } from "@/i18n/routing";

// Create next-intl middleware for locale routing
const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  // First, handle i18n routing - this will handle locale detection and redirects
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returns a response, use it as the base
  // (it might be a redirect or a NextResponse.next())
  const response = intlResponse;

  // Add security headers (some are also in next.config.ts, but middleware allows dynamic headers)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Get client IP for rate limiting
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimit = enhancedRateLimiter.check(clientIP);
    if (!rateLimit.allowed) {
      response.headers.set("X-RateLimit-Limit", "100");
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("Retry-After", String(rateLimit.retryAfter || 60));
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: rateLimit.retryAfter },
        { status: 429, headers: response.headers }
      );
    }
    response.headers.set("X-RateLimit-Limit", "100");
    response.headers.set("X-RateLimit-Remaining", "99");
  }

  // CSRF protection for state-changing requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    // In production, verify origin matches expected domain
    if (process.env.NODE_ENV === "production") {
      const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://pak-exporters.com";
      if (origin && !origin.startsWith(expectedOrigin)) {
        return new NextResponse("Invalid origin", { status: 403 });
      }
    }

    // Verify referer for additional security
    if (referer && !referer.startsWith(request.nextUrl.origin)) {
      return new NextResponse("Invalid referer", { status: 403 });
    }
  }

  // Add nonce to response headers for CSP
  response.headers.set("X-Content-Security-Policy-Nonce", nonce);

  // Additional security headers
  response.headers.set("X-Request-ID", crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};

