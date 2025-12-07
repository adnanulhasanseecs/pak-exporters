/**
 * Categories API Route
 * GET /api/categories - List all categories
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const searchParams = request.nextUrl.searchParams;
    const tree = searchParams.get("tree") === "true";

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

      // Build tree structure (only root categories with children)
      const rootCategories = allCategories.filter((cat) => !cat.parentId);
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

      return NextResponse.json(categories.map(transformCategory));
    }
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", message: error.message },
      { status: 500 }
    );
  }
}

