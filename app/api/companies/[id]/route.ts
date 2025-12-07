/**
 * Single Company API Route
 * GET /api/companies/[id] - Get a single company
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
function transformCompany(company: any) {
  return {
    id: company.id,
    name: company.name,
    description: company.description,
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
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        companyCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transformCompany(company));
  } catch (error: any) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company", message: error.message },
      { status: 500 }
    );
  }
}

