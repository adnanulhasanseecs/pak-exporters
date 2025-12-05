import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="footer-logo" />
  ),
}));

describe("Footer", () => {
  it("should render logo", () => {
    render(<Footer />);
    // Footer has two logos (light and dark mode), so use getAllByTestId
    const logos = screen.getAllByTestId("footer-logo");
    expect(logos.length).toBeGreaterThan(0);
  });

  it("should render company description", () => {
    render(<Footer />);
    expect(screen.getByText(/pakistan.*first export marketplace/i)).toBeInTheDocument();
  });

  it("should render quick links section", () => {
    render(<Footer />);
    expect(screen.getByText(/quick links/i)).toBeInTheDocument();
    expect(screen.getByText(/browse categories/i)).toBeInTheDocument();
    expect(screen.getByText(/find suppliers/i)).toBeInTheDocument();
  });

  it("should render resources section", () => {
    render(<Footer />);
    expect(screen.getByText(/resources/i)).toBeInTheDocument();
    expect(screen.getByText(/about us/i)).toBeInTheDocument();
    expect(screen.getByText(/contact us/i)).toBeInTheDocument();
  });

  it("should render contact information", () => {
    render(<Footer />);
    expect(screen.getByText(/contact info/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@pak-exporters.com/i)).toBeInTheDocument();
  });

  it("should render copyright notice", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it("should render social media links", () => {
    render(<Footer />);
    expect(screen.getByText(/linkedin/i)).toBeInTheDocument();
    expect(screen.getByText(/twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/facebook/i)).toBeInTheDocument();
  });

  it("should render FAQ, Terms, and Privacy links", () => {
    render(<Footer />);
    expect(screen.getByText(/faq/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
  });
});

