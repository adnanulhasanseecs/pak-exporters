import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AITrustScore } from "../AITrustScore";

describe("AITrustScore", () => {
  it("should render the component", () => {
    render(<AITrustScore />);
    expect(screen.getByText("AI Trust & Verification Score")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AITrustScore />);
    expect(
      screen.getByText(/AI will assess exporter authenticity/i)
    ).toBeInTheDocument();
  });

  it("should display default score of 0 when no score provided", () => {
    render(<AITrustScore />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("should display provided score", () => {
    render(<AITrustScore score={85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("should display trust score label", () => {
    render(<AITrustScore />);
    expect(screen.getByText("Trust Score")).toBeInTheDocument();
  });

  it("should display AI-Powered badge", () => {
    render(<AITrustScore />);
    expect(screen.getByText("AI-Powered")).toBeInTheDocument();
  });

  it("should have tooltip on AI-Powered badge", () => {
    render(<AITrustScore />);
    const badge = screen.getByText("AI-Powered");
    expect(badge).toBeInTheDocument();
  });
});

