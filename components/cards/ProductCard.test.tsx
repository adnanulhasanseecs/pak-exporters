import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/types/product";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockProduct: ProductListItem = {
  id: "1",
  name: "Test Product",
  shortDescription: "Test description",
  price: {
    amount: 10.0,
    currency: "USD",
    minOrderQuantity: 100,
  },
  images: ["https://example.com/image.jpg"],
  category: {
    id: "1",
    name: "Test Category",
    slug: "test-category",
  },
  company: {
    id: "1",
    name: "Test Company",
    verified: true,
    goldSupplier: false,
  },
  status: "active",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("ProductCard", () => {
  it("should render product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("should render product price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/USD 10/)).toBeInTheDocument();
  });

  it("should render company name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("should render gold supplier badge when applicable", () => {
    const goldProduct = {
      ...mockProduct,
      company: { ...mockProduct.company, goldSupplier: true },
    };
    render(<ProductCard product={goldProduct} />);
    expect(screen.getByText("Gold")).toBeInTheDocument();
  });

  it("should render minimum order quantity", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/Min. Order: 100/)).toBeInTheDocument();
  });
});

