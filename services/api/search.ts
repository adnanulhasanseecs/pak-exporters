/**
 * Mock Search API Service
 * This service handles search-related API calls with autocomplete and suggestions
 */

import { delay } from "./utils";
import { fetchProducts } from "./products";
import { fetchCompanies } from "./companies";
import type { Product } from "@/types/product";
import type { Company } from "@/types/company";

export interface SearchResult {
  products: Product[];
  companies: Company[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }>;
  total: number;
}

export interface SearchSuggestion {
  type: "product" | "company" | "category";
  text: string;
  url: string;
  count?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  resultCount: number;
}

/**
 * Perform a search across products, companies, and categories
 */
export async function search(
  query: string,
  options?: {
    limit?: number;
    categoryId?: string;
    companyId?: string;
  }
): Promise<SearchResult> {
  await delay(400);

  const limit = options?.limit || 20;
  const searchQuery = query.toLowerCase().trim();

  if (!searchQuery) {
    return {
      products: [],
      companies: [],
      categories: [],
      total: 0,
    };
  }

  // Search products
  const { products } = await fetchProducts({
    search: searchQuery,
    limit,
    categoryId: options?.categoryId,
    companyId: options?.companyId,
  });

  // Search companies
  const { companies } = await fetchCompanies({
    search: searchQuery,
    limit: Math.floor(limit / 2),
  });

  // Search categories (mock - would come from categories API)
  const categories: SearchResult["categories"] = [];
  if (searchQuery.length >= 3) {
    // Mock category matches
    const categoryKeywords = [
      { name: "Apparel & Clothing", keywords: ["apparel", "clothing", "textile", "garment"] },
      { name: "Leather Products", keywords: ["leather", "bag", "wallet", "belt"] },
      { name: "Sports Equipment", keywords: ["sports", "equipment", "cricket", "football"] },
    ];

    categoryKeywords.forEach((cat) => {
      if (cat.keywords.some((kw) => searchQuery.includes(kw))) {
        categories.push({
          id: `cat-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, "-"),
          productCount: Math.floor(Math.random() * 100),
        });
      }
    });
  }

  const total = products.length + companies.length + categories.length;

  // Save to search history
  if (typeof window !== "undefined") {
    const history: SearchHistoryItem[] = JSON.parse(
      localStorage.getItem("search-history") || "[]"
    );
    history.unshift({
      query: searchQuery,
      timestamp: new Date().toISOString(),
      resultCount: total,
    });
    // Keep only last 20 searches
    const trimmedHistory = history.slice(0, 20);
    localStorage.setItem("search-history", JSON.stringify(trimmedHistory));
  }

  return {
    products,
    companies,
    categories,
    total,
  };
}

/**
 * Get search suggestions/autocomplete
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<SearchSuggestion[]> {
  await delay(200);

  const searchQuery = query.toLowerCase().trim();

  if (!searchQuery || searchQuery.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];

  // Get products matching query
  const { products } = await fetchProducts({
    search: searchQuery,
    limit: Math.floor(limit / 2),
  });

  products.forEach((product) => {
    suggestions.push({
      type: "product",
      text: product.name,
      url: `/products/${product.id}`,
    });
  });

  // Get companies matching query
  const { companies } = await fetchCompanies({
    search: searchQuery,
    limit: Math.floor(limit / 2),
  });

  companies.forEach((company) => {
    suggestions.push({
      type: "company",
      text: company.name,
      url: `/company/${company.id}`,
    });
  });

  // Add category suggestions
  if (searchQuery.length >= 3) {
    const categoryMatches = [
      { name: "Apparel & Clothing", slug: "apparel-clothing" },
      { name: "Leather Products", slug: "leather-products" },
      { name: "Sports Equipment", slug: "sports-equipment" },
    ].filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery) ||
      cat.slug.includes(searchQuery)
    );

    categoryMatches.forEach((cat) => {
      suggestions.push({
        type: "category",
        text: cat.name,
        url: `/category/${cat.slug}`,
      });
    });
  }

  return suggestions.slice(0, limit);
}

/**
 * Get search history
 */
export async function getSearchHistory(limit: number = 10): Promise<SearchHistoryItem[]> {
  await delay(100);

  if (typeof window !== "undefined") {
    const history: SearchHistoryItem[] = JSON.parse(
      localStorage.getItem("search-history") || "[]"
    );
    return history.slice(0, limit);
  }

  return [];
}

/**
 * Clear search history
 */
export async function clearSearchHistory(): Promise<void> {
  await delay(100);

  if (typeof window !== "undefined") {
    localStorage.removeItem("search-history");
  }
}

/**
 * Get popular searches
 */
export async function getPopularSearches(limit: number = 10): Promise<string[]> {
  await delay(200);

  // Mock popular searches
  return [
    "cotton t-shirts",
    "leather jackets",
    "sports equipment",
    "textile products",
    "cricket bats",
    "surgical instruments",
    "handicrafts",
    "rice",
    "fruits",
    "spices",
  ].slice(0, limit);
}

/**
 * Get trending searches
 */
export async function getTrendingSearches(limit: number = 10): Promise<string[]> {
  await delay(200);

  // Mock trending searches (would be based on recent activity)
  return [
    "winter clothing",
    "export quality",
    "bulk orders",
    "custom manufacturing",
    "organic products",
  ].slice(0, limit);
}

