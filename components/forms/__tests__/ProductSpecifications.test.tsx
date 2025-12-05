import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductSpecifications } from "../ProductSpecifications";

describe("ProductSpecifications", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state", () => {
    render(<ProductSpecifications specifications={{}} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/value/i)).toBeInTheDocument();
  });

  it("should display existing specifications", () => {
    const specs = {
      Material: "Cotton",
      Size: "Large",
    };

    render(<ProductSpecifications specifications={specs} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue("Material")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Cotton")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Size")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
  });

  it("should add new specification", async () => {
    const user = userEvent.setup();
    render(<ProductSpecifications specifications={{}} onChange={mockOnChange} />);

    const keyInput = screen.getByLabelText(/key/i);
    const valueInput = screen.getByLabelText(/value/i);
    // Find the add button by its icon (Plus icon)
    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((btn) => btn.querySelector("svg.lucide-plus"));

    await user.type(keyInput, "Color");
    await user.type(valueInput, "Red");
    if (addButton) {
      await user.click(addButton);
    }

    expect(mockOnChange).toHaveBeenCalledWith({ Color: "Red" });
  });

  it("should add specification on Enter key", async () => {
    const user = userEvent.setup();
    render(<ProductSpecifications specifications={{}} onChange={mockOnChange} />);

    const keyInput = screen.getByLabelText(/key/i);
    const valueInput = screen.getByLabelText(/value/i);

    await user.type(keyInput, "Weight");
    await user.type(valueInput, "500g");
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith({ Weight: "500g" });
  });

  it("should remove specification", async () => {
    const user = userEvent.setup();
    const specs = {
      Material: "Cotton",
      Size: "Large",
    };

    render(<ProductSpecifications specifications={specs} onChange={mockOnChange} />);

    // Find remove buttons by X icon
    const buttons = screen.getAllByRole("button");
    const removeButtons = buttons.filter((btn) => btn.querySelector("svg.lucide-x"));
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith({ Size: "Large" });
  });

  it("should not add empty specification", async () => {
    const user = userEvent.setup();
    render(<ProductSpecifications specifications={{}} onChange={mockOnChange} />);

    // Find add button by Plus icon
    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((btn) => btn.querySelector("svg.lucide-plus"));
    
    if (addButton) {
      // Button should be disabled when inputs are empty
      expect(addButton).toBeDisabled();
      await user.click(addButton);
      expect(mockOnChange).not.toHaveBeenCalled();
    }
  });

  it("should clear inputs after adding", async () => {
    const user = userEvent.setup();
    render(<ProductSpecifications specifications={{}} onChange={mockOnChange} />);

    const keyInput = screen.getByLabelText(/key/i);
    const valueInput = screen.getByLabelText(/value/i);
    // Find the add button by its icon (Plus icon)
    const buttons = screen.getAllByRole("button");
    const addButton = buttons.find((btn) => btn.querySelector("svg.lucide-plus"));

    await user.type(keyInput, "Brand");
    await user.type(valueInput, "Test Brand");
    if (addButton) {
      await user.click(addButton);
    }

    await waitFor(() => {
      expect(keyInput).toHaveValue("");
      expect(valueInput).toHaveValue("");
    });
  });
});

