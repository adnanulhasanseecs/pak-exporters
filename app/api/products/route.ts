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
import productsData from "@/services/mocks/products.json";

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
    let useDatabase = true;
    try {
      // Log connection attempt
      const dbUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;
      if (dbUrl) {
        const urlObj = new URL(dbUrl);
        console.log(`[API] Testing database connection to: ${urlObj.hostname}:${urlObj.port || 'default'}`);
      }
      
      // Try a simple query to test connection
      await prisma.$queryRaw`SELECT 1`;
      console.log("[API] Database connection successful");
    } catch (connectError: any) {
      console.error("[API] Database connection failed:", {
        message: connectError.message,
        code: connectError.code,
        meta: connectError.meta,
        dbUrl: process.env.DATABASE_PRISMA_DATABASE_URL 
          ? "DATABASE_PRISMA_DATABASE_URL is set" 
          : process.env.DATABASE_URL 
          ? "DATABASE_URL is set" 
          : "No database URL found"
      });
      console.warn("Database connection failed, falling back to JSON mock data:", connectError.message);
      useDatabase = false;
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

    // If database is not available, use JSON fallback
    if (!useDatabase) {
      let products = productsData as any[];
      
      // Apply filters
      if (filters.category) {
        products = products.filter((p) => 
          p.category?.slug === filters.category || p.category?.id === filters.category
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter((p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.shortDescription?.toLowerCase().includes(searchLower)
        );
      }
      if (filters.minPrice !== undefined) {
        products = products.filter((p) => p.price?.amount >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter((p) => p.price?.amount <= filters.maxPrice!);
      }
      if (filters.companyId) {
        products = products.filter((p) => p.company?.id === filters.companyId);
      }
      if (filters.verifiedOnly) {
        products = products.filter((p) => p.company?.verified === true);
      }
      if (filters.goldSupplierOnly) {
        products = products.filter((p) => p.company?.goldSupplier === true);
      }
      if (filters.membershipTier) {
        products = products.filter((p) => p.company?.membershipTier === filters.membershipTier);
      }
      if (filters.tags && filters.tags.length > 0) {
        products = products.filter((p) => {
          const productTags = p.tags || [];
          return filters.tags!.some((tag) => productTags.includes(tag));
        });
      }

      // Only show active products
      products = products.filter((p) => p.status !== "inactive");

      // Apply pagination
      const total = products.length;
      const skip = (pagination.page - 1) * pagination.pageSize;
      const paginatedProducts = products.slice(skip, skip + pagination.pageSize);

      // Transform to API format (omit full description for list view)
      const productListItems = paginatedProducts.map((product) => {
        const { description, specifications, ...rest } = product;
        return {
          ...rest,
          description: product.shortDescription || undefined,
        };
      });

      return NextResponse.json({
        products: productListItems,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(total / pagination.pageSize),
      });
    }

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

    // If database is empty, fall back to JSON immediately
    if (total === 0) {
      console.warn("Database has no products (total=0), falling back to JSON mock data");
      // Don't throw - directly use JSON fallback logic
      // Parse search params again for fallback
      const searchParams = request.nextUrl.searchParams;
      let page = parseInt(searchParams.get("page") || "1", 10);
      let pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
      
      // Validate pagination values
      if (!page || page < 1) page = 1;
      if (!pageSize || pageSize < 1) pageSize = 20;
      
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const companyId = searchParams.get("companyId");
      const verifiedOnly = searchParams.get("verifiedOnly");
      const goldSupplierOnly = searchParams.get("goldSupplierOnly");
      const membershipTier = searchParams.get("membershipTier");
      const tags = searchParams.get("tags");

      let products = productsData as any[];
      
      // Apply filters
      if (category) {
        products = products.filter((p) => 
          p.category?.slug === category || p.category?.id === category
        );
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter((p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.shortDescription?.toLowerCase().includes(searchLower)
        );
      }
      if (minPrice) {
        products = products.filter((p) => p.price?.amount >= parseFloat(minPrice));
      }
      if (maxPrice) {
        products = products.filter((p) => p.price?.amount <= parseFloat(maxPrice));
      }
      if (companyId) {
        products = products.filter((p) => p.company?.id === companyId);
      }
      if (verifiedOnly === "true") {
        products = products.filter((p) => p.company?.verified === true);
      }
      if (goldSupplierOnly === "true") {
        products = products.filter((p) => p.company?.goldSupplier === true);
      }
      if (membershipTier) {
        products = products.filter((p) => p.company?.membershipTier === membershipTier);
      }
      if (tags) {
        const tagList = tags.split(",");
        products = products.filter((p) => {
          const productTags = p.tags || [];
          return tagList.some((tag) => productTags.includes(tag));
        });
      }

      // Only show active products
      products = products.filter((p) => p.status !== "inactive");

      // Apply pagination
      const total = products.length;
      const skip = (page - 1) * pageSize;
      const paginatedProducts = products.slice(skip, skip + pageSize);

      // Transform to API format
      const productListItems = paginatedProducts.map((product) => {
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
    console.error("Error fetching products from database, falling back to JSON:", error.message);
    
    // Fallback to JSON mock data on any error
    try {
      const searchParams = new URL(request.url).searchParams;
      let page = parseInt(searchParams.get("page") || "1", 10);
      let pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
      
      // Validate pagination values (same as main path)
      if (!page || page < 1) page = 1;
      if (!pageSize || pageSize < 1) pageSize = 20;
      
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const companyId = searchParams.get("companyId");
      const verifiedOnly = searchParams.get("verifiedOnly");
      const goldSupplierOnly = searchParams.get("goldSupplierOnly");
      const membershipTier = searchParams.get("membershipTier");
      const tags = searchParams.get("tags");

      let products = productsData as any[];
      
      // Apply filters
      if (category) {
        products = products.filter((p) => 
          p.category?.slug === category || p.category?.id === category
        );
      }
      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter((p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.shortDescription?.toLowerCase().includes(searchLower)
        );
      }
      if (minPrice) {
        products = products.filter((p) => p.price?.amount >= parseFloat(minPrice));
      }
      if (maxPrice) {
        products = products.filter((p) => p.price?.amount <= parseFloat(maxPrice));
      }
      if (companyId) {
        products = products.filter((p) => p.company?.id === companyId);
      }
      if (verifiedOnly === "true") {
        products = products.filter((p) => p.company?.verified === true);
      }
      if (goldSupplierOnly === "true") {
        products = products.filter((p) => p.company?.goldSupplier === true);
      }
      if (membershipTier) {
        products = products.filter((p) => p.company?.membershipTier === membershipTier);
      }
      if (tags) {
        const tagList = tags.split(",");
        products = products.filter((p) => {
          const productTags = p.tags || [];
          return tagList.some((tag) => productTags.includes(tag));
        });
      }

      // Only show active products
      products = products.filter((p) => p.status !== "inactive");

      // Apply pagination
      const total = products.length;
      const skip = (page - 1) * pageSize;
      const paginatedProducts = products.slice(skip, skip + pageSize);

      // Transform to API format
      const productListItems = paginatedProducts.map((product) => {
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
    } catch (fallbackError: any) {
      console.error("Error in JSON fallback:", fallbackError);
      return NextResponse.json(
        { 
          error: "Failed to fetch products",
          message: process.env.NODE_ENV === "development" ? fallbackError.message : undefined,
        },
        { status: 500 }
      );
    }
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

