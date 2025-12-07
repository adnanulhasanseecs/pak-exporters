import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIInsightsDashboard } from "../AIInsightsDashboard";

describe("AIInsightsDashboard", () => {
  it("should render the component", () => {
    render(<AIInsightsDashboard />);
    expect(screen.getByText("AI Insights Dashboard")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AIInsightsDashboard />);
    expect(
      screen.getByText(/Get AI-powered insights about your business/i)
    ).toBeInTheDocument();
  });

  it("should have a disabled button", () => {
    render(<AIInsightsDashboard />);
    const button = screen.getByRole("button", { name: /View Full Insights/i });
    expect(button).toBeDisabled();
  });

  it("should display insights count badge when provided", () => {
    render(<AIInsightsDashboard insightsCount={10} />);
    expect(screen.getByText("10 Insights")).toBeInTheDocument();
  });

  it("should display insight categories", () => {
    render(<AIInsightsDashboard />);
    expect(screen.getByText("Sales Trends")).toBeInTheDocument();
    expect(screen.getByText("Market Analysis")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
  });
});

