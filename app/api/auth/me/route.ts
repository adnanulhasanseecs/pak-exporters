/**
 * Get Current User API Route
 * GET /api/auth/me - Get current authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromRequest } from "@/lib/auth";
import {
  logSecurityEvent,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = await getCurrentUserFromRequest(request.headers);

    if (!tokenPayload) {
      // Log unauthorized access attempt
      logSecurityEvent("AUTHORIZATION_FAILURE", getSecurityIP(request), {
        userAgent: getUserAgent(request),
        details: { endpoint: "/api/auth/me", reason: "No token" },
      });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (without password)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId || undefined,
      avatar: user.avatar || undefined,
      membershipStatus: user.membershipStatus || undefined,
      membershipTier: user.membershipTier || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", message: error.message },
      { status: 500 }
    );
  }
}

