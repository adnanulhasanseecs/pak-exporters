import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryCard } from "./CategoryCard";
import type { Category } from "@/types/category";

const mockCategory: Category = {
  id: "1",
  name: "Test Category",
  slug: "test-category",
  description: "Test description",
  productCount: 100,
  level: 1,
  order: 1,
};

describe("CategoryCard", () => {
  it("should render category name", () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("should render product count", () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText("100 products")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(<CategoryCard category={mockCategory} />);
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("should have correct link href", () => {
    render(<CategoryCard category={mockCategory} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/category/test-category");
  });
});

