/**
 * RFQ Response Update API Route
 * PUT /api/rfq/[id]/response/[responseId] - Update RFQ response status
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/middleware-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; responseId: string }> }
) {
  try {
    // Require buyer or admin role (only buyers can accept/reject responses)
    const authResult = await requireRole(request, ["buyer", "admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const { id: rfqId, responseId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Check if RFQ exists and user owns it
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
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

    // Check if response exists
    const response = await prisma.rFQResponse.findUnique({
      where: { id: responseId },
    });

    if (!response || response.rfqId !== rfqId) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // Update response status
    const updatedResponse = await prisma.rFQResponse.update({
      where: { id: responseId },
      data: { status },
      include: {
        supplier: true,
      },
    });

    // If accepted, update RFQ status to awarded
    if (status === "accepted") {
      await prisma.rFQ.update({
        where: { id: rfqId },
        data: { status: "awarded" },
      });
    }

    return NextResponse.json({
      id: updatedResponse.id,
      rfqId: updatedResponse.rfqId,
      supplier: {
        id: updatedResponse.supplier.id,
        name: updatedResponse.supplier.name,
        email: updatedResponse.supplier.email,
      },
      supplierCompany: updatedResponse.supplierCompany,
      priceAmount: updatedResponse.priceAmount,
      priceCurrency: updatedResponse.priceCurrency,
      message: updatedResponse.message || undefined,
      status: updatedResponse.status,
      createdAt: updatedResponse.createdAt.toISOString(),
      updatedAt: updatedResponse.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating RFQ response:", error);
    return NextResponse.json(
      { error: "Failed to update RFQ response", message: error.message },
      { status: 500 }
    );
  }
}

