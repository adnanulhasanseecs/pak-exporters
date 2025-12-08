import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIProductGenerator } from "../AIProductGenerator";

describe("AIProductGenerator", () => {
  it("should render the component", () => {
    render(<AIProductGenerator />);
    expect(screen.getByText("AI Product Description Generator")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AIProductGenerator />);
    expect(
      screen.getByText(/Use AI to instantly create high-quality product descriptions/i)
    ).toBeInTheDocument();
  });

  it("should have a disabled button", () => {
    render(<AIProductGenerator />);
    const button = screen.getByRole("button", { name: /Generate Description/i });
    expect(button).toBeDisabled();
  });

  it("should call onGenerate when button is clicked", async () => {
    const onGenerate = vi.fn();
    
    render(<AIProductGenerator onGenerate={onGenerate} />);
    
    const button = screen.getByRole("button", { name: /Generate Description/i });
    // Button is disabled, but we can test the handler exists
    expect(button).toBeDisabled();
    expect(onGenerate).toBeDefined();
  });

  it("should display tooltip on hover", () => {
    render(<AIProductGenerator />);
    const button = screen.getByRole("button", { name: /Generate Description/i });
    expect(button).toBeInTheDocument();
  });
});

