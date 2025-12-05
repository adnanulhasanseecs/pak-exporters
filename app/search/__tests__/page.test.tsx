import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPage from "../page";
import { searchProducts } from "@/services/api/products";
import { fetchCompanies } from "@/services/api/companies";

const mockGet = vi.fn().mockReturnValue("");

// Mock dependencies
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

vi.mock("@/services/api/products");
vi.mock("@/services/api/companies");
vi.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ product }: { product: any }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));
vi.mock("@/components/cards/CompanyCard", () => ({
  CompanyCard: ({ company }: { company: any }) => (
    <div data-testid="company-card">{company.name}</div>
  ),
}));

const mockProducts = [
  {
    id: "1",
    name: "Test Product",
    shortDescription: "Test",
    price: { amount: 10, currency: "USD", minOrderQuantity: 100 },
    images: ["https://example.com/image.jpg"],
    category: { id: "1", name: "Category", slug: "category" },
    company: { id: "1", name: "Company", verified: true, goldSupplier: false },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const mockCompanies = {
  companies: [
    {
      id: "1",
      name: "Test Company",
      shortDescription: "Test",
      location: { city: "Karachi", province: "Sindh", country: "Pakistan" },
      categories: [{ id: "1", name: "Category", slug: "category" }],
      productCount: 10,
      verified: true,
      goldSupplier: false,
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue("");
    vi.mocked(searchProducts).mockResolvedValue(mockProducts as any);
    vi.mocked(fetchCompanies).mockResolvedValue(mockCompanies);
  });

  it("should render search page", () => {
    render(<SearchPage />);
    expect(screen.getAllByText("Search").length).toBeGreaterThan(0); // Title and button both have "Search"
    expect(screen.getByPlaceholderText(/Search products, suppliers/i)).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("should render tabs for products and companies after search", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);
    const searchButtons = screen.getAllByRole("button", { name: /Search/i });
    const searchButton = searchButtons.find((btn) => !btn.disabled && btn.textContent?.includes("Search")) || searchButtons[0];

    await user.type(searchInput, "test");
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Products/i)).toBeInTheDocument();
      expect(screen.getByText(/Companies/i)).toBeInTheDocument();
    });
  });

  it("should perform search when button is clicked", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);
    const searchButtons = screen.getAllByRole("button", { name: /Search/i });
    const searchButton = searchButtons.find((btn) => !btn.disabled) || searchButtons[0];

    await user.type(searchInput, "test query");
    await user.click(searchButton);

    await waitFor(() => {
      expect(vi.mocked(searchProducts)).toHaveBeenCalledWith("test query");
      expect(vi.mocked(fetchCompanies)).toHaveBeenCalledWith({ search: "test query" });
    });
  });

  it("should perform search when Enter is pressed", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);

    await user.type(searchInput, "test query{Enter}");

    await waitFor(() => {
      expect(vi.mocked(searchProducts)).toHaveBeenCalledWith("test query");
    });
  });

  it("should not search with empty query", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchButtons = screen.getAllByRole("button", { name: /Search/i });
    const searchButton = searchButtons.find((btn) => !btn.disabled) || searchButtons[0];
    await user.click(searchButton);

    // Should not call search APIs with empty query
    await waitFor(() => {
      expect(vi.mocked(searchProducts)).not.toHaveBeenCalled();
    });
  });

  it("should display search results", async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);
    const searchButtons = screen.getAllByRole("button", { name: /Search/i });
    const searchButton = searchButtons.find((btn) => !btn.disabled) || searchButtons[0];

    await user.type(searchInput, "test");
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId("product-card")).toBeInTheDocument();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("should display error message on search failure", async () => {
    const user = userEvent.setup();
    vi.mocked(searchProducts).mockRejectedValue(new Error("Search failed"));
    vi.mocked(fetchCompanies).mockRejectedValue(new Error("Search failed"));

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search products, suppliers/i);
    const searchButtons = screen.getAllByRole("button", { name: /Search/i });
    const searchButton = searchButtons.find((btn) => !btn.disabled && btn.textContent?.includes("Search")) || searchButtons[0];

    await user.type(searchInput, "test");
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/Search Error/i)).toBeInTheDocument();
      // The error message shows the actual error from the catch block
      expect(screen.getByText(/Search failed/i)).toBeInTheDocument();
    });
  });
});

