import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CategoriesPage from "../../[locale]/categories/page";
import { fetchCategories } from "@/services/api/categories";

// Mock fetchCategories
vi.mock("@/services/api/categories", () => ({
  fetchCategories: vi.fn(),
}));

// Mock StructuredData component
vi.mock("@/components/seo/StructuredData", () => ({
  StructuredData: () => null,
}));

// Mock CategoryCard component
vi.mock("@/components/cards/CategoryCard", () => ({
  CategoryCard: ({ category }: { category: { name: string } }) => (
    <div data-testid="category-card">{category.name}</div>
  ),
}));

describe("Categories Page", () => {
  const mockCategories = [
    { id: "1", name: "Textiles & Garments", slug: "textiles-garments", productCount: 100, level: 1, order: 1 },
    { id: "2", name: "Agriculture", slug: "agriculture", productCount: 50, level: 1, order: 2 },
    { id: "3", name: "Surgical Instruments", slug: "surgical-instruments", productCount: 75, level: 1, order: 3 },
  ];

  it("should render the categories page", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);

    const page = await CategoriesPage();
    const { container } = render(page);
    expect(container).toBeInTheDocument();
  });

  it("should display page title", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);

    const page = await CategoriesPage();
    render(page);

    expect(screen.getByText("Browse Categories")).toBeInTheDocument();
  });

  it("should display page description", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);

    const page = await CategoriesPage();
    render(page);

    expect(screen.getByText(/explore our wide range/i)).toBeInTheDocument();
  });

  it("should display all category cards", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);

    const page = await CategoriesPage();
    render(page);

    const categoryCards = screen.getAllByTestId("category-card");
    expect(categoryCards.length).toBe(3);
    expect(categoryCards[0]).toHaveTextContent("Textiles & Garments");
    expect(categoryCards[1]).toHaveTextContent("Agriculture");
    expect(categoryCards[2]).toHaveTextContent("Surgical Instruments");
  });

  it("should handle empty categories list", async () => {
    vi.mocked(fetchCategories).mockResolvedValue([]);

    const page = await CategoriesPage();
    const { container } = render(page);

    expect(container).toBeInTheDocument();
    expect(screen.getByText("Browse Categories")).toBeInTheDocument();
  });
});

