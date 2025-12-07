/**
 * Authentication Middleware
 * Helper functions to protect API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "./auth";
import { logAuthorizationFailure, getClientIP, getUserAgent } from "./security-logging";

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: AuthContext; response?: NextResponse }> {
  const tokenPayload = await getCurrentUserFromRequest(request.headers);

  if (!tokenPayload) {
    // Log authorization failure
    logAuthorizationFailure(
      getClientIP(request),
      "unknown",
      request.nextUrl.pathname,
      {
        userAgent: getUserAgent(request),
        reason: "No valid token",
      }
    );
    return {
      user: null as any,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  // Get full user data from database
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.userId },
    include: {
      company: true,
    },
  });

  if (!user) {
    // Log authorization failure
    logAuthorizationFailure(
      getClientIP(request),
      tokenPayload.userId,
      request.nextUrl.pathname,
      {
        userAgent: getUserAgent(request),
        reason: "User not found in database",
      }
    );
    return {
      user: null as any,
      response: NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      ),
    };
  }

  return {
    user: {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    },
  };
}

/**
 * Require specific role(s)
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user: AuthContext; response?: NextResponse }> {
  const authResult = await requireAuth(request);

  if (authResult.response) {
    return authResult;
  }

  if (!allowedRoles.includes(authResult.user.role)) {
    // Log authorization failure
    logAuthorizationFailure(
      getClientIP(request),
      authResult.user.userId,
      request.nextUrl.pathname,
      {
        userAgent: getUserAgent(request),
        reason: `Role '${authResult.user.role}' not in allowed roles: ${allowedRoles.join(", ")}`,
      }
    );
    return {
      user: null as any,
      response: NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

