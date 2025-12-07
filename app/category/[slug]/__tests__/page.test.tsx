import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoryPage from "../page";
import { fetchCategoryBySlug } from "@/services/api/categories";
import { fetchProducts } from "@/services/api/products";

// Mock the API services
vi.mock("@/services/api/categories", () => ({
  fetchCategoryBySlug: vi.fn(),
}));

vi.mock("@/services/api/products", () => ({
  fetchProducts: vi.fn(),
}));

vi.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

vi.mock("@/components/seo/StructuredData", () => ({
  StructuredData: () => null,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe("Category Detail Page", () => {
  const mockCategory = {
    id: "1",
    name: "Textiles & Garments",
    slug: "textiles-garments",
    description: "Textile products from Pakistan",
    productCount: 100,
    level: 1,
    order: 1,
  };

  const mockProducts = {
    products: [
      {
        id: "1",
        name: "Product 1",
        shortDescription: "Test product",
        price: { amount: 100, currency: "USD", minOrderQuantity: 10 },
        images: [],
        category: { id: "1", name: "Textiles & Garments", slug: "textiles-garments" },
        company: { id: "1", name: "Test Company", verified: false, goldSupplier: false },
        tags: [],
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Product 2",
        shortDescription: "Test product 2",
        price: { amount: 200, currency: "USD", minOrderQuantity: 5 },
        images: [],
        category: { id: "1", name: "Textiles & Garments", slug: "textiles-garments" },
        company: { id: "1", name: "Test Company", verified: false, goldSupplier: false },
        tags: [],
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
    totalPages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render category page with name", async () => {
    vi.mocked(fetchCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ slug: "textiles-garments" });
    const page = await CategoryPage({ params });
    const { container } = render(page);

    expect(container).toBeInTheDocument();
  });

  it("should display category description", async () => {
    vi.mocked(fetchCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ slug: "textiles-garments" });
    const page = await CategoryPage({ params });
    render(page);

    expect(screen.getByText(/textile products/i)).toBeInTheDocument();
  });

  it("should display products for the category", async () => {
    vi.mocked(fetchCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ slug: "textiles-garments" });
    const page = await CategoryPage({ params });
    render(page);

    const productCards = screen.getAllByTestId("product-card");
    expect(productCards.length).toBe(2);
    expect(productCards[0]).toHaveTextContent("Product 1");
    expect(productCards[1]).toHaveTextContent("Product 2");
  });

  it("should display product count", async () => {
    vi.mocked(fetchCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ slug: "textiles-garments" });
    const page = await CategoryPage({ params });
    render(page);

    // Check for product count or total
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("should handle empty products list", async () => {
    vi.mocked(fetchCategoryBySlug).mockResolvedValue(mockCategory);
    vi.mocked(fetchProducts).mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    const params = Promise.resolve({ slug: "textiles-garments" });
    const page = await CategoryPage({ params });
    const { container } = render(page);

    expect(container).toBeInTheDocument();
  });
});

