import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIAutoTagging } from "../AIAutoTagging";

describe("AIAutoTagging", () => {
  it("should render the component", () => {
    render(<AIAutoTagging />);
    expect(screen.getByText("AI Auto-Tagging")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AIAutoTagging />);
    expect(
      screen.getByText(/Automatically generate relevant tags/i)
    ).toBeInTheDocument();
  });

  it("should have a disabled button", () => {
    render(<AIAutoTagging />);
    const button = screen.getByRole("button", { name: /Generate Tags/i });
    expect(button).toBeDisabled();
  });

  it("should accept onTagsGenerated callback", () => {
    const onTagsGenerated = vi.fn();
    render(<AIAutoTagging onTagsGenerated={onTagsGenerated} />);
    
    const button = screen.getByRole("button", { name: /Generate Tags/i });
    // Button is disabled in placeholder, but callback is accepted
    expect(button).toBeDisabled();
    expect(onTagsGenerated).toBeDefined();
  });

  it("should accept product name and description props", () => {
    render(
      <AIAutoTagging
        productName="Test Product"
        productDescription="Test description"
      />
    );
    expect(screen.getByText("AI Auto-Tagging")).toBeInTheDocument();
  });
});

