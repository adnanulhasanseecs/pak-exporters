import { describe, it, expect } from "vitest";
import { productFormSchema } from "../product";

describe("Product Form Validation Schema", () => {
  const validProductData = {
    name: "Test Product",
    shortDescription: "This is a short description for testing purposes",
    description: "This is a longer description that meets the minimum requirement of 50 characters for product description",
    categoryId: "1",
    price: {
      amount: 100,
      currency: "USD" as const,
      minOrderQuantity: 10,
    },
    images: ["https://example.com/image.jpg"],
    specifications: {
      Material: "Cotton",
      Size: "Large",
    },
    tags: ["cotton", "premium"],
    status: "active" as const,
  };

  describe("Product Name", () => {
    it("should validate minimum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        name: "AB",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 3 characters");
      }
    });

    it("should validate maximum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        name: "A".repeat(201),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("must not exceed 200 characters");
      }
    });

    it("should accept valid name", () => {
      const result = productFormSchema.safeParse(validProductData);

      expect(result.success).toBe(true);
    });
  });

  describe("Short Description", () => {
    it("should validate minimum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        shortDescription: "Short",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 10 characters");
      }
    });

    it("should validate maximum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        shortDescription: "A".repeat(201),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("must not exceed 200 characters");
      }
    });
  });

  describe("Description", () => {
    it("should validate minimum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        description: "Short",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 50 characters");
      }
    });

    it("should validate maximum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        description: "A".repeat(5001),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("must not exceed 5000 characters");
      }
    });
  });

  describe("Category", () => {
    it("should require category selection", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        categoryId: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("select a category");
      }
    });
  });

  describe("Price", () => {
    it("should validate positive amount", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        price: {
          amount: -10,
          currency: "USD" as const,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("positive number");
      }
    });

    it("should validate minimum amount", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        price: {
          amount: 0.005,
          currency: "USD" as const,
        },
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 0.01");
      }
    });

    it("should validate currency enum", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        price: {
          amount: 100,
          currency: "INVALID" as any,
        },
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid currencies", () => {
      const currencies = ["USD", "PKR", "EUR", "GBP"] as const;

      currencies.forEach((currency) => {
        const result = productFormSchema.safeParse({
          ...validProductData,
          price: {
            amount: 100,
            currency,
          },
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Images", () => {
    it("should require at least one image", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        images: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message.toLowerCase()).toContain("at least one product image");
      }
    });

    it("should validate maximum images", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        images: Array(11).fill("https://example.com/image.jpg"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Maximum 10 images");
      }
    });

    it("should validate image URLs", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        images: ["not-a-valid-url"],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid image URL");
      }
    });
  });

  describe("Tags", () => {
    it("should validate maximum tags", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        tags: Array(11).fill("tag"),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Maximum 10 tags");
      }
    });

    it("should validate tag minimum length", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        tags: [""],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Tag cannot be empty");
      }
    });
  });

  describe("Status", () => {
    it("should validate status enum", () => {
      const result = productFormSchema.safeParse({
        ...validProductData,
        status: "invalid" as any,
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid statuses", () => {
      const statuses = ["active", "inactive", "pending"] as const;

      statuses.forEach((status) => {
        const result = productFormSchema.safeParse({
          ...validProductData,
          status,
        });

        expect(result.success).toBe(true);
      });
    });
  });

  describe("Complete Valid Data", () => {
    it("should validate complete product data", () => {
      const result = productFormSchema.safeParse(validProductData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validProductData);
      }
    });

    it("should validate product without optional fields", () => {
      const minimalData = {
        name: "Test Product",
        shortDescription: "This is a short description",
        description: "This is a longer description that meets the minimum requirement of 50 characters",
        categoryId: "1",
        price: {
          amount: 100,
          currency: "USD" as const,
        },
        images: ["https://example.com/image.jpg"],
        tags: [], // Tags is required with default []
        status: "active" as const,
      };

      const result = productFormSchema.safeParse(minimalData);

      expect(result.success).toBe(true);
    });
  });
});

