/**
 * Categories API Route
 * GET /api/categories - List all categories
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import categoriesData from "@/services/mocks/categories.json";

// Transform database category to API format
function transformCategory(category: any): any {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    image: category.image || undefined,
    icon: category.icon || undefined,
    parentId: category.parentId || undefined,
    children: category.children?.map(transformCategory) || undefined,
    productCount: category.productCount,
    level: category.level,
    order: category.order,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    let useDatabase = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError: any) {
      console.warn("Database connection failed, falling back to JSON mock data:", dbError.message);
      useDatabase = false;
    }

    const searchParams = request.nextUrl.searchParams;
    const tree = searchParams.get("tree") === "true";

    // If database is not available, use JSON fallback
    if (!useDatabase) {
      const categories = categoriesData as any[];
      
      if (tree) {
        // Build tree structure (only root categories with children)
        const rootCategories = categories.filter((cat: any) => !cat.parentId);
        return NextResponse.json({
          categories: rootCategories,
          total: categories.length,
        });
      } else {
        // Return flat list sorted by level and order
        const sortedCategories = [...categories].sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return (a.order || 0) - (b.order || 0);
        });
        return NextResponse.json(sortedCategories);
      }
    }

    // Use database
    if (tree) {
      // Return category tree with parent-child relationships
      const allCategories = await prisma.category.findMany({
        include: {
          children: true,
        },
        orderBy: [
          { level: "asc" },
          { order: "asc" },
        ],
      });

      // If database is empty, fall back to JSON
      if (allCategories.length === 0) {
        console.warn("Database has no categories, falling back to JSON mock data");
        const categories = categoriesData as any[];
        const rootCategories = categories.filter((cat: any) => !cat.parentId);
        return NextResponse.json({
          categories: rootCategories,
          total: categories.length,
        });
      }

      // Build tree structure (only root categories with children)
      const rootCategories = allCategories.filter((cat: any) => !cat.parentId);
      const categoryTree = rootCategories.map(transformCategory);

      return NextResponse.json({
        categories: categoryTree,
        total: allCategories.length,
      });
    } else {
      // Return flat list
      const categories = await prisma.category.findMany({
        orderBy: [
          { level: "asc" },
          { order: "asc" },
        ],
      });

      // If database is empty, fall back to JSON
      if (categories.length === 0) {
        console.warn("Database has no categories, falling back to JSON mock data");
        const categoriesFromJson = categoriesData as any[];
        const sortedCategories = [...categoriesFromJson].sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return (a.order || 0) - (b.order || 0);
        });
        return NextResponse.json(sortedCategories);
      }

      return NextResponse.json(categories.map(transformCategory));
    }
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    
    // Fallback to JSON on any error
    try {
      const categories = categoriesData as any[];
      const sortedCategories = [...categories].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return (a.order || 0) - (b.order || 0);
      });
      return NextResponse.json(sortedCategories);
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: "Failed to fetch categories", 
          message: process.env.NODE_ENV === "development" 
            ? error.message 
            : "An error occurred while fetching categories"
        },
        { status: 500 }
      );
    }
  }
}

