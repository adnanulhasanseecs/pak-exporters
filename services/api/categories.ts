/**
 * Categories API Service
 * Real implementation using Next.js API routes
 */

import type { Category, CategoryTree } from "@/types/category";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildApiUrl } from "@/lib/api-client";

/**
 * Get the API URL - always uses buildApiUrl for absolute URLs
 * Node.js fetch() requires absolute URLs, so we use buildApiUrl which now
 * correctly uses APP_CONFIG.url (includes correct port 3001)
 */
function getApiUrl(endpoint: string): string {
  // Always use buildApiUrl - it now correctly uses APP_CONFIG.url as fallback
  return buildApiUrl(endpoint);
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(getApiUrl(API_ENDPOINTS.categories), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch categories");
    } else {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Fetch category tree
 */
export async function fetchCategoryTree(): Promise<CategoryTree> {
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.categories}?tree=true`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch category tree");
    } else {
      throw new Error(`Failed to fetch category tree: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Fetch a single category by slug
 */
export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.categories}/${slug}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Category with slug ${slug} not found`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch category");
    } else {
      throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Fetch a single category by ID
 */
export async function fetchCategory(id: string): Promise<Category | null> {
  // First try to get all categories and find by ID
  // (API doesn't have /categories/[id] endpoint, only /categories/[slug])
  const categories = await fetchCategories();
  const category = categories.find((c) => c.id === id);
  return category || null;
}
