/**
 * RFQ Response API Route
 * POST /api/rfq/[id]/response - Submit a response to an RFQ (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require supplier role
    const authResult = await requireRole(request, ["supplier", "admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const { id: rfqId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.priceAmount) {
      return NextResponse.json(
        { error: "Missing required field: priceAmount" },
        { status: 400 }
      );
    }

    // Check if RFQ exists
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    if (rfq.status !== "open") {
      return NextResponse.json(
        { error: "RFQ is not open for responses" },
        { status: 400 }
      );
    }

    // Use authenticated user as supplier
    const supplier = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        company: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create RFQ response
    const response = await prisma.rFQResponse.create({
      data: {
        rfqId: rfqId,
        supplierId: supplier.id,
        supplierCompany: body.supplierCompany || supplier.company?.name || supplier.name,
        priceAmount: body.priceAmount,
        priceCurrency: body.priceCurrency || "USD",
        message: body.message || null,
        status: "pending",
      },
      include: {
        supplier: true,
        rfq: {
          include: {
            category: true,
            buyer: true,
          },
        },
      },
    });

    return NextResponse.json({
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
      status: response.status,
      createdAt: response.createdAt.toISOString(),
      updatedAt: response.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating RFQ response:", error);
    return NextResponse.json(
      { error: "Failed to create RFQ response", message: error.message },
      { status: 500 }
    );
  }
}

