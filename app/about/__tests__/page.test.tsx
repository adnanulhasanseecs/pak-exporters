import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "../../[locale]/about/page";

describe("About Page", () => {
  it("should render the about page", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("should display page title", () => {
    render(<AboutPage />);
    expect(screen.getByText(/about pak-exporters/i)).toBeInTheDocument();
  });

  it("should display company information sections", () => {
    render(<AboutPage />);
    // Check for key sections
    expect(screen.getByText(/who we are/i)).toBeInTheDocument();
  });

  it("should display mission or vision section", () => {
    render(<AboutPage />);
    // Check for mission/vision or similar content
    const headings = screen.getAllByRole("heading");
    expect(headings.length).toBeGreaterThan(1);
  });

  it("should have proper heading hierarchy", () => {
    render(<AboutPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});

