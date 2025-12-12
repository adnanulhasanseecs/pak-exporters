/**
 * Companies API Route
 * GET /api/companies - List companies with filters and pagination
 * POST /api/companies - Create a new company (requires authentication)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CompanyFilters } from "@/types/company";
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

// Transform database company to API format
function transformCompany(company: any, includeDescription = false) {
  const base = {
    id: company.id,
    name: company.name,
    logo: company.logo || undefined,
    coverImage: company.coverImage || undefined,
    verified: company.verified,
    goldSupplier: company.goldSupplier,
    membershipTier: company.membershipTier || undefined,
    trustScore: company.trustScore || undefined,
    location: {
      city: company.city,
      province: company.province,
      country: company.country,
    },
    contact: {
      email: company.email,
      phone: company.phone || undefined,
      website: company.website || undefined,
    },
    categories: company.companyCategories?.map((cc: any) => ({
      id: cc.category.id,
      name: cc.category.name,
      slug: cc.category.slug,
    })) || [],
    productCount: company.productCount,
    yearEstablished: company.yearEstablished || undefined,
    employeeCount: company.employeeCount || undefined,
    certifications: parseJsonField<string[]>(company.certifications),
    mainProducts: parseJsonField<string[]>(company.mainProducts),
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };

  if (includeDescription) {
    return {
      ...base,
      description: company.description,
    };
  }

  return {
    ...base,
    shortDescription: company.description?.substring(0, 200) || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters
    const filters: CompanyFilters = {};
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const province = searchParams.get("province");
    const verifiedOnly = searchParams.get("verifiedOnly");
    const goldSupplierOnly = searchParams.get("goldSupplierOnly");
    const minTrustScore = searchParams.get("minTrustScore");

    if (category) filters.category = category;
    if (search) filters.search = search;
    if (city) filters.location = { ...filters.location, city };
    if (province) filters.location = { ...filters.location, province };
    if (verifiedOnly === "true") filters.verifiedOnly = true;
    if (goldSupplierOnly === "true") filters.goldSupplierOnly = true;
    if (minTrustScore) filters.minTrustScore = parseInt(minTrustScore);

    // Parse pagination
    const pagination: PaginationParams = {
      page: parseInt(searchParams.get("page") || "1"),
      pageSize: parseInt(searchParams.get("pageSize") || "20"),
    };

    // Build Prisma query
    const where: any = {};

    // Category filter
    if (filters.category) {
      where.companyCategories = {
        some: {
          category: {
            OR: [
              { slug: filters.category },
              { id: filters.category },
            ],
          },
        },
      };
    }

    // Search filter
    if (filters.search) {
      // PostgreSQL supports case-insensitive mode
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Location filters
    // PostgreSQL supports case-insensitive mode
    if (filters.location?.city) {
      where.city = { contains: filters.location.city, mode: "insensitive" };
    }
    if (filters.location?.province) {
      where.province = { contains: filters.location.province, mode: "insensitive" };
    }

    // Verification filters
    if (filters.verifiedOnly) where.verified = true;
    if (filters.goldSupplierOnly) where.goldSupplier = true;
    if (filters.minTrustScore !== undefined) {
      where.trustScore = { gte: filters.minTrustScore };
    }

    // Pagination
    const page = pagination.page || 1;
    const pageSize = pagination.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Get total count
    const total = await prisma.company.count({ where });

    // Get companies
    const companies = await prisma.company.findMany({
      where,
      skip,
      take,
      include: {
        companyCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to API format
    const transformedCompanies = companies.map((company: any) => transformCompany(company, false));

    return NextResponse.json({
      companies: transformedCompanies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require supplier or admin role
    const authResult = await requireRole(request, ["supplier", "admin"]);
    if (authResult.response) {
      return authResult.response;
    }
    const { user } = authResult;

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, email" },
        { status: 400 }
      );
    }

    // Check if company with email already exists
    const existingCompany = await prisma.company.findFirst({
      where: { email: body.email.toLowerCase() },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this email already exists" },
        { status: 409 }
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name: body.name,
        description: body.description,
        email: body.email.toLowerCase(),
        phone: body.phone || null,
        website: body.website || null,
        city: body.city || "Unknown",
        province: body.province || "Unknown",
        country: body.country || "Pakistan",
        logo: body.logo || null,
        coverImage: body.coverImage || null,
        yearEstablished: body.yearEstablished || null,
        employeeCount: body.employeeCount || null,
        certifications: body.certifications ? JSON.stringify(body.certifications) : null,
        mainProducts: body.mainProducts ? JSON.stringify(body.mainProducts) : null,
        verified: false,
        goldSupplier: false,
        productCount: 0,
      },
      include: {
        companyCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Link company to user if supplier
    if (user.role === "supplier" && !user.companyId) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { companyId: company.id },
      });
    }

    // Link categories if provided
    if (body.categoryIds && Array.isArray(body.categoryIds) && body.categoryIds.length > 0) {
      for (const categoryId of body.categoryIds) {
        await prisma.companyCategory.create({
          data: {
            companyId: company.id,
            categoryId: categoryId,
          },
        });
      }
    }

    // Reload company with categories
    const companyWithCategories = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        companyCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(transformCompany(companyWithCategories!, true), { status: 201 });
  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company", message: error.message },
      { status: 500 }
    );
  }
}
