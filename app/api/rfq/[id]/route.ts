/**
 * Single RFQ API Route
 * GET /api/rfq/[id] - Get a single RFQ
 * PUT /api/rfq/[id] - Update an RFQ (requires authentication)
 * DELETE /api/rfq/[id] - Delete an RFQ (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware-auth";

// Helper to parse JSON fields from database
function parseJsonField<T>(field: string | null): T | undefined {
  if (!field) return undefined;
  try {
    return JSON.parse(field) as T;
  } catch {
    return undefined;
  }
}

// Transform database RFQ to API format
function transformRFQ(rfq: any) {
  return {
    id: rfq.id,
    title: rfq.title,
    description: rfq.description,
    category: {
      id: rfq.category.id,
      name: rfq.category.name,
      slug: rfq.category.slug,
    },
    buyer: {
      id: rfq.buyer.id,
      name: rfq.buyer.name,
      email: rfq.buyer.email,
      company: rfq.buyer.companyId ? rfq.buyer.company?.name : undefined,
    },
    quantity: rfq.quantityMin || rfq.quantityMax || rfq.quantityUnit
      ? {
          min: rfq.quantityMin || undefined,
          max: rfq.quantityMax || undefined,
          unit: rfq.quantityUnit || undefined,
        }
      : undefined,
    budget: rfq.budgetMin || rfq.budgetMax
      ? {
          min: rfq.budgetMin || undefined,
          max: rfq.budgetMax || undefined,
          currency: rfq.budgetCurrency || "USD",
        }
      : undefined,
    specifications: parseJsonField<Record<string, string>>(rfq.specifications),
    attachments: parseJsonField(rfq.attachments),
    status: rfq.status as "open" | "closed" | "awarded" | "cancelled",
    deadline: rfq.deadline?.toISOString() || undefined,
    responses: rfq.responses?.map((response: any) => ({
      id: response.id,
      rfqId: response.rfqId,
      supplier: {
        id: response.supplier.id,
        name: response.supplier.name,
        email: response.supplier.email,
      },
      supplierCompany: response.supplierCompany,
      priceAmount: response.priceAmount,
      priceCurrency: response.priceCurrency,
      message: response.message || undefined,
      status: response.status as "pending" | "accepted" | "rejected",
      createdAt: response.createdAt.toISOString(),
      updatedAt: response.updatedAt.toISOString(),
    })) || [],
    createdAt: rfq.createdAt.toISOString(),
    updatedAt: rfq.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
      include: {
        category: true,
        buyer: {
          include: {
            company: true,
          },
        },
        responses: {
          include: {
            supplier: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformRFQ(rfq));
  } catch (error: any) {
    console.error("Error fetching RFQ:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQ", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();

    // Check if RFQ exists and user owns it (unless admin)
    const existingRFQ = await prisma.rFQ.findUnique({
      where: { id },
    });

    if (!existingRFQ) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "admin" && existingRFQ.buyerId !== user.userId) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this RFQ" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      updateData.categoryId = body.categoryId;
    }
    if (body.quantity !== undefined) {
      updateData.quantityMin = body.quantity.min || null;
      updateData.quantityMax = body.quantity.max || null;
      updateData.quantityUnit = body.quantity.unit || null;
    }
    if (body.budget !== undefined) {
      updateData.budgetMin = body.budget.min || null;
      updateData.budgetMax = body.budget.max || null;
      updateData.budgetCurrency = body.budget.currency || "USD";
    }
    if (body.specifications !== undefined) {
      updateData.specifications = JSON.stringify(body.specifications);
    }
    if (body.attachments !== undefined) {
      updateData.attachments = JSON.stringify(body.attachments);
    }
    if (body.status !== undefined) updateData.status = body.status;
    if (body.deadline !== undefined) {
      updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    }

    // Update RFQ
    const updatedRFQ = await prisma.rFQ.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        buyer: {
          include: {
            company: true,
          },
        },
        responses: {
          include: {
            supplier: true,
          },
        },
      },
    });

    return NextResponse.json(transformRFQ(updatedRFQ));
  } catch (error: any) {
    console.error("Error updating RFQ:", error);
    return NextResponse.json(
      { error: "Failed to update RFQ", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;
    const { id } = await params;

    const rfq = await prisma.rFQ.findUnique({
      where: { id },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "admin" && rfq.buyerId !== user.userId) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this RFQ" },
        { status: 403 }
      );
    }

    // Delete RFQ (cascade will delete responses)
    await prisma.rFQ.delete({
      where: { id },
    });

    return NextResponse.json({ message: "RFQ deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting RFQ:", error);
    return NextResponse.json(
      { error: "Failed to delete RFQ", message: error.message },
      { status: 500 }
    );
  }
}

