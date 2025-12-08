import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RecentProducts } from "../RecentProducts";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock zustand store
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: {
      id: "1",
      role: "supplier",
      companyId: "1",
    },
  }),
}));

// Mock products API
vi.mock("@/services/api/products", () => ({
  fetchUserProducts: vi.fn().mockResolvedValue({
    products: [
      {
        id: "1",
        name: "Test Product",
        shortDescription: "Test description",
        price: { amount: 100, currency: "USD" },
        images: ["https://example.com/image.jpg"],
        category: { id: "1", name: "Test Category", slug: "test" },
        status: "active",
      },
    ],
    total: 1,
    page: 1,
    pageSize: 5,
    totalPages: 1,
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="product-image" />
  ),
}));

describe("RecentProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    render(<RecentProducts />);

    expect(screen.getByText(/recent products/i)).toBeInTheDocument();
  });

  it("should display products when loaded", async () => {
    render(<RecentProducts />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("should show empty state when no products", async () => {
    const { fetchUserProducts } = await import("@/services/api/products");
    vi.mocked(fetchUserProducts).mockResolvedValueOnce({
      products: [],
      total: 0,
      page: 1,
      pageSize: 5,
      totalPages: 0,
    });

    render(<RecentProducts />);

    await waitFor(() => {
      expect(screen.getByText(/no products yet/i)).toBeInTheDocument();
    });
  });

  it("should not render for non-supplier users", async () => {
    // Re-mock useAuthStore to return buyer user
    ((await import("@/store/useAuthStore")) as any).useAuthStore = vi.fn(() => ({
      user: { id: "1", role: "buyer" },
    }));

    const { container } = render(<RecentProducts />);
    await waitFor(() => {
      // Component should not render anything for non-supplier users
      expect(container.firstChild).toBeNull();
    }, { timeout: 1000 });
  });
});

