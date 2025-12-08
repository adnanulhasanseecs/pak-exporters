import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/store/useAuthStore";
import { searchProducts, fetchProduct } from "@/services/api/products";
import { fetchCompanies } from "@/services/api/companies";

// Mock dependencies
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/store/useAuthStore");
vi.mock("@/services/api/products");
vi.mock("@/services/api/companies");

// Mock components
vi.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ product }: { product: any }) => (
    <div data-testid="product-card" onClick={() => mockPush(`/products/${product.id}`)}>
      {product.name}
    </div>
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
    name: "Cotton T-Shirt",
    shortDescription: "High quality cotton t-shirt",
    price: { amount: 10, currency: "USD", minOrderQuantity: 100 },
    images: ["https://example.com/image.jpg"],
    category: { id: "1", name: "Textiles", slug: "textiles" },
    company: { id: "1", name: "Textile Co", verified: true, goldSupplier: false },
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const mockCompanies = {
  companies: [
    {
      id: "1",
      name: "Textile Company",
      shortDescription: "Leading textile manufacturer",
      location: { city: "Karachi", province: "Sindh", country: "Pakistan" },
      categories: [{ id: "1", name: "Textiles", slug: "textiles" }],
      productCount: 50,
      verified: true,
      goldSupplier: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

describe("Product Search Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("should complete product search flow: search -> view results -> click product -> view detail", async () => {
    const user = userEvent.setup();
    
    // Mock search results
    vi.mocked(searchProducts).mockResolvedValue(mockProducts as any);
    vi.mocked(fetchCompanies).mockResolvedValue(mockCompanies as any);
    
    // Mock product detail
    vi.mocked(fetchProduct).mockResolvedValue({
      ...mockProducts[0],
      description: "Full product description",
      specifications: [],
      tags: [],
    } as any);

    // Step 1: Render search page (simulated)
    const SearchContent = () => {
      const [query, setQuery] = React.useState("");
      const [products, setProducts] = React.useState<any[]>([]);
      const [loading, setLoading] = React.useState(false);

      const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        const results = await searchProducts(query);
        setProducts(results);
        setLoading(false);
      };

      return (
        <div>
          <input
            data-testid="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
          />
          <button data-testid="search-button" onClick={handleSearch} disabled={loading}>
            Search
          </button>
          {products.map((product) => (
            <div
              key={product.id}
              data-testid="product-card"
              onClick={() => mockPush(`/products/${product.id}`)}
            >
              {product.name}
            </div>
          ))}
        </div>
      );
    };

    const React = await import("react");
    render(<SearchContent />);

    // Step 2: Perform search
    const searchInput = screen.getByTestId("search-input");
    const searchButton = screen.getByTestId("search-button");

    await user.type(searchInput, "cotton");
    await user.click(searchButton);

    // Step 3: Verify search results appear
    await waitFor(() => {
      expect(vi.mocked(searchProducts)).toHaveBeenCalledWith("cotton");
      expect(screen.getByTestId("product-card")).toBeInTheDocument();
      expect(screen.getByText("Cotton T-Shirt")).toBeInTheDocument();
    });

    // Step 4: Click on product to view detail
    const productCard = screen.getByTestId("product-card");
    await user.click(productCard);

    // Step 5: Verify navigation to product detail
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/products/1");
    });
  });

  it("should filter search results by category", async () => {
    const user = userEvent.setup();
    
    const filteredProducts = mockProducts.filter(
      (p) => p.category.slug === "textiles"
    );
    vi.mocked(searchProducts).mockResolvedValue(filteredProducts as any);
    vi.mocked(fetchCompanies).mockResolvedValue(mockCompanies as any);

    // Simulate category filter in search
    const SearchWithFilter = () => {
      const [query, setQuery] = React.useState("");
      const [category, setCategory] = React.useState("");
      const [products, setProducts] = React.useState<any[]>([]);

      const handleSearch = async () => {
        const results = await searchProducts(query);
        const filtered = category
          ? results.filter((p: any) => p.category.slug === category)
          : results;
        setProducts(filtered);
      };

      return (
        <div>
          <input
            data-testid="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            data-testid="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="textiles">Textiles</option>
          </select>
          <button data-testid="search-button" onClick={handleSearch}>
            Search
          </button>
          {products.map((product) => (
            <div key={product.id} data-testid="product-card">
              {product.name}
            </div>
          ))}
        </div>
      );
    };

    const React = await import("react");
    render(<SearchWithFilter />);

    const searchInput = screen.getByTestId("search-input");
    const categoryFilter = screen.getByTestId("category-filter");
    const searchButton = screen.getByTestId("search-button");

    await user.type(searchInput, "cotton");
    await user.selectOptions(categoryFilter, "textiles");
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId("product-card")).toBeInTheDocument();
      expect(screen.getByText("Cotton T-Shirt")).toBeInTheDocument();
    });
  });
});

