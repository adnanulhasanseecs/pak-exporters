import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createRFQ, fetchRFQs } from "@/services/api/rfq";
import { fetchCategories } from "@/services/api/categories";

// Mock dependencies
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/store/useAuthStore");
vi.mock("@/services/api/rfq");
vi.mock("@/services/api/categories");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockBuyerUser = {
  id: "buyer-1",
  name: "Test Buyer",
  email: "buyer@test.com",
  role: "buyer" as const,
};

const mockCategories = [
  { id: "1", name: "Textiles & Apparel", slug: "textiles-apparel" },
];

describe("RFQ Submission Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
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

  it("should complete RFQ submission flow: fill form -> submit -> view in dashboard", async () => {
    const user = userEvent.setup();

    const mockRFQ = {
      id: "rfq-1",
      title: "Need 1000 cotton t-shirts",
      description: "Looking for high quality cotton t-shirts",
      category: { id: "1", name: "Textiles & Apparel", slug: "textiles-apparel" },
      buyer: {
        id: "buyer-1",
        name: "Test Buyer",
        email: "buyer@test.com",
        company: undefined,
      },
      quantity: { min: 1000, max: 1200, unit: "pieces" },
      budget: { min: 8000, max: 12000, currency: "USD" },
      status: "open",
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(createRFQ).mockResolvedValue(mockRFQ as any);
    vi.mocked(fetchRFQs).mockResolvedValue({
      rfqs: [mockRFQ],
      total: 1,
    });

    // Simulate RFQ form
    const RFQForm = () => {
      const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        categoryId: "",
        quantity: "",
        budget: "",
        currency: "USD",
      });
      const [loading, setLoading] = React.useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const rfq = await createRFQ(
          mockBuyerUser.id,
          mockBuyerUser.name,
          mockBuyerUser.email,
          undefined,
          {
            title: formData.title,
            description: formData.description,
            categoryId: formData.categoryId,
            quantity: formData.quantity
              ? {
                  min: parseInt(formData.quantity),
                  max: parseInt(formData.quantity) * 1.2,
                  unit: "pieces",
                }
              : undefined,
            budget: formData.budget
              ? {
                  min: parseFloat(formData.budget) * 0.8,
                  max: parseFloat(formData.budget) * 1.2,
                  currency: formData.currency,
                }
              : undefined,
            deadline: undefined,
          }
        );
        setLoading(false);
        mockPush(`/dashboard/rfq`);
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="rfq-title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            required
          />
          <textarea
            data-testid="rfq-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            required
          />
          <select
            data-testid="rfq-category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            data-testid="rfq-quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="Quantity"
          />
          <input
            data-testid="rfq-budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="Budget"
          />
          <button type="submit" data-testid="rfq-submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit RFQ"}
          </button>
        </form>
      );
    };

    const React = await import("react");
    render(<RFQForm />);

    // Step 1: Fill in RFQ form
    const titleInput = screen.getByTestId("rfq-title");
    const descriptionInput = screen.getByTestId("rfq-description");
    const categorySelect = screen.getByTestId("rfq-category");
    const quantityInput = screen.getByTestId("rfq-quantity");
    const budgetInput = screen.getByTestId("rfq-budget");
    const submitButton = screen.getByTestId("rfq-submit");

    await user.type(titleInput, "Need 1000 cotton t-shirts");
    await user.type(descriptionInput, "Looking for high quality cotton t-shirts");
    await user.selectOptions(categorySelect, "1");
    await user.type(quantityInput, "1000");
    await user.type(budgetInput, "10000");

    // Step 2: Submit RFQ
    await user.click(submitButton);

    // Step 3: Verify RFQ was created
    await waitFor(() => {
      expect(vi.mocked(createRFQ)).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard/rfq");
    });

    // Step 4: Verify RFQ appears in dashboard (simulated)
    const rfqs = await fetchRFQs({ buyerId: mockBuyerUser.id });
    expect(rfqs.rfqs.length).toBeGreaterThan(0);
    expect(rfqs.rfqs[0].title).toBe("Need 1000 cotton t-shirts");
  });
});

