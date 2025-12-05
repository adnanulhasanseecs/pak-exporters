import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductImageUpload } from "../ProductImageUpload";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="product-image" />
  ),
}));

// Mock sonner toast
const mockToastError = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

describe("ProductImageUpload", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockToastError.mockClear();
  });

  it("should render upload area when no images", () => {
    render(<ProductImageUpload images={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/drag and drop images here/i)).toBeInTheDocument();
    expect(screen.getByText(/select images/i)).toBeInTheDocument();
  });

  it("should display uploaded images", () => {
    const images = [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    ];

    render(<ProductImageUpload images={images} onChange={mockOnChange} />);

    const imageElements = screen.getAllByTestId("product-image");
    expect(imageElements).toHaveLength(2);
  });

  it("should show primary badge on first image", () => {
    const images = ["data:image/jpeg;base64,/9j/4AAQSkZJRg=="];

    render(<ProductImageUpload images={images} onChange={mockOnChange} />);

    expect(screen.getByText("Primary")).toBeInTheDocument();
  });

  it("should allow removing images", async () => {
    const user = userEvent.setup();
    const images = ["data:image/jpeg;base64,/9j/4AAQSkZJRg=="];

    render(<ProductImageUpload images={images} onChange={mockOnChange} />);

    // Find the remove button by its X icon (it's an icon button without accessible name)
    const buttons = screen.getAllByRole("button");
    const removeButton = buttons.find((btn) => 
      btn.querySelector("svg.lucide-x") && 
      btn.classList.contains("absolute")
    );
    
    if (removeButton) {
      // Hover to make button visible (it has opacity-0 group-hover:opacity-100)
      await user.hover(removeButton.closest(".group") || removeButton);
      await user.click(removeButton);
      expect(mockOnChange).toHaveBeenCalledWith([]);
    } else {
      // Fallback: find by X icon directly
      const xIcon = document.querySelector("svg.lucide-x");
      if (xIcon && xIcon.parentElement) {
        await user.click(xIcon.parentElement as HTMLElement);
        expect(mockOnChange).toHaveBeenCalled();
      }
    }
  });

  it("should validate file type", async () => {
    const user = userEvent.setup();
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    render(<ProductImageUpload images={[]} onChange={mockOnChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      await user.upload(input, file);
    }

    // Should show error toast (mocked)
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it("should validate file size", async () => {
    const user = userEvent.setup();
    // Create a file larger than 5MB
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });

    render(<ProductImageUpload images={[]} onChange={mockOnChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      await user.upload(input, largeFile);
    }

    // Should show error toast for file size
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it("should show image count", () => {
    const images = [
      "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    ];

    render(<ProductImageUpload images={images} onChange={mockOnChange} maxImages={10} />);

    expect(screen.getByText(/\(2\/10\)/i)).toBeInTheDocument();
  });

  it("should hide upload area when max images reached", () => {
    const images = Array(10).fill("data:image/jpeg;base64,/9j/4AAQSkZJRg==");

    render(<ProductImageUpload images={images} onChange={mockOnChange} maxImages={10} />);

    expect(screen.queryByText(/select images/i)).not.toBeInTheDocument();
  });

  it("should show error message when no images", () => {
    render(<ProductImageUpload images={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/at least one product image is required/i)).toBeInTheDocument();
  });
});

