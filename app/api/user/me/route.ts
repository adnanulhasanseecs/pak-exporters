/**
 * Current User API Route
 * GET /api/user/me - Get current user profile
 * PUT /api/user/me - Update current user profile
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware-auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        company: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      companyId: dbUser.companyId || undefined,
      avatar: dbUser.avatar || undefined,
      membershipStatus: dbUser.membershipStatus || undefined,
      membershipTier: dbUser.membershipTier || undefined,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const body = await request.json();
    const { name, avatar } = body;

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      companyId: updated.companyId || undefined,
      avatar: updated.avatar || undefined,
      membershipStatus: updated.membershipStatus || undefined,
      membershipTier: updated.membershipTier || undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user", message: error.message },
      { status: 500 }
    );
  }
}

