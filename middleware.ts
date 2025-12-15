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
  const pathname = request.nextUrl.pathname;

  // PUBLIC CATALOG ROUTES & STATIC ASSETS - Early bypass
  const isPublicOrStaticRoute =
    pathname === "/" ||
    pathname === "/products" ||
    pathname === "/categories" ||
    pathname === "/blog" ||
    pathname === "/search" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/companies" ||
    pathname === "/rfq" ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    /^\/_next\/static\//.test(pathname) ||
    /^\/_next\/image\//.test(pathname) ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname) ||
    /^\/[a-z]{2}\/?$/.test(pathname) ||
    /^\/[a-z]{2}\/products(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/categories(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/blog(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/category\/.+/.test(pathname) ||
    /^\/[a-z]{2}\/company\/.+/.test(pathname) ||
    /^\/[a-z]{2}\/search(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/about(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/contact(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/companies(\/|$)/.test(pathname) ||
    /^\/[a-z]{2}\/rfq(\/|$)/.test(pathname);

  if (isPublicOrStaticRoute) {
    return NextResponse.next();
  }

  // Full middleware processing for protected routes
  const intlResponse = intlMiddleware(request);
  const response = intlResponse;

  // Add nonce header
  let nonce: string;
  try {
    nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  } catch {
    nonce = Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
  }

  // Rate limiting for API routes
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

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

  // CSRF protection
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    if (process.env.NODE_ENV === "production") {
      const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://pak-exporters.com";
      if (origin && !origin.startsWith(expectedOrigin)) {
        return new NextResponse("Invalid origin", { status: 403 });
      }
    }

    if (referer && !referer.startsWith(request.nextUrl.origin)) {
      return new NextResponse("Invalid referer", { status: 403 });
    }
  }

  // Add nonce & request ID headers
  response.headers.set("X-Content-Security-Policy-Nonce", nonce);
  let requestId: string;
  try {
    requestId = crypto.randomUUID();
  } catch {
    requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  response.headers.set("X-Request-ID", requestId);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
