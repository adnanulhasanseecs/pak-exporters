/**
 * Direct Database Queries for Categories
 * For use in Server Components - bypasses HTTP API layer
 */

import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/category";
import categoriesData from "@/services/mocks/categories.json";

// Transform database category to API format
function transformCategory(category: any): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    image: category.image || undefined,
    icon: category.icon || undefined,
    parentId: category.parentId || undefined,
    children: category.children?.map(transformCategory) || [],
    productCount: category.productCount || 0,
    level: category.level || 0,
    order: category.order || 0,
  };
}

/**
 * Fetch categories directly from database (for Server Components)
 */
export async function getCategoriesFromDb(): Promise<Category[]> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    console.warn("[getCategoriesFromDb] Database not available, using JSON fallback:", error.message);
    // Fall back to JSON mock data
    return getCategoriesFromJson();
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        parent: true,
      },
      orderBy: [
        { level: "asc" },
        { order: "asc" },
        { name: "asc" },
      ],
    });

    // Build category tree
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create all categories
    for (const cat of categories) {
      categoryMap.set(cat.id, transformCategory(cat));
    }

    // Second pass: build tree structure
    for (const cat of categories) {
      const transformed = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(transformed);
        }
      } else {
        rootCategories.push(transformed);
      }
    }

    return rootCategories.length > 0 ? rootCategories : categories.map(transformCategory);
  } catch (error: any) {
    console.error("[getCategoriesFromDb] Error fetching categories:", error);
    // Fall back to JSON mock data
    return getCategoriesFromJson();
  }
}

/**
 * Fallback: Get categories from JSON mock data
 */
function getCategoriesFromJson(): Category[] {
  // Mock data is flat, so return as-is
  return categoriesData.map((cat: any) => ({
    ...cat,
    children: [],
    icon: undefined,
    parentId: undefined,
  })) as Category[];
}

