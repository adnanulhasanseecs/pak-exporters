/**
 * Refresh Token API Route
 * POST /api/auth/refresh - Refresh JWT token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, verifyToken, generateToken } from "@/lib/auth";
import {
  logSecurityEvent,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify existing token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      // Log invalid token
      logSecurityEvent("TOKEN_INVALID", getSecurityIP(request), {
        userAgent: getUserAgent(request),
        details: { reason: "Token refresh failed" },
      });
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate new token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log token refresh
    logSecurityEvent("TOKEN_REFRESH", getSecurityIP(request), {
      userId: user.id,
      email: user.email,
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      token: newToken,
      expiresIn: 3600 * 24 * 7, // 7 days
    });
  } catch (error: any) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Failed to refresh token", message: error.message },
      { status: 500 }
    );
  }
}

