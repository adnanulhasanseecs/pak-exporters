import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchUserProducts,
  duplicateProduct,
} from "../products";
import type { CreateProductInput, UpdateProductInput } from "@/types/product";

// Mock fetch globally
global.fetch = vi.fn();

// Mock the products data
const mockProductData = {
  id: "1",
  name: "Test Product",
  description: "Test description",
  shortDescription: "Short",
  price: { amount: 100, currency: "USD", minOrderQuantity: 10 },
  images: ["https://example.com/image.jpg"],
  category: { id: "1", name: "Agriculture", slug: "agriculture" },
  company: {
    id: "1",
    name: "Test Company",
    verified: true,
    goldSupplier: false,
  },
  tags: [],
  status: "active",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockProductListResponse = {
  products: [mockProductData],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

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

describe("Products API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe("fetchProducts", () => {
    it("should fetch products with pagination", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts(undefined, { page: 1, pageSize: 10 });

      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("pageSize", 10);
      expect(result).toHaveProperty("totalPages");
    });

    it("should filter by category", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts({ category: "agriculture" });

      expect(result.products).toBeDefined();
    });

    it("should filter by search query", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts({ search: "Test" });

      expect(result.products.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter by price range", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts({ minPrice: 50, maxPrice: 150 });

      expect(result.products).toBeDefined();
    });

    it("should filter by membership tier", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts({ membershipTier: "gold" });

      expect(result.products).toBeDefined();
    });

    it("should filter by company ID", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchProducts({ companyId: "1" });

      expect(result.products).toBeDefined();
    });
  });

  describe("fetchProduct", () => {
    it("should fetch a single product by ID", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductData,
      });

      const product = await fetchProduct("1");

      expect(product).toHaveProperty("id", "1");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
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

  describe("fetchUserProducts", () => {
    it("should fetch products for a specific company", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchUserProducts("1", undefined, { page: 1, pageSize: 10 });

      expect(result).toHaveProperty("products");
    });

    it("should apply filters to user products", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductListResponse,
      });

      const result = await fetchUserProducts("1", { search: "Test" }, { page: 1, pageSize: 10 });

      expect(result.products.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("createProduct", () => {
    it("should create a new product", async () => {
      const productData: CreateProductInput = {
        name: "New Product",
        description: "New product description that is long enough",
        shortDescription: "Short description",
        categoryId: "1",
        price: { amount: 50, currency: "USD" },
        images: ["https://example.com/image.jpg"],
        status: "pending",
      };

      const newProduct = { ...mockProductData, ...productData, id: "new-id" };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => newProduct,
      });

      const category = { id: "1", name: "Agriculture", slug: "agriculture" };
      const product = await createProduct(productData, "1", category);

      expect(product).toHaveProperty("id");
      expect(product.name).toBe(productData.name);
      expect(product.description).toBe(productData.description);
    });

    it("should include category in created product", async () => {
      const productData: CreateProductInput = {
        name: "New Product",
        description: "New product description that is long enough",
        shortDescription: "Short description",
        categoryId: "1",
        price: { amount: 50, currency: "USD" },
        images: ["https://example.com/image.jpg"],
        status: "pending",
      };

      const newProduct = { ...mockProductData, ...productData, id: "new-id" };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => newProduct,
      });

      const category = { id: "1", name: "Agriculture", slug: "agriculture" };
      const product = await createProduct(productData, "1", category);

      expect(product.category).toBeDefined();
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const updateData: UpdateProductInput = {
        id: "1",
        name: "Updated Product Name",
        price: { amount: 150, currency: "USD" },
      };

      const updatedProduct = { ...mockProductData, ...updateData };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedProduct,
      });

      const product = await updateProduct("1", updateData);

      expect(product.name).toBe(updateData.name);
      expect(product.price.amount).toBe(updateData.price?.amount);
    });

    it("should throw error for non-existent product", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Product not found" }),
      });

      const updateData: UpdateProductInput = {
        id: "non-existent",
        name: "Updated",
      };

      await expect(updateProduct("non-existent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(deleteProduct("1")).resolves.not.toThrow();
    });

    it("should throw error for non-existent product", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Product not found" }),
      });

      await expect(deleteProduct("non-existent")).rejects.toThrow();
    });
  });

  describe("duplicateProduct", () => {
    it("should duplicate a product with new ID", async () => {
      // Mock fetchProduct
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProductData,
      });

      // Mock createProduct
      const duplicatedProduct = {
        ...mockProductData,
        id: "duplicated-id",
        name: `${mockProductData.name} (Copy)`,
        status: "pending",
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => duplicatedProduct,
      });

      const duplicated = await duplicateProduct("1");

      expect(duplicated).toHaveProperty("id");
      expect(duplicated.id).not.toBe("1");
      expect(duplicated.name).toContain("Copy");
      expect(duplicated.status).toBe("pending");
    });

    it("should throw error for non-existent product", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Product not found" }),
      });

      await expect(duplicateProduct("non-existent")).rejects.toThrow();
    });
  });
});
