import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RFQPage from "../../[locale]/rfq/page";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchCategories } from "@/services/api/categories";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/store/useAuthStore");
vi.mock("@/services/api/categories");
vi.mock("@/services/api/rfq", () => ({
  createRFQ: vi.fn(),
}));
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockCategories = [
  { id: "1", name: "Textiles & Apparel", slug: "textiles-apparel", productCount: 10, level: 1, order: 1 },
  { id: "2", name: "Electronics", slug: "electronics", productCount: 5, level: 1, order: 2 },
];

const mockBuyerUser = {
  id: "buyer-1",
  name: "Test Buyer",
  email: "buyer@test.com",
  role: "buyer" as const,
};

const mockSupplierUser = {
  id: "supplier-1",
  name: "Test Supplier",
  email: "supplier@test.com",
  role: "supplier" as const,
};

describe("RFQPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockBuyerUser,
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });
    vi.mocked(fetchCategories).mockResolvedValue(mockCategories);
  });

  it("should render RFQ form", async () => {
    render(<RFQPage />);
    await waitFor(() => {
      expect(screen.getByText("Submit Request for Quotation")).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Category/i).length).toBeGreaterThan(0); // Category label exists
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it("should redirect to login if user is not authenticated", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<RFQPage />);
    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Please log in to submit an RFQ");
    });
  });

  it("should redirect to dashboard if user is not a buyer", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockSupplierUser,
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<RFQPage />);
    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Only buyers can submit RFQs");
    });
  });

  it("should show validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<RFQPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /Submit RFQ/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Category is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
  });

  it("should clear errors when user types in fields", async () => {
    const user = userEvent.setup();
    render(<RFQPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });

    // Submit empty form to trigger errors
    const submitButton = screen.getByRole("button", { name: /Submit RFQ/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
    });

    // Type in title field - error should clear
    await user.type(screen.getByLabelText(/Title/i), "Test");
    await waitFor(() => {
      expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    });
  });

  it("should render all form fields", async () => {
    render(<RFQPage />);
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });
    expect(screen.getAllByText(/Category/i).length).toBeGreaterThan(0); // Category label exists
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline/i)).toBeInTheDocument();
  });

  it("should load categories on mount", async () => {
    render(<RFQPage />);
    await waitFor(() => {
      expect(vi.mocked(fetchCategories)).toHaveBeenCalled();
    });
  });
});
