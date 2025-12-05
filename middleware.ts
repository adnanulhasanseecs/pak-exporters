/**
 * Next.js Middleware
 * Handles security, CSRF protection, and request validation
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers (some are also in next.config.ts, but middleware allows dynamic headers)
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

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

  // Rate limiting headers (basic - for production, use a proper rate limiting service)
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Remaining", "99");

  // Add nonce to response headers for CSP
  response.headers.set("X-Content-Security-Policy-Nonce", nonce);

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

