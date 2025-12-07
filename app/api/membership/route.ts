/**
 * Membership Applications API Route
 * GET /api/membership - List membership applications (admin only)
 * POST /api/membership - Create a new membership application
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/middleware-auth";
import type { PaginationParams } from "@/types/api";

export async function GET(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRole(request, ["admin"]);
    if (authResult.response) {
      return authResult.response;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as "pending" | "approved" | "rejected" | null;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const total = await prisma.membershipApplication.count({ where });

    const applications = await prisma.membershipApplication.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        userId: app.userId,
        userEmail: app.user.email,
        userName: app.user.name,
        companyName: app.companyName,
        status: app.status,
        submittedAt: app.createdAt.toISOString(),
        reviewedAt: app.reviewedAt?.toISOString() || undefined,
        reviewedBy: app.reviewerId || undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("Error fetching membership applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership applications", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const body = await request.json();

    // Check if user already has an application
    const existingApp = await prisma.membershipApplication.findUnique({
      where: { userId: user.userId },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "You already have a membership application" },
        { status: 409 }
      );
    }

    // Create membership application
    const application = await prisma.membershipApplication.create({
      data: {
        userId: user.userId,
        companyName: body.companyName,
        status: "pending",
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(
      {
        id: application.id,
        userId: application.userId,
        userEmail: application.user.email,
        userName: application.user.name,
        companyName: application.companyName,
        status: application.status,
        submittedAt: application.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating membership application:", error);
    return NextResponse.json(
      { error: "Failed to create membership application", message: error.message },
      { status: 500 }
    );
  }
}

