/**
 * Single Membership Application API Route
 * GET /api/membership/[id] - Get a single membership application
 * PUT /api/membership/[id] - Update membership application status (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Membership application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: application.id,
      userId: application.userId,
      userEmail: application.user.email,
      userName: application.user.name,
      companyName: application.companyName,
      status: application.status,
      submittedAt: application.createdAt.toISOString(),
      reviewedAt: application.reviewedAt?.toISOString() || undefined,
      reviewedBy: application.reviewedBy || undefined,
    });
  } catch (error: any) {
    console.error("Error fetching membership application:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership application", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const { id } = await params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'approved' or 'rejected'" },
        { status: 400 }
      );
    }

    const application = await prisma.membershipApplication.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Membership application not found" },
        { status: 404 }
      );
    }

    // Update application
    const updated = await prisma.membershipApplication.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: user.userId,
      },
      include: {
        user: true,
      },
    });

    // If approved, update user membership status
    if (status === "approved") {
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          membershipStatus: "approved",
        },
      });
    }

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      userEmail: updated.user.email,
      userName: updated.user.name,
      companyName: updated.companyName,
      status: updated.status,
      submittedAt: updated.createdAt.toISOString(),
      reviewedAt: updated.reviewedAt?.toISOString() || undefined,
      reviewedBy: updated.reviewedBy || undefined,
      rejectionReason: rejectionReason || undefined,
    });
  } catch (error: any) {
    console.error("Error updating membership application:", error);
    return NextResponse.json(
      { error: "Failed to update membership application", message: error.message },
      { status: 500 }
    );
  }
}

