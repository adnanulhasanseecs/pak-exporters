/**
 * Direct Database Queries for Products
 * For use in Server Components - bypasses HTTP API layer
 */

import { prisma } from "@/lib/prisma";
import type { ProductFilters, ProductListResponse } from "@/types/product";
import type { PaginationParams } from "@/types/api";
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
    salesData: parseJsonField<{ soldLast7Days?: number; totalSold?: number; viewsLast7Days?: number }>(product.salesData),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

/**
 * Fetch products directly from database (for Server Components)
 */
export async function getProductsFromDb(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ProductListResponse> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    console.warn("[getProductsFromDb] Database not available, using JSON fallback:", error.message);
    // Fall back to JSON mock data
    return getProductsFromJson(filters, pagination);
  }

  try {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      status: "active",
    };

    if (filters?.category) {
      where.category = {
        OR: [
          { slug: filters.category },
          { id: filters.category },
        ],
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { shortDescription: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.priceAmount = {};
      if (filters.minPrice !== undefined) {
        where.priceAmount.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.priceAmount.lte = filters.maxPrice;
      }
    }

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.verifiedOnly) {
      where.company = { verified: true };
    }

    if (filters?.goldSupplierOnly) {
      where.company = { ...where.company, goldSupplier: true };
    }

    if (filters?.membershipTier) {
      where.company = { ...where.company, membershipTier: filters.membershipTier };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          company: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = products.map(transformProduct);
    const totalPages = Math.ceil(total / pageSize);

    return {
      products: transformedProducts as any,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (error: any) {
    console.error("[getProductsFromDb] Error fetching products:", error);
    // Fall back to JSON mock data
    return getProductsFromJson(filters, pagination);
  }
}

/**
 * Fallback: Get products from JSON mock data
 */
function getProductsFromJson(
  filters?: ProductFilters,
  pagination?: PaginationParams
): ProductListResponse {
  let products = productsData as any[];

  // Apply filters
  if (filters?.category) {
    products = products.filter((p) =>
      p.category?.slug === filters.category || p.category?.id === filters.category
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.shortDescription?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.minPrice !== undefined) {
    products = products.filter((p) => p.price?.amount >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    products = products.filter((p) => p.price?.amount <= filters.maxPrice!);
  }

  // Pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const skip = (page - 1) * pageSize;
  const total = products.length;
  const paginatedProducts = products.slice(skip, skip + pageSize);
  const totalPages = Math.ceil(total / pageSize);

  return {
    products: paginatedProducts as any,
    total,
    page,
    pageSize,
    totalPages,
  };
}

