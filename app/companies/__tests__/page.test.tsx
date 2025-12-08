import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CompaniesPage from "../../[locale]/companies/page";
import { fetchCompanies } from "@/services/api/companies";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  getTranslations: async () => (key: string) => key,
}));

// Mock fetchCompanies
vi.mock("@/services/api/companies", () => ({
  fetchCompanies: vi.fn(),
}));

// Mock StructuredData component
vi.mock("@/components/seo/StructuredData", () => ({
  StructuredData: () => null,
}));

// Mock CompanyCard component
vi.mock("@/components/cards/CompanyCard", () => ({
  CompanyCard: ({ company }: { company: { name: string } }) => (
    <div data-testid="company-card">{company.name}</div>
  ),
}));

// Mock Link component
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("Companies Page", () => {
  const mockCompanies = [
    {
      id: "1",
      name: "Test Company 1",
      shortDescription: "Test description 1",
      location: { city: "Karachi", province: "Sindh", country: "Pakistan" },
      contact: { email: "test1@test.com" },
      categories: [],
      verified: true,
      goldSupplier: false,
      productCount: 10,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Test Company 2",
      shortDescription: "Test description 2",
      location: { city: "Lahore", province: "Punjab", country: "Pakistan" },
      contact: { email: "test2@test.com" },
      categories: [],
      verified: false,
      goldSupplier: true,
      productCount: 20,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];

  it("should render the companies page", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const page = await CompaniesPage();
    const { container } = render(page);
    expect(container).toBeInTheDocument();
  });

  it("should display page title", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const page = await CompaniesPage();
    render(page);

    expect(screen.getByText("Find Suppliers")).toBeInTheDocument();
  });

  it("should display page description", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const page = await CompaniesPage();
    render(page);

    expect(screen.getByText(/connect with verified pakistani exporters/i)).toBeInTheDocument();
  });

  it("should display all company cards", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const page = await CompaniesPage();
    render(page);

    const companyCards = screen.getAllByTestId("company-card");
    expect(companyCards.length).toBe(2);
    expect(companyCards[0]).toHaveTextContent("Test Company 1");
    expect(companyCards[1]).toHaveTextContent("Test Company 2");
  });

  it("should display membership button", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: mockCompanies,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });

    const page = await CompaniesPage();
    render(page);

    expect(screen.getByText(/become a member/i)).toBeInTheDocument();
  });

  it("should handle empty companies list", async () => {
    vi.mocked(fetchCompanies).mockResolvedValue({
      companies: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    });

    const page = await CompaniesPage();
    const { container } = render(page);

    expect(container).toBeInTheDocument();
    expect(screen.getByText("Find Suppliers")).toBeInTheDocument();
  });
});

