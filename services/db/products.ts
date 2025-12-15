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
  // STEP 1: Diagnostic logging to prove function runs and database connection
  console.log("[getProductsFromDb] Function called");
  console.log("[getProductsFromDb] NODE_ENV:", process.env.NODE_ENV || "not set");
  
  // Log database host (never credentials)
  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log("[getProductsFromDb] DB host:", dbUrl.hostname);
      console.log("[getProductsFromDb] DB port:", dbUrl.port || "default");
    } catch (e) {
      console.log("[getProductsFromDb] DB URL format:", process.env.DATABASE_URL.substring(0, 50) + "...");
    }
  } else {
    console.error("[getProductsFromDb] DATABASE_URL is NOT set!");
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("[getProductsFromDb] Database connection test: SUCCESS");
    
    // STEP 3: Verify schema alignment - check if Product table exists and its structure
    try {
      // Check if Product table exists (PostgreSQL)
      // Note: Prisma migrations create PascalCase tables: "Product", "Category", "Company", etc.
      const tableCheck = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('Product', 'product', 'products', 'Products')
        ORDER BY table_name
      `;
      console.log("[getProductsFromDb] Schema check - Found tables:", tableCheck);
      
      if (tableCheck.length === 0) {
        console.error("[getProductsFromDb] CRITICAL: Product table does NOT exist! Migrations may not have been applied.");
      } else {
        const actualTableName = tableCheck[0].table_name;
        console.log("[getProductsFromDb] Schema check - Actual table name:", actualTableName);
        
        // Check Product table columns
        const columnCheck = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${actualTableName}
          ORDER BY ordinal_position
          LIMIT 10
        `;
        console.log("[getProductsFromDb] Schema check - Product table columns:", columnCheck);
      }
    } catch (schemaError: any) {
      console.warn("[getProductsFromDb] Schema check failed (may not be PostgreSQL):", schemaError.message);
    }
    
    // STEP 4: Verify migrations have been applied
    try {
      // Check if _prisma_migrations table exists (Prisma tracks migrations here)
      const migrationCheck = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: string | null }>>`
        SELECT migration_name, finished_at
        FROM _prisma_migrations
        ORDER BY started_at DESC
        LIMIT 5
      `;
      console.log("[getProductsFromDb] Migration check - Applied migrations:", migrationCheck);
      
      if (migrationCheck.length === 0) {
        console.error("[getProductsFromDb] CRITICAL: No migrations found in _prisma_migrations table. Migrations may not have been applied to production database.");
      } else {
        const pendingMigrations = migrationCheck.filter(m => m.finished_at === null);
        if (pendingMigrations.length > 0) {
          console.error("[getProductsFromDb] WARNING: Found pending migrations:", pendingMigrations);
        } else {
          console.log("[getProductsFromDb] Migration check - All migrations appear to be applied");
        }
      }
    } catch (migrationError: any) {
      console.warn("[getProductsFromDb] Migration check failed:", migrationError.message);
      console.warn("[getProductsFromDb] This may indicate migrations have not been applied to the production database.");
    }
  } catch (error: any) {
    console.error("[getProductsFromDb] Database connection test: FAILED", error.message);
    console.warn("[getProductsFromDb] Database not available, using JSON fallback:", error.message);
    // Fall back to JSON mock data
    return getProductsFromJson(filters, pagination);
  }

  try {
    // STEP 2: TEMPORARILY BYPASS ALL FILTERS to prove if ANY products exist
    // This is a diagnostic query - will be removed after diagnosis
    console.log("[getProductsFromDb] Running diagnostic query: prisma.product.findMany({ take: 5 })");
    const diagnosticProducts = await prisma.product.findMany({ take: 5 });
    console.log("[getProductsFromDb] Diagnostic query result:", {
      count: diagnosticProducts.length,
      ids: diagnosticProducts.map(p => p.id),
      names: diagnosticProducts.map(p => p.name),
    });

    // If diagnostic query returns 0, the database is empty or schema mismatch
    if (diagnosticProducts.length === 0) {
      console.error("[getProductsFromDb] DIAGNOSIS: Database has ZERO products. This is a DB/schema/migration issue.");
      // Still return empty result instead of falling back to JSON
      return {
        products: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    }

    // If diagnostic query returns products, continue with normal filtered query
    console.log("[getProductsFromDb] Diagnostic query SUCCESS: Found products. Proceeding with filtered query.");

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

    console.log("[getProductsFromDb] Filtered query where clause:", JSON.stringify(where, null, 2));

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

    console.log("[getProductsFromDb] Filtered query result:", {
      productsFound: products.length,
      totalCount: total,
    });

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
    console.error("[getProductsFromDb] Error stack:", error.stack);
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

