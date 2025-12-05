import type { Category, CategoryTree } from "@/types/category";
import categoriesMockData from "@/services/mocks/categories.json";

/**
 * Mock delay to simulate API call
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  await delay(200);
  return categoriesMockData as Category[];
}

/**
 * Fetch category tree
 */
export async function fetchCategoryTree(): Promise<CategoryTree> {
  await delay(200);
  return {
    categories: categoriesMockData as Category[],
    total: categoriesMockData.length,
  };
}

/**
 * Fetch a single category by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  await delay(200);

  const category = categoriesMockData.find((c) => c.slug === slug);

  if (!category) {
    throw new Error(`Category with slug ${slug} not found`);
  }

  return category as Category;
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategory(id: string): Promise<Category | null> {
  await delay(200);

  const category = categoriesMockData.find((c) => c.id === id);

  return (category as Category) || null;
}

