import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyCard } from "./CompanyCard";
import type { CompanyListItem } from "@/types/company";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockCompany: CompanyListItem = {
  id: "1",
  name: "Test Company",
  shortDescription: "Test company description",
  logo: "https://example.com/logo.jpg",
  coverImage: "https://example.com/cover.jpg",
  verified: true,
  goldSupplier: false,
  location: {
    city: "Karachi",
    province: "Sindh",
    country: "Pakistan",
  },
  categories: [
    {
      id: "1",
      name: "Textiles & Apparel",
      slug: "textiles-apparel",
    },
  ],
  productCount: 25,
  trustScore: 85,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("CompanyCard", () => {
  it("should render company name", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("should render company location", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText(/Karachi, Sindh/)).toBeInTheDocument();
  });

  it("should render product count", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText("25 products")).toBeInTheDocument();
  });

  it("should render trust score when available", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText(/Trust Score: 85%/)).toBeInTheDocument();
  });

  it("should render verified badge when company is verified", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("should render gold supplier badge when company is gold supplier", () => {
    const goldCompany = { ...mockCompany, goldSupplier: true };
    render(<CompanyCard company={goldCompany} />);
    expect(screen.getByText("Gold")).toBeInTheDocument();
  });

  it("should render short description when available", () => {
    render(<CompanyCard company={mockCompany} />);
    expect(screen.getByText("Test company description")).toBeInTheDocument();
  });

  it("should render logo when available", () => {
    render(<CompanyCard company={mockCompany} />);
    const images = screen.getAllByAltText("Test Company");
    const logo = images.find((img) => img.getAttribute("src") === "https://example.com/logo.jpg");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "https://example.com/logo.jpg");
  });

  it("should render cover image when available", () => {
    render(<CompanyCard company={mockCompany} />);
    const coverImage = screen.getAllByAltText("Test Company")[0];
    expect(coverImage).toHaveAttribute("src", "https://example.com/cover.jpg");
  });

  it("should render initial letter when logo is not available", () => {
    const companyWithoutLogo = { ...mockCompany, logo: undefined };
    render(<CompanyCard company={companyWithoutLogo} />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("should not render trust score when not available", () => {
    const companyWithoutTrustScore = { ...mockCompany, trustScore: undefined };
    render(<CompanyCard company={companyWithoutTrustScore} />);
    expect(screen.queryByText(/Trust Score:/)).not.toBeInTheDocument();
  });

  it("should render link to company detail page", () => {
    render(<CompanyCard company={mockCompany} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("/company/1"));
  });

  it("should handle company without short description", () => {
    const companyWithoutDescription = { ...mockCompany, shortDescription: undefined };
    render(<CompanyCard company={companyWithoutDescription} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.queryByText("Test company description")).not.toBeInTheDocument();
  });
});

