/**
 * RFQ API Route
 * GET /api/rfq - List RFQs with filters
 * POST /api/rfq - Create a new RFQ (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RFQFormData } from "@/types/rfq";
import { requireRole } from "@/lib/middleware-auth";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const buyerId = searchParams.get("buyerId");
    const supplierId = searchParams.get("supplierId"); // For RFQs supplier can respond to

    // Build Prisma query
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (buyerId) {
      where.buyerId = buyerId;
    }

    // For suppliers, show all open RFQs (they can respond)
    // In a real app, you might filter by category match, location, etc.
    if (supplierId && !status) {
      where.status = "open";
    }

    // Get RFQs
    const rfqs = await prisma.rFQ.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to API format
    const transformedRFQs = rfqs.map(transformRFQ);

    return NextResponse.json({
      rfqs: transformedRFQs,
      total: rfqs.length,
    });
  } catch (error: any) {
    console.error("Error fetching RFQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQs", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require buyer role
    const authResult = await requireRole(request, ["buyer", "admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const body: RFQFormData = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, categoryId" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Use authenticated user as buyer
    const buyer = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!buyer) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create RFQ
    const rfq = await prisma.rFQ.create({
      data: {
        title: body.title,
        description: body.description,
        buyerId: buyer.id,
        categoryId: body.categoryId,
        quantityMin: body.quantity?.min || null,
        quantityMax: body.quantity?.max || null,
        quantityUnit: body.quantity?.unit || null,
        budgetMin: body.budget?.min || null,
        budgetMax: body.budget?.max || null,
        budgetCurrency: body.budget?.currency || "USD",
        specifications: body.specifications ? JSON.stringify(body.specifications) : null,
        attachments: body.attachments ? JSON.stringify(body.attachments) : null,
        status: "open",
        deadline: body.deadline ? new Date(body.deadline) : null,
      },
      include: {
        category: true,
        buyer: {
          include: {
            company: true,
          },
        },
        responses: true,
      },
    });

    return NextResponse.json(transformRFQ(rfq), { status: 201 });
  } catch (error: any) {
    console.error("Error creating RFQ:", error);
    return NextResponse.json(
      { error: "Failed to create RFQ", message: error.message },
      { status: 500 }
    );
  }
}

