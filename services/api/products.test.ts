import { describe, it, expect, vi } from "vitest";
import { fetchProducts, fetchProduct, searchProducts } from "./products";
import type { ProductFilters } from "@/types/product";

// Mock the delay function
vi.mock("./products", async () => {
  const actual = await vi.importActual("./products");
  return {
    ...actual,
  };
});

describe("fetchProducts", () => {
  it("should return products list", async () => {
    const result = await fetchProducts();
    expect(result).toHaveProperty("products");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(result).toHaveProperty("totalPages");
    expect(Array.isArray(result.products)).toBe(true);
  });

  it("should filter by category", async () => {
    const filters: ProductFilters = { category: "textiles-apparel" };
    const result = await fetchProducts(filters);
    expect(result.products.every((p) => p.category.slug === "textiles-apparel")).toBe(true);
  });

  it("should filter by search query", async () => {
    const filters: ProductFilters = { search: "tablecloth" };
    const result = await fetchProducts(filters);
    expect(result.products.length).toBeGreaterThan(0);
  });

  it("should paginate results", async () => {
    const result1 = await fetchProducts(undefined, { page: 1, pageSize: 2 });
    const result2 = await fetchProducts(undefined, { page: 2, pageSize: 2 });
    expect(result1.products.length).toBeLessThanOrEqual(2);
    expect(result2.products.length).toBeLessThanOrEqual(2);
    expect(result1.page).toBe(1);
    expect(result2.page).toBe(2);
  });

  it("should filter by companyId", async () => {
    const filters: ProductFilters = { companyId: "1" };
    const result = await fetchProducts(filters);
    expect(result.products.every((p) => p.company.id === "1")).toBe(true);
  });
});

describe("fetchProduct", () => {
  it("should return a single product", async () => {
    const product = await fetchProduct("1");
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
  });

  it("should throw error for non-existent product", async () => {
    await expect(fetchProduct("non-existent")).rejects.toThrow();
  });
});

describe("searchProducts", () => {
  it("should return matching products", async () => {
    const results = await searchProducts("tablecloth");
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("should return empty array for no matches", async () => {
    const results = await searchProducts("nonexistentproduct12345");
    expect(results).toEqual([]);
  });
});

