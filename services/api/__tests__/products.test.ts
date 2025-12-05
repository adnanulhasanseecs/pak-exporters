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

// Mock the products data
vi.mock("@/services/mocks/products.json", () => ({
  default: [
    {
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
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
}));

describe("Products API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchProducts", () => {
    it("should fetch products with pagination", async () => {
      const result = await fetchProducts(undefined, { page: 1, pageSize: 10 });

      expect(result).toHaveProperty("products");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page", 1);
      expect(result).toHaveProperty("pageSize", 10);
      expect(result).toHaveProperty("totalPages");
    });

    it("should filter by category", async () => {
      const result = await fetchProducts({ category: "agriculture" });

      expect(result.products.every((p) => p.category.slug === "agriculture")).toBe(true);
    });

    it("should filter by search query", async () => {
      const result = await fetchProducts({ search: "Test" });

      expect(result.products.length).toBeGreaterThan(0);
      expect(
        result.products.some(
          (p) => p.name.toLowerCase().includes("test") || p.shortDescription?.toLowerCase().includes("test")
        )
      ).toBe(true);
    });

    it("should filter by price range", async () => {
      const result = await fetchProducts({ minPrice: 50, maxPrice: 150 });

      expect(result.products.every((p) => p.price.amount >= 50 && p.price.amount <= 150)).toBe(
        true
      );
    });

    it("should filter by membership tier", async () => {
      const result = await fetchProducts({ membershipTier: "gold" });

      // Should return products from gold suppliers
      expect(result.products).toBeDefined();
    });

    it("should filter by company ID", async () => {
      const result = await fetchProducts({ companyId: "1" });

      expect(result.products.every((p) => p.company.id === "1")).toBe(true);
    });
  });

  describe("fetchProduct", () => {
    it("should fetch a single product by ID", async () => {
      const product = await fetchProduct("1");

      expect(product).toHaveProperty("id", "1");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("description");
    });

    it("should throw error for non-existent product", async () => {
      await expect(fetchProduct("non-existent")).rejects.toThrow();
    });
  });

  describe("fetchUserProducts", () => {
    it("should fetch products for a specific company", async () => {
      const result = await fetchUserProducts("1", undefined, { page: 1, pageSize: 10 });

      expect(result).toHaveProperty("products");
      expect(result.products.every((p) => p.company.id === "1")).toBe(true);
    });

    it("should apply filters to user products", async () => {
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

      const category = { id: "1", name: "Agriculture", slug: "agriculture" };
      const product = await createProduct(productData, "1", category);

      expect(product.category).toEqual(category);
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", async () => {
      const updateData: UpdateProductInput = {
        id: "1",
        name: "Updated Product Name",
        price: { amount: 150, currency: "USD" },
      };

      const product = await updateProduct("1", updateData);

      expect(product.name).toBe(updateData.name);
      expect(product.price.amount).toBe(updateData.price?.amount);
    });

    it("should throw error for non-existent product", async () => {
      const updateData: UpdateProductInput = {
        id: "non-existent",
        name: "Updated",
      };

      await expect(updateProduct("non-existent", updateData)).rejects.toThrow();
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product", async () => {
      await expect(deleteProduct("1")).resolves.not.toThrow();
    });

    it("should throw error for non-existent product", async () => {
      await expect(deleteProduct("non-existent")).rejects.toThrow();
    });
  });

  describe("duplicateProduct", () => {
    it("should duplicate a product with new ID", async () => {
      const duplicated = await duplicateProduct("1");

      expect(duplicated).toHaveProperty("id");
      expect(duplicated.id).not.toBe("1");
      expect(duplicated.name).toContain("Copy");
      expect(duplicated.status).toBe("pending");
    });

    it("should throw error for non-existent product", async () => {
      await expect(duplicateProduct("non-existent")).rejects.toThrow();
    });
  });
});

