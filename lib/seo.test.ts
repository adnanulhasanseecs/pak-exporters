import { describe, it, expect } from "vitest";
import { APP_CONFIG } from "@/lib/constants";
import {
  createProductStructuredData,
  createCompanyStructuredData,
  createWebsiteStructuredData,
  createBlogStructuredData,
} from "./seo";

const baseUrl = (APP_CONFIG.url || "http://localhost:3000").replace(/\/$/, "");

describe("SEO structured data helpers", () => {
  it("creates basic website structured data", () => {
    const data = createWebsiteStructuredData();
    expect(data["@type"]).toBe("WebSite");
    expect(data).toHaveProperty("url", baseUrl);
  });

  it("creates product structured data with required fields", () => {
    const product: any = {
      id: "p1",
      name: "Test Product",
      description: "Test description",
      shortDescription: "Short",
      price: { amount: 100, currency: "USD" },
      images: ["https://example.com/image.jpg"],
      category: { id: "c1", name: "Category", slug: "category" },
      company: {
        id: "co1",
        name: "Test Company",
        verified: true,
        goldSupplier: false,
      },
      status: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    };

    const data = createProductStructuredData(product);
    expect(data["@type"]).toBe("Product");
    expect(data).toHaveProperty("name", product.name);
    expect(data).toHaveProperty("category", product.category.name);
  });

  it("creates company structured data with geo and address", () => {
    const company: any = {
      id: "co1",
      name: "Test Company",
      description: "Desc",
      logo: "https://example.com/logo.jpg",
      coverImage: "https://example.com/cover.jpg",
      verified: true,
      goldSupplier: false,
      location: {
        city: "Islamabad",
        province: "Islamabad Capital Territory",
        country: "Pakistan",
      },
      contact: { email: "test@example.com" },
      categories: [],
      productCount: 0,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    };

    const data = createCompanyStructuredData(company);
    expect(data["@type"]).toBe("Organization");
    expect(data).toHaveProperty("name", company.name);
    expect(data).toHaveProperty("url", `${baseUrl}/company/${company.id}`);
  });

  it("creates blog structured data for articles", () => {
    const post: any = {
      id: "1",
      slug: "test-article",
      title: "Test Article",
      excerpt: "Short description",
      content: "Full content",
      author: "Author",
      publishedAt: "2024-01-01T00:00:00.000Z",
    };

    const data = createBlogStructuredData(post);
    expect(data["@type"]).toBe("BlogPosting");
    expect(data).toHaveProperty("headline", post.title);
    expect(data).toHaveProperty("url", `${baseUrl}/blog/${post.slug}`);
  });
});


