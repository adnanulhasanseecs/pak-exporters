import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CompanyPage from "../../../[locale]/company/[id]/page";
import { fetchCompany } from "@/services/api/companies";
import { fetchProducts } from "@/services/api/products";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  getTranslations: async () => (key: string) => key,
}));

// Mock the API services
vi.mock("@/services/api/companies", () => ({
  fetchCompany: vi.fn(),
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

vi.mock("@/components/placeholders/AITrustScore", () => ({
  AITrustScore: () => <div data-testid="trust-score">Trust Score</div>,
}));

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt?: string; src?: string }) => (
    <img alt={alt} src={src} data-testid="company-logo" />
  ),
}));

describe("Company Detail Page", () => {
  const mockCompany = {
    id: "1",
    name: "Test Company",
    description: "Test description for the company",
    shortDescription: "Short description",
    logo: "https://example.com/logo.jpg",
    verified: true,
    goldSupplier: false,
    trustScore: 85,
    location: {
      city: "Islamabad",
      province: "Punjab",
      country: "Pakistan",
    },
    contact: {
      email: "test@example.com",
      phone: "+92 300 1234567",
      website: "https://example.com",
    },
    categories: [
      { id: "1", name: "Textiles", slug: "textiles" },
    ],
    productCount: 10,
    yearEstablished: 2020,
    employeeCount: "50-100",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockProducts = {
    products: [
      {
        id: "1",
        name: "Product 1",
        shortDescription: "Test product 1",
        price: { amount: 100, currency: "USD", minOrderQuantity: 10 },
        images: [],
        category: { id: "1", name: "Textiles", slug: "textiles" },
        company: { id: "1", name: "Test Company", verified: true, goldSupplier: false },
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
        category: { id: "1", name: "Textiles", slug: "textiles" },
        company: { id: "1", name: "Test Company", verified: true, goldSupplier: false },
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

  it("should render company page", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    const { container } = render(page);

    expect(container).toBeInTheDocument();
  });

  it("should display company name", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("should display company description", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByText(/test description/i)).toBeInTheDocument();
  });

  it("should display company location", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByText(/islamabad/i)).toBeInTheDocument();
  });

  it("should display company products", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    const productCards = screen.getAllByTestId("product-card");
    expect(productCards.length).toBe(2);
  });

  it("should display verified badge for verified companies", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("should display trust score", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByTestId("trust-score")).toBeInTheDocument();
  });

  it("should display contact information", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue(mockProducts);

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    render(page);

    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it("should handle empty products list", async () => {
    vi.mocked(fetchCompany).mockResolvedValue(mockCompany);
    vi.mocked(fetchProducts).mockResolvedValue({
      products: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    const params = Promise.resolve({ id: "1" });
    const page = await CompanyPage({ params });
    const { container } = render(page);

    expect(container).toBeInTheDocument();
  });
});

