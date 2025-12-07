import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchCategories, fetchCategoryTree, fetchCategoryBySlug, fetchCategory } from "./categories";
import categoriesMockData from "@/services/mocks/categories.json";

// Mock fetch globally
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  
  // Default mock response for fetchCategories
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => categoriesMockData,
  });
});

describe("fetchCategories", () => {
  it("should return all categories", async () => {
    const result = await fetchCategories();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("slug");
  });

  it("should return categories with correct structure", async () => {
    const result = await fetchCategories();
    result.forEach((category) => {
      expect(category).toHaveProperty("id");
      expect(category).toHaveProperty("name");
      expect(category).toHaveProperty("slug");
      expect(typeof category.id).toBe("string");
      expect(typeof category.name).toBe("string");
      expect(typeof category.slug).toBe("string");
    });
  });
});

describe("fetchCategoryTree", () => {
  it("should return category tree with categories and total", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        categories: categoriesMockData,
        total: categoriesMockData.length,
      }),
    });

    const result = await fetchCategoryTree();
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.categories)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBe(categoriesMockData.length);
  });

  it("should return all categories in tree", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        categories: categoriesMockData,
        total: categoriesMockData.length,
      }),
    });

    const result = await fetchCategoryTree();
    expect(result.categories.length).toBe(categoriesMockData.length);
  });
});

describe("fetchCategoryBySlug", () => {
  it("should return category for valid slug", async () => {
    const firstCategory = categoriesMockData[0] as { slug: string };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => firstCategory,
    });

    const result = await fetchCategoryBySlug(firstCategory.slug);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("slug");
    expect(result.slug).toBe(firstCategory.slug);
  });

  it("should throw error for invalid slug", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Category not found" }),
    });

    await expect(fetchCategoryBySlug("non-existent-slug")).rejects.toThrow();
  });

  it("should return correct category for known slug", async () => {
    const textilesCategory = categoriesMockData.find(
      (c) => (c as { slug: string }).slug === "textiles-apparel"
    );
    if (textilesCategory) {
      const result = await fetchCategoryBySlug("textiles-apparel");
      expect(result.slug).toBe("textiles-apparel");
    }
  });
});

describe("fetchCategory", () => {
  it("should return category for valid ID", async () => {
    const firstCategory = categoriesMockData[0] as { id: string };
    const result = await fetchCategory(firstCategory.id);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty("id");
    expect(result?.id).toBe(firstCategory.id);
  });

  it("should return null for invalid ID", async () => {
    const result = await fetchCategory("non-existent-id");
    expect(result).toBeNull();
  });

  it("should return correct category for known ID", async () => {
    const firstCategory = categoriesMockData[0] as { id: string; name: string };
    const result = await fetchCategory(firstCategory.id);
    expect(result).not.toBeNull();
    expect(result?.name).toBe(firstCategory.name);
  });
});

