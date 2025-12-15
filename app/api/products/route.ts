/**
 * Products API Route
 * GET /api/products - List products with filters and pagination (PUBLIC - NO AUTH REQUIRED)
 * POST /api/products - Create a new product (requires authentication)
 * 
 * IMPORTANT: GET requests are PUBLIC and do NOT require authentication.
 * This endpoint is used by:
 * - Public product listings
 * - Search functionality
 * - Sitemap generation (now uses direct DB queries)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductFilters, CreateProductInput } from "@/types/product";
import type { PaginationParams } from "@/types/api";
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

export async function GET(request: NextRequest) {
  // GET /api/products is PUBLIC - no authentication required
  // Products are publicly readable
  try {

    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const filters: ProductFilters = {};
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const companyId = searchParams.get("companyId");
    const verifiedOnly = searchParams.get("verifiedOnly");
    const goldSupplierOnly = searchParams.get("goldSupplierOnly");
    const membershipTier = searchParams.get("membershipTier");
    const tags = searchParams.get("tags");

    if (category) filters.category = category;
    if (search) filters.search = search;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (companyId) filters.companyId = companyId;
    if (verifiedOnly === "true") filters.verifiedOnly = true;
    if (goldSupplierOnly === "true") filters.goldSupplierOnly = true;
    if (membershipTier) filters.membershipTier = membershipTier as any;
    if (tags) filters.tags = tags.split(",");

    // Parse pagination
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "20", 10),
    };
    
    // Ensure pagination values are valid
    if (!pagination.page || pagination.page < 1) pagination.page = 1;
    if (!pagination.pageSize || pagination.pageSize < 1) pagination.pageSize = 20;

    // Build Prisma query - products are publicly readable
    const where: any = {
      status: "active", // Only show active products by default
    };

    // Category filter
    if (filters.category) {
      where.category = {
        OR: [
          { slug: filters.category },
          { id: filters.category },
        ],
      };
    }

    // Search filter
    // PostgreSQL supports case-insensitive mode
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { shortDescription: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      where.priceAmount = { gte: filters.minPrice };
    }
    if (filters.maxPrice !== undefined) {
      where.priceAmount = { ...where.priceAmount, lte: filters.maxPrice };
    }

    // Company filter
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    // Company verification filters
    if (filters.verifiedOnly || filters.goldSupplierOnly || filters.membershipTier) {
      where.company = {};
      if (filters.verifiedOnly) where.company.verified = true;
      if (filters.goldSupplierOnly) where.company.goldSupplier = true;
      if (filters.membershipTier) where.company.membershipTier = filters.membershipTier;
    }

    // Tags filter (SQLite doesn't support JSON queries well, so we'll filter in memory)
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Get total count and products - fail fast on errors
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          company: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Filter by tags if needed (in memory for SQLite)
    let filteredProducts = products;
    if (filters.tags && filters.tags.length > 0) {
      filteredProducts = products.filter((product) => {
        const productTags = parseJsonField<string[]>(product.tags) || [];
        return filters.tags!.some((tag) => productTags.includes(tag));
      });
    }

    // Transform to API format
    const transformedProducts = filteredProducts.map(transformProduct);

    // For list view, omit full description
    const productListItems = transformedProducts.map((product) => {
      const { description, specifications, ...rest } = product;
      return {
        ...rest,
        description: product.shortDescription || undefined,
      };
    });

    return NextResponse.json({
      products: productListItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    // In production, fail fast - do not mask database errors
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch products",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require supplier role
    const authResult = await requireRole(request, ["supplier", "admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const body: CreateProductInput = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, categoryId" },
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

    // Get companyId from authenticated user (not from request body for security)
    const companyId = user.companyId;
    
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required. Please complete your company profile." },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription || null,
        categoryId: body.categoryId,
        companyId: companyId,
        priceAmount: body.price.amount,
        priceCurrency: body.price.currency,
        minOrderQuantity: body.price.minOrderQuantity || null,
        images: JSON.stringify(body.images || []),
        specifications: body.specifications ? JSON.stringify(body.specifications) : null,
        tags: body.tags ? JSON.stringify(body.tags) : null,
        status: body.status || "active",
      },
      include: {
        category: true,
        company: true,
      },
    });

    // Update category and company product counts
    await Promise.all([
      prisma.category.update({
        where: { id: category.id },
        data: { productCount: { increment: 1 } },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: { productCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json(transformProduct(product), { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", message: error.message },
      { status: 500 }
    );
  }
}

