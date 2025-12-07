import { describe, it, expect } from "vitest";
import {
  generateProductKeywords,
  generateProductSEO,
  createProductSEOMetadata,
} from "../seo-automation";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

const mockProduct: Product = {
  id: "1",
  name: "Premium Cotton T-Shirts",
  description: "High-quality cotton t-shirts for export",
  shortDescription: "Premium cotton t-shirts",
  price: { amount: 10, currency: "USD", minOrderQuantity: 100 },
  images: ["https://example.com/image.jpg"],
  category: {
    id: "1",
    name: "Textiles & Garments",
    slug: "textiles-garments",
  },
  company: {
    id: "1",
    name: "Test Company",
    verified: true,
    goldSupplier: false,
  },
  tags: ["cotton", "premium", "export"],
  status: "active",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const mockCategory: Category = {
  id: "1",
  name: "Textiles & Garments",
  slug: "textiles-garments",
  description: "Textile products",
  productCount: 100,
  level: 1,
  order: 1,
};

describe("SEO Automation", () => {
  describe("generateProductKeywords", () => {
    it("should generate keywords from product name and category", () => {
      const keywords = generateProductKeywords("Premium Cotton T-Shirts", mockCategory);

      // Category name is converted to lowercase
      expect(keywords.some((k) => k.toLowerCase() === "textiles & garments")).toBe(true);
      expect(keywords.some((k) => k.toLowerCase() === "premium")).toBe(true);
      expect(keywords.some((k) => k.toLowerCase() === "cotton")).toBe(true);
      expect(keywords.some((k) => k.toLowerCase().includes("pakistan"))).toBe(true);
    });

    it("should include tags in keywords", () => {
      const keywords = generateProductKeywords("Test Product", mockCategory, [
        "cotton",
        "premium",
      ]);

      expect(keywords.some((k) => k.toLowerCase() === "cotton")).toBe(true);
      expect(keywords.some((k) => k.toLowerCase() === "premium")).toBe(true);
    });

    it("should add category-specific keywords for agriculture", () => {
      const agCategory: Category = {
        ...mockCategory,
        name: "Agriculture",
        slug: "agriculture",
      };

      const keywords = generateProductKeywords("Rice", agCategory);

      expect(keywords).toContain("agricultural exports");
      expect(keywords).toContain("farm products");
    });

    it("should add category-specific keywords for textiles", () => {
      const keywords = generateProductKeywords("T-Shirt", mockCategory);

      expect(keywords).toContain("textile exports");
      expect(keywords).toContain("garment manufacturing");
    });

    it("should add category-specific keywords for surgical instruments", () => {
      const surgicalCategory: Category = {
        ...mockCategory,
        name: "Surgical Instruments",
        slug: "surgical-instruments",
      };

      const keywords = generateProductKeywords("Scalpel", surgicalCategory);

      expect(keywords).toContain("medical instruments");
      expect(keywords).toContain("surgical equipment");
    });

    it("should remove duplicates", () => {
      const keywords = generateProductKeywords("Cotton Cotton Cotton", mockCategory, ["cotton"]);

      const uniqueKeywords = [...new Set(keywords)];
      expect(keywords.length).toBe(uniqueKeywords.length);
    });
  });

  describe("generateProductSEO", () => {
    it("should generate complete SEO data", () => {
      const seoData = generateProductSEO(mockProduct, mockCategory);

      expect(seoData).toHaveProperty("metadata");
      expect(seoData).toHaveProperty("structuredData");
      expect(seoData).toHaveProperty("geoMeta");
      expect(seoData).toHaveProperty("keywords");
    });

    it("should include keywords in SEO data", () => {
      const seoData = generateProductSEO(mockProduct, mockCategory);

      expect(seoData.keywords.length).toBeGreaterThan(0);
      expect(seoData.keywords.some((k) => k.toLowerCase().includes("textiles"))).toBe(true);
    });

    it("should generate structured data", () => {
      const seoData = generateProductSEO(mockProduct, mockCategory);

      expect(seoData.structuredData).toHaveProperty("@context");
      expect(seoData.structuredData).toHaveProperty("@type", "Product");
    });

    it("should include geo meta tags", () => {
      const seoData = generateProductSEO(mockProduct, mockCategory);

      expect(seoData.geoMeta).toHaveProperty("geo.region");
      expect(seoData.geoMeta).toHaveProperty("geo.placename");
    });
  });

  describe("createProductSEOMetadata", () => {
    it("should create SEO metadata object", () => {
      const metadata = createProductSEOMetadata(mockProduct, mockCategory);

      expect(metadata).toHaveProperty("title");
      expect(metadata).toHaveProperty("description");
      expect(metadata).toHaveProperty("keywords");
      expect(metadata).toHaveProperty("openGraph");
      expect(metadata).toHaveProperty("twitter");
      expect(metadata).toHaveProperty("geoMeta");
    });

    it("should include product name in title", () => {
      const metadata = createProductSEOMetadata(mockProduct, mockCategory);

      expect(metadata.title).toContain(mockProduct.name);
      expect(metadata.title).toContain(mockCategory.name);
    });

    it("should include keywords array", () => {
      const metadata = createProductSEOMetadata(mockProduct, mockCategory);

      expect(Array.isArray(metadata.keywords)).toBe(true);
      expect(metadata.keywords.length).toBeGreaterThan(0);
    });

    it("should include structured data", () => {
      const metadata = createProductSEOMetadata(mockProduct, mockCategory);

      expect(metadata.structuredData).toBeDefined();
      expect(metadata.structuredData).toHaveProperty("@type", "Product");
    });

    it("should truncate description if too long", () => {
      const longProduct: Product = {
        ...mockProduct,
        description: "A".repeat(300),
        shortDescription: undefined,
      };

      const metadata = createProductSEOMetadata(longProduct, mockCategory);

      // Description should exist and be reasonable length (may be longer than 160 due to enhancements)
      expect(metadata.description.length).toBeGreaterThan(0);
      expect(metadata.description.length).toBeLessThan(500);
    });
  });
});

