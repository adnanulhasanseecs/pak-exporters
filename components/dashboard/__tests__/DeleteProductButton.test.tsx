import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteProductButton } from "../DeleteProductButton";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock products API
vi.mock("@/services/api/products", () => ({
  deleteProduct: vi.fn().mockResolvedValue(undefined),
}));

describe("DeleteProductButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render delete button", () => {
    render(<DeleteProductButton productId="1" productName="Test Product" />);

    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it("should open confirmation dialog on click", async () => {
    const user = userEvent.setup();
    render(<DeleteProductButton productId="1" productName="Test Product" />);

    const deleteButton = screen.getByText(/delete/i);
    await user.click(deleteButton);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it("should show product name in confirmation dialog", async () => {
    const user = userEvent.setup();
    render(<DeleteProductButton productId="1" productName="Test Product" />);

    const deleteButton = screen.getByText(/delete/i);
    await user.click(deleteButton);

    expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
  });

  it("should cancel deletion when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteProductButton productId="1" productName="Test Product" />);

    const deleteButton = screen.getByText(/delete/i);
    await user.click(deleteButton);

    const cancelButton = screen.getByText(/cancel/i);
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });
});

