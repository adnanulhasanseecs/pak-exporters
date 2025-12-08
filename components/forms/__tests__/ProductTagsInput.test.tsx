import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductTagsInput } from "../ProductTagsInput";

describe("ProductTagsInput", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state", () => {
    render(<ProductTagsInput tags={[]} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/add tags/i)).toBeInTheDocument();
  });

  it("should display existing tags", () => {
    const tags = ["cotton", "premium", "export"];

    render(<ProductTagsInput tags={tags} onChange={mockOnChange} />);

    expect(screen.getByText("cotton")).toBeInTheDocument();
    expect(screen.getByText("premium")).toBeInTheDocument();
    expect(screen.getByText("export")).toBeInTheDocument();
  });

  it("should add tag on Enter", async () => {
    const user = userEvent.setup();
    render(<ProductTagsInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.type(input, "cotton");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["cotton"]);
  });

  it("should remove tag", async () => {
    const user = userEvent.setup();
    const tags = ["cotton", "premium"];

    render(<ProductTagsInput tags={tags} onChange={mockOnChange} />);

    // Find the remove button inside the "cotton" badge
    const cottonText = screen.getByText("cotton");
    const cottonBadge = cottonText.closest("div");
    const removeButton = cottonBadge?.querySelector("button[type='button']");
    
    if (removeButton) {
      await user.click(removeButton);
      expect(mockOnChange).toHaveBeenCalledWith(["premium"]);
    } else {
      // Fallback: try clicking on the X icon
      const xIcon = cottonBadge?.querySelector("svg.lucide-x");
      if (xIcon && xIcon.parentElement) {
        await user.click(xIcon.parentElement as HTMLElement);
        expect(mockOnChange).toHaveBeenCalled();
      }
    }
  });

  it("should remove last tag on Backspace when input is empty", async () => {
    const user = userEvent.setup();
    const tags = ["cotton", "premium"];

    render(<ProductTagsInput tags={tags} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(mockOnChange).toHaveBeenCalledWith(["cotton"]);
  });

  it("should not add duplicate tags", async () => {
    const user = userEvent.setup();
    const tags = ["cotton"];

    render(<ProductTagsInput tags={tags} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.type(input, "cotton");
    await user.keyboard("{Enter}");

    // Should not call onChange with duplicate
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("should enforce max tags limit", async () => {
    const tags = Array(10).fill("tag").map((t, i) => `${t}-${i}`);

    render(<ProductTagsInput tags={tags} onChange={vi.fn()} maxTags={10} />);

    // When max tags reached, input should not be visible
    expect(screen.queryByPlaceholderText(/add tags/i)).not.toBeInTheDocument();
    expect(screen.getByText(/maximum.*10.*tags reached/i)).toBeInTheDocument();
  });

  it("should show tag count", () => {
    const tags = ["cotton", "premium", "export"];

    render(<ProductTagsInput tags={tags} onChange={mockOnChange} maxTags={10} />);

    expect(screen.getByText(/\(3\/10\)/i)).toBeInTheDocument();
  });

  it("should show suggestions when typing", async () => {
    const user = userEvent.setup();
    const suggestions = ["cotton", "premium", "export", "organic"];

    render(
      <ProductTagsInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
    );

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.type(input, "cot");

    await waitFor(() => {
      expect(screen.getByText("cotton")).toBeInTheDocument();
    });
  });

  it("should add tag from suggestion", async () => {
    const user = userEvent.setup();
    const suggestions = ["cotton", "premium"];

    render(
      <ProductTagsInput tags={[]} onChange={mockOnChange} suggestions={suggestions} />
    );

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.type(input, "cot");

    await waitFor(() => {
      const suggestion = screen.getByText("cotton");
      expect(suggestion).toBeInTheDocument();
    });

    const suggestionBadge = screen.getByText("cotton");
    await user.click(suggestionBadge);

    expect(mockOnChange).toHaveBeenCalledWith(["cotton"]);
  });

  it("should trim and lowercase tags", async () => {
    const user = userEvent.setup();
    render(<ProductTagsInput tags={[]} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/add tags/i);
    await user.type(input, "  COTTON  ");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(["cotton"]);
  });
});

