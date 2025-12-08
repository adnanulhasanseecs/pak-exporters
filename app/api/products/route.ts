/**
 * Products API Route
 * GET /api/products - List products with filters and pagination
 * POST /api/products - Create a new product (requires authentication)
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
  try {
    // Check if Prisma is available and database is accessible
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    // Test database connection (Prisma connects lazily, so we'll test with a simple query)
    try {
      // Try a simple query to test connection
      await prisma.$queryRaw`SELECT 1`;
    } catch (connectError: any) {
      console.error("Database connection failed:", connectError);
      console.error("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
      console.error("Error code:", connectError.code);
      console.error("Error name:", connectError.name);
      
      // Check if it's a missing database file error
      if (connectError.message?.includes("no such file") || 
          connectError.message?.includes("ENOENT") ||
          connectError.code === "ENOENT") {
        return NextResponse.json(
          { 
            error: "Database file not found",
            message: "The database file does not exist. Please run 'npm run db:migrate' to create it.",
            hint: "Run: npm run db:migrate && npm run db:seed"
          },
          { status: 503 }
        );
      }
      
      // Check if Prisma client is not generated
      if (connectError.message?.includes("PrismaClient") || 
          connectError.message?.includes("not generated")) {
        return NextResponse.json(
          { 
            error: "Prisma client not generated",
            message: "Prisma client needs to be generated. Run 'npm run db:generate'",
            hint: "Run: npm run db:generate"
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: connectError.message,
          code: connectError.code,
          hint: "Make sure DATABASE_URL is set in .env file and run 'npm run db:migrate' and 'npm run db:seed'"
        },
        { status: 503 }
      );
    }

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

    // Build Prisma query
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

    // Get total count with error handling
    let total: number;
    try {
      total = await prisma.product.count({ where });
    } catch (countError: any) {
      console.error("Error counting products:", countError);
      throw new Error(`Failed to count products: ${countError.message}`);
    }

    // Get products with error handling
    let products: any[];
    try {
      products = await prisma.product.findMany({
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
      });
    } catch (findError: any) {
      console.error("Error finding products:", findError);
      throw new Error(`Failed to fetch products: ${findError.message}`);
    }

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
    // Log full error details for debugging
    console.error("=".repeat(50));
    console.error("❌ ERROR FETCHING PRODUCTS");
    console.error("=".repeat(50));
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    console.error("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
    console.error("Prisma available:", prisma ? "✅ Yes" : "❌ No");
    
    // Try to get more details from Prisma errors
    if (error.code) {
      console.error("Prisma error code:", error.code);
    }
    if (error.meta) {
      console.error("Prisma error meta:", JSON.stringify(error.meta, null, 2));
    }
    console.error("=".repeat(50));
    
    // Determine the specific error type and provide helpful hints
    let errorMessage = "Failed to fetch products";
    let hint = "";
    
    if (error.code === "P1001" || error.message?.includes("Can't reach database server")) {
      errorMessage = "Database server is not reachable";
      hint = "Check if the database file exists and DATABASE_URL is correct";
    } else if (error.code === "P1002" || error.message?.includes("Connection timeout")) {
      errorMessage = "Database connection timeout";
      hint = "The database might be locked or unavailable";
    } else if (error.code === "P1003" || error.message?.includes("Database file")) {
      errorMessage = "Database file not found";
      hint = "Run: npm run db:migrate to create the database";
    } else if (error.message?.includes("PrismaClient") || error.message?.includes("not generated")) {
      errorMessage = "Prisma client not generated";
      hint = "Run: npm run db:generate";
    } else if (error.message?.includes("table") && error.message?.includes("does not exist")) {
      errorMessage = "Database tables not found";
      hint = "Run: npm run db:migrate to create tables, then npm run db:seed to add data";
    } else {
      errorMessage = error.message || "Failed to fetch products";
      hint = "Check server logs for details";
    }
    
    // Return detailed error in development, generic in production
    const isDev = process.env.NODE_ENV === "development";
    
    return NextResponse.json(
      { 
        error: isDev ? errorMessage : "Failed to fetch products",
        message: isDev ? error.message : undefined,
        hint: isDev ? hint : undefined,
        code: isDev ? error.code : undefined,
        ...(isDev && error.stack && { stack: error.stack }),
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

