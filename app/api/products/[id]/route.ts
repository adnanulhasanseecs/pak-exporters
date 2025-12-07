/**
 * Single Product API Route
 * GET /api/products/[id] - Get a single product
 * PUT /api/products/[id] - Update a product (requires authentication)
 * DELETE /api/products/[id] - Delete a product (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UpdateProductInput } from "@/types/product";
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

// Transform database product to API format
function transformProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription || undefined,
    price: {
      amount: product.priceAmount,
      currency: product.priceCurrency,
      minOrderQuantity: product.minOrderQuantity || undefined,
    },
    images: parseJsonField<string[]>(product.images) || [],
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    company: {
      id: product.company.id,
      name: product.company.name,
      logo: product.company.logo || undefined,
      verified: product.company.verified,
      goldSupplier: product.company.goldSupplier,
      membershipTier: product.company.membershipTier || undefined,
    },
    specifications: parseJsonField<Record<string, string>>(product.specifications),
    tags: parseJsonField<string[]>(product.tags),
    status: product.status as "active" | "inactive" | "pending",
    salesData: parseJsonField(product.salesData),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformProduct(product));
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", message: error.message },
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
    const body: Partial<UpdateProductInput> = await request.json();

    // Check if product exists and user owns it (unless admin)
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "admin" && existingProduct.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this product" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.shortDescription !== undefined) updateData.shortDescription = body.shortDescription;
    if (body.categoryId !== undefined) {
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
      updateData.categoryId = body.categoryId;
    }
    if (body.price !== undefined) {
      updateData.priceAmount = body.price.amount;
      updateData.priceCurrency = body.price.currency;
      if (body.price.minOrderQuantity !== undefined) {
        updateData.minOrderQuantity = body.price.minOrderQuantity;
      }
    }
    if (body.images !== undefined) updateData.images = JSON.stringify(body.images);
    if (body.specifications !== undefined) {
      updateData.specifications = JSON.stringify(body.specifications);
    }
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.status !== undefined) updateData.status = body.status;

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        company: true,
      },
    });

    return NextResponse.json(transformProduct(updatedProduct));
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Get product before deletion to update counts
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check ownership (unless admin)
    if (user.role !== "admin" && product.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Forbidden - You don't own this product" },
        { status: 403 }
      );
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    // Update category and company product counts
    await Promise.all([
      prisma.category.update({
        where: { id: product.categoryId },
        data: { productCount: { decrement: 1 } },
      }),
      prisma.company.update({
        where: { id: product.companyId },
        data: { productCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product", message: error.message },
      { status: 500 }
    );
  }
}

