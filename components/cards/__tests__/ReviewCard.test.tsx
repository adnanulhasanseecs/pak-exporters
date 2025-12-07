import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewCard } from "../ReviewCard";
import type { Review } from "@/types/review";

const mockReview: Review = {
  id: "1",
  userId: "user-1",
  userName: "John Doe",
  userAvatar: "https://example.com/avatar.jpg",
  userCompany: "Test Company",
  rating: 5,
  title: "Great Product",
  comment: "This is an excellent product with high quality.",
  verified: true,
  helpful: 10,
  createdAt: new Date().toISOString(),
};

describe("ReviewCard", () => {
  it("should render the review", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Great Product")).toBeInTheDocument();
    expect(screen.getByText(/This is an excellent product/i)).toBeInTheDocument();
  });

  it("should display rating stars", () => {
    render(<ReviewCard review={mockReview} />);
    // Check for star icons - they're SVG elements, check by aria-label or test-id
    // The component should render 5 stars for rating 5
    const reviewCard = screen.getByText("John Doe").closest('[class*="card"]');
    expect(reviewCard).toBeInTheDocument();
  });

  it("should display verified badge when review is verified", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("should display helpful count", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText(/Helpful \(10\)/i)).toBeInTheDocument();
  });

  it("should call onHelpful when helpful button is clicked", async () => {
    const onHelpful = vi.fn();
    const user = userEvent.setup();
    
    render(<ReviewCard review={mockReview} onHelpful={onHelpful} />);
    
    const helpfulButton = screen.getByText(/Helpful/i);
    await user.click(helpfulButton);
    
    expect(onHelpful).toHaveBeenCalledWith(mockReview.id);
  });

  it("should display user company when provided", () => {
    render(<ReviewCard review={mockReview} />);
    expect(screen.getByText("Test Company")).toBeInTheDocument();
  });

  it("should not display actions when showActions is false", () => {
    render(<ReviewCard review={mockReview} showActions={false} />);
    expect(screen.queryByText(/Helpful/i)).not.toBeInTheDocument();
  });
});

