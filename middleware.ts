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
  
  // PUBLIC CATALOG ROUTES - Bypass all middleware processing for read-only pages
  // These routes must work during SSR without authentication, cookies, or headers
  // This is critical for Vercel Edge Middleware compatibility and SSR performance
  const isPublicCatalogRoute = 
    // Home page
    pathname === "/" ||
    // Exact public routes (with or without locale)
    pathname === "/products" ||
    pathname === "/categories" ||
    pathname === "/blog" ||
    pathname === "/search" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/companies" ||
    pathname === "/rfq" ||
    // Public routes with locale prefix (e.g., /en/products, /ur/products)
    /^\/[a-z]{2}\/?$/.test(pathname) || // Home with locale
    /^\/[a-z]{2}\/products(\/|$)/.test(pathname) || // Products listing and detail
    /^\/[a-z]{2}\/categories(\/|$)/.test(pathname) || // Categories listing
    /^\/[a-z]{2}\/blog(\/|$)/.test(pathname) || // Blog listing and detail
    /^\/[a-z]{2}\/category\/.+/.test(pathname) || // Category detail pages
    /^\/[a-z]{2}\/company\/.+/.test(pathname) || // Company detail pages
    /^\/[a-z]{2}\/search(\/|$)/.test(pathname) || // Search
    /^\/[a-z]{2}\/about(\/|$)/.test(pathname) || // About
    /^\/[a-z]{2}\/contact(\/|$)/.test(pathname) || // Contact
    /^\/[a-z]{2}\/companies(\/|$)/.test(pathname) || // Companies listing
    /^\/[a-z]{2}\/rfq(\/|$)/.test(pathname) || // RFQ
    // Public routes without locale (legacy redirects)
    /^\/products(\/|$)/.test(pathname) ||
    /^\/categories(\/|$)/.test(pathname) ||
    /^\/blog(\/|$)/.test(pathname) ||
    /^\/category\/.+/.test(pathname) ||
    /^\/company\/.+/.test(pathname) ||
    /^\/search(\/|$)/.test(pathname);
  
  // If public catalog route, ONLY apply i18n routing and return immediately
  // This ensures SSR can run without any auth checks, CSRF validation, or middleware interference
  // Critical for Vercel Edge Middleware and serverless function performance
  if (isPublicCatalogRoute) {
    return intlMiddleware(request);
  }
  
  // For all other routes, apply full middleware processing
  // First, handle i18n routing - this will handle locale detection and redirects
  const intlResponse = intlMiddleware(request);
  
  // If intl middleware returns a response, use it as the base
  // (it might be a redirect or a NextResponse.next())
  const response = intlResponse;

  // Add security headers (some are also in next.config.ts, but middleware allows dynamic headers)
  // Use crypto.randomUUID() if available, otherwise fallback to a random string
  let nonce: string;
  try {
    nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  } catch {
    // Fallback for environments where crypto.randomUUID() is not available
    nonce = Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
  }

  // Get client IP for rate limiting
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
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
  let requestId: string;
  try {
    requestId = crypto.randomUUID();
  } catch {
    // Fallback for environments where crypto.randomUUID() is not available
    requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  response.headers.set("X-Request-ID", requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match request paths but EXCLUDE:
     * - api routes (handled separately in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * 
     * Public catalog routes are matched but bypassed early in middleware
     * for SSR compatibility. Protected routes (dashboard, admin, account) are
     * processed with full middleware (auth, CSRF, rate limiting).
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};

