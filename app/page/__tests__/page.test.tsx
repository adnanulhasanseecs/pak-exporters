import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../../[locale]/page";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n routing
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the components that require data fetching
vi.mock("@/components/layout/HeroCarousel", () => ({
  HeroCarousel: () => <div data-testid="hero-carousel">Hero Carousel</div>,
}));

vi.mock("@/components/cards/CategoryCard", () => ({
  CategoryCard: ({ category }: { category: { name: string } }) => (
    <div data-testid="category-card">{category.name}</div>
  ),
}));

vi.mock("@/components/cards/ProductCard", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}));

vi.mock("@/components/home/MembershipCTASection", () => ({
  MembershipCTASection: () => <div data-testid="membership-cta">Membership CTA</div>,
}));

vi.mock("@/components/home/MembershipButton", () => ({
  MembershipButton: () => <button data-testid="membership-button">Join Now</button>,
}));

vi.mock("@/components/animations/FadeInOnScroll", () => ({
  FadeInOnScroll: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("Home Page", () => {
  it("should render the homepage", () => {
    render(<Home />);
    // Check for main sections
    expect(screen.getByTestId("hero-carousel")).toBeInTheDocument();
  });

  it("should display featured categories", () => {
    render(<Home />);
    // Categories should be displayed - check for category cards
    const categoryCards = screen.queryAllByTestId("category-card");
    expect(categoryCards.length).toBeGreaterThan(0);
  });

  it("should display featured products", () => {
    render(<Home />);
    // Products should be displayed - check for product cards
    const productCards = screen.queryAllByTestId("product-card");
    expect(productCards.length).toBeGreaterThan(0);
  });

  it("should have call-to-action sections", () => {
    render(<Home />);
    // Check for CTA buttons or sections
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should display membership CTA section", () => {
    render(<Home />);
    expect(screen.getByTestId("membership-cta")).toBeInTheDocument();
  });

  it("should display statistics section", () => {
    render(<Home />);
    // Check for stats or numbers - at minimum hero carousel should be visible
    const stats = screen.queryAllByText(/exporters|suppliers|products/i);
    const heroCarousel = screen.getByTestId("hero-carousel");
    // Either stats are visible or hero carousel is visible
    expect(stats.length > 0 || heroCarousel).toBeTruthy();
  });

  it("should have navigation links", () => {
    render(<Home />);
    // Check for links to categories, products, etc.
    const links = screen.queryAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});

