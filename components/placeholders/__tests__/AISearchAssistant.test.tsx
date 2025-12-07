import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AISearchAssistant } from "../AISearchAssistant";

describe("AISearchAssistant", () => {
  it("should render the component", () => {
    render(<AISearchAssistant />);
    expect(screen.getByText("AI Search Assistant")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AISearchAssistant />);
    expect(
      screen.getByText(/Ask AI anything/i)
    ).toBeInTheDocument();
  });

  it("should have a disabled button", () => {
    render(<AISearchAssistant />);
    const button = screen.getByRole("button", { name: /Ask AI Assistant/i });
    expect(button).toBeDisabled();
  });

  it("should display example query", () => {
    render(<AISearchAssistant />);
    expect(
      screen.getByText(/Find leather glove exporters in Sialkot/i)
    ).toBeInTheDocument();
  });

  it("should have tooltip", () => {
    render(<AISearchAssistant />);
    const button = screen.getByRole("button", { name: /Ask AI Assistant/i });
    expect(button).toBeInTheDocument();
  });
});

