import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductPage, { generateMetadata } from "../../../[locale]/products/[id]/page";
import { fetchProduct } from "@/services/api/products";

// Mock dependencies
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/services/api/products");
vi.mock("@/components/ui/image-gallery", () => ({
  ImageGallery: ({ images, alt }: { images: string[]; alt: string }) => (
    <div data-testid="image-gallery">
      {images.map((img, idx) => (
        <img key={idx} src={img} alt={`${alt} ${idx}`} />
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumb">
      {items.map((item, idx) => (
        <span key={idx}>{item.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/components/seo/StructuredData", () => ({
  StructuredData: () => null,
}));

vi.mock("@/components/placeholders/AIWriteButton", () => ({
  AIWriteButton: () => <button data-testid="ai-write-button">Write with AI</button>,
}));

const mockProduct = {
  id: "1",
  name: "Test Product",
  description: "Test Description",
  shortDescription: "Short description",
  price: {
    amount: 10.0,
    currency: "USD",
    minOrderQuantity: 100,
  },
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  category: {
    id: "1",
    name: "Textiles & Apparel",
    slug: "textiles-apparel",
  },
  company: {
    id: "1",
    name: "Test Company",
    verified: true,
    goldSupplier: false,
  },
  specifications: [],
  tags: [],
  status: "active",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

describe("ProductPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render product details", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const component = await ProductPage({ params });
    const { container } = render(component);

    // Check if product name appears in the rendered output
    expect(container.textContent).toContain("Test Product");
    expect(container.textContent).toContain("Test Description");
  });

  it("should render product images", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const component = await ProductPage({ params });
    render(component);

    expect(screen.getByTestId("image-gallery")).toBeInTheDocument();
  });

  it("should render breadcrumb", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const component = await ProductPage({ params });
    render(component);

    expect(screen.getByTestId("breadcrumb")).toBeInTheDocument();
    // Breadcrumb items might be rendered as spans
    const breadcrumb = screen.getByTestId("breadcrumb");
    expect(breadcrumb.textContent).toContain("Products");
    expect(breadcrumb.textContent).toContain("Test Product");
  });

  it("should render category badge", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const component = await ProductPage({ params });
    render(component);

    expect(screen.getByText("Textiles & Apparel")).toBeInTheDocument();
  });

  it("should render AI write button", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const component = await ProductPage({ params });
    render(component);

    expect(screen.getByTestId("ai-write-button")).toBeInTheDocument();
  });
});

describe("generateMetadata", () => {
  it("should generate metadata for product", async () => {
    vi.mocked(fetchProduct).mockResolvedValue(mockProduct as any);

    const params = Promise.resolve({ id: "1" });
    const metadata = await generateMetadata({ params });

    expect(metadata).toHaveProperty("title");
  });

  it("should handle product not found", async () => {
    vi.mocked(fetchProduct).mockRejectedValue(new Error("Product not found"));

    const params = Promise.resolve({ id: "999" });
    const metadata = await generateMetadata({ params });

    expect(metadata.title).toBe("Product Not Found");
  });
});

