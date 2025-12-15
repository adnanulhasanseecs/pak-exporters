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
  
  // PUBLIC CATALOG ROUTES - Bypass middleware entirely for read-only pages
  // These routes must work without authentication, cookies, or headers
  const publicCatalogRoutes = [
    "/products",
    "/categories",
    "/blog",
    "/category/",
    "/company/",
    "/search",
    "/about",
    "/contact",
  ];
  
  // Check if this is a public catalog route (with or without locale prefix)
  const isPublicCatalogRoute = publicCatalogRoutes.some((route) => {
    // Match exact route or route with locale prefix (e.g., /en/products, /ur/products)
    return pathname === route || 
           pathname.startsWith(route) ||
           /^\/[a-z]{2}\/products/.test(pathname) ||
           /^\/[a-z]{2}\/categories/.test(pathname) ||
           /^\/[a-z]{2}\/blog/.test(pathname) ||
           /^\/[a-z]{2}\/category\//.test(pathname) ||
           /^\/[a-z]{2}\/company\//.test(pathname) ||
           /^\/[a-z]{2}\/search/.test(pathname);
  });
  
  // If public catalog route, only apply i18n routing and return immediately
  // This ensures SSR can run without any auth checks or middleware interference
  if (isPublicCatalogRoute) {
    const intlResponse = intlMiddleware(request);
    return intlResponse;
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
     * Public catalog routes (products, categories, blog) are matched but
     * bypassed early in middleware function for SSR compatibility
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};

