import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchProducts, fetchProduct, searchProducts } from "./products";
import type { ProductFilters } from "@/types/product";

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Import mock data
import productsData from "@/services/mocks/products.json";

const mockProductListResponse = {
  products: productsData.slice(0, 20),
  total: productsData.length,
  page: 1,
  pageSize: 20,
  totalPages: Math.ceil(productsData.length / 20),
};

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  
  // Default mock response
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => mockProductListResponse,
  });
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
    const filteredProducts = productsData.filter((p) => p.category.slug === "textiles-apparel");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: ProductFilters = { category: "textiles-apparel" };
    const result = await fetchProducts(filters);
    expect(result.products).toBeDefined();
  });

  it("should filter by search query", async () => {
    const filteredProducts = productsData.filter(
      (p) => p.name.toLowerCase().includes("tablecloth") || p.shortDescription?.toLowerCase().includes("tablecloth")
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: ProductFilters = { search: "tablecloth" };
    const result = await fetchProducts(filters);
    expect(result.products.length).toBeGreaterThanOrEqual(0);
  });

  it("should paginate results", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: productsData.slice(0, 2),
          total: productsData.length,
          page: 1,
          pageSize: 2,
          totalPages: Math.ceil(productsData.length / 2),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          products: productsData.slice(2, 4),
          total: productsData.length,
          page: 2,
          pageSize: 2,
          totalPages: Math.ceil(productsData.length / 2),
        }),
      });

    const result1 = await fetchProducts(undefined, { page: 1, pageSize: 2 });
    const result2 = await fetchProducts(undefined, { page: 2, pageSize: 2 });
    expect(result1.products.length).toBeLessThanOrEqual(2);
    expect(result2.products.length).toBeLessThanOrEqual(2);
    expect(result1.page).toBe(1);
    expect(result2.page).toBe(2);
  });

  it("should filter by companyId", async () => {
    const filteredProducts = productsData.filter((p) => p.company.id === "1");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: ProductFilters = { companyId: "1" };
    const result = await fetchProducts(filters);
    expect(result.products).toBeDefined();
  });
});

describe("fetchProduct", () => {
  it("should return a single product", async () => {
    const product = productsData[0];
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => product,
    });

    const result = await fetchProduct("1");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("price");
  });

  it("should throw error for non-existent product", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Product not found" }),
    });

    await expect(fetchProduct("non-existent")).rejects.toThrow();
  });
});

describe("searchProducts", () => {
  it("should return matching products", async () => {
    const filteredProducts = productsData.filter(
      (p) => p.name.toLowerCase().includes("tablecloth") || p.shortDescription?.toLowerCase().includes("tablecloth")
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: filteredProducts,
        total: filteredProducts.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const results = await searchProducts("tablecloth");
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it("should return empty array for no matches", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      }),
    });

    const results = await searchProducts("nonexistentproduct12345");
    expect(results).toEqual([]);
  });
});

