import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIMatchmaking } from "../AIMatchmaking";

describe("AIMatchmaking", () => {
  it("should render the component", () => {
    render(<AIMatchmaking />);
    expect(screen.getByText("AI Buyer-Supplier Matchmaking")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AIMatchmaking />);
    expect(
      screen.getByText(/Find the best suppliers for your RFQ/i)
    ).toBeInTheDocument();
  });

  it("should have a disabled button", () => {
    render(<AIMatchmaking />);
    const button = screen.getByRole("button", { name: /Find Matches/i });
    expect(button).toBeDisabled();
  });

  it("should display potential matches count when provided", () => {
    render(<AIMatchmaking potentialMatches={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Potential Matches")).toBeInTheDocument();
  });

  it("should not display matches count when zero", () => {
    render(<AIMatchmaking potentialMatches={0} />);
    expect(screen.queryByText("Potential Matches")).not.toBeInTheDocument();
  });

  it("should accept rfqId prop", () => {
    render(<AIMatchmaking rfqId="rfq-123" />);
    expect(screen.getByText("AI Buyer-Supplier Matchmaking")).toBeInTheDocument();
  });
});

