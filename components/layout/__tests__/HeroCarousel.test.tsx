import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { HeroCarousel } from "../HeroCarousel";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
    <img src={src} alt={alt} data-testid="hero-image" {...props} />
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("HeroCarousel", () => {
  it("should render carousel", async () => {
    render(<HeroCarousel />);
    await waitFor(() => {
      const images = screen.getAllByTestId("hero-image");
      expect(images.length).toBeGreaterThan(0);
    });
  });

  it("should render navigation buttons", () => {
    render(<HeroCarousel />);
    // Carousel should have previous/next buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should render call-to-action buttons", () => {
    render(<HeroCarousel />);
    expect(screen.getByText(/browse products/i)).toBeInTheDocument();
    expect(screen.getByText(/find suppliers/i)).toBeInTheDocument();
  });
});

