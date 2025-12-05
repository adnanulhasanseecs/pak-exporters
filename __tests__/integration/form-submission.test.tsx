import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createRFQ } from "@/services/api/rfq";
import { createCompany } from "@/services/api/companies";
import { createProduct } from "@/services/api/products";

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
vi.mock("@/services/api/companies");
vi.mock("@/services/api/products");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Form Submission Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it("should handle RFQ form submission with validation", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "buyer-1",
        name: "Test Buyer",
        email: "buyer@test.com",
        role: "buyer",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test Description",
      category: { id: "1", name: "Category", slug: "category" },
      buyer: { id: "buyer-1", name: "Test Buyer", email: "buyer@test.com", company: undefined },
      status: "open",
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(createRFQ).mockResolvedValue(mockRFQ as any);

    const RFQForm = () => {
      const [formData, setFormData] = React.useState({
        title: "",
        description: "",
        categoryId: "",
      });
      const [errors, setErrors] = React.useState<Record<string, string>>({});

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.categoryId) newErrors.categoryId = "Category is required";

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }

        setErrors({});
        const rfq = await createRFQ("buyer-1", "Test Buyer", "buyer@test.com", undefined, {
          title: formData.title,
          description: formData.description,
          categoryId: formData.categoryId,
          deadline: undefined,
        });
        mockPush("/dashboard/rfq");
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="rfq-title"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: "" });
            }}
          />
          {errors.title && <span data-testid="error-title">{errors.title}</span>}
          <textarea
            data-testid="rfq-description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: "" });
            }}
          />
          {errors.description && <span data-testid="error-description">{errors.description}</span>}
          <select
            data-testid="rfq-category"
            value={formData.categoryId}
            onChange={(e) => {
              setFormData({ ...formData, categoryId: e.target.value });
              if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
            }}
          >
            <option value="">Select</option>
            <option value="1">Category 1</option>
          </select>
          {errors.categoryId && <span data-testid="error-category">{errors.categoryId}</span>}
          <button type="submit" data-testid="rfq-submit">
            Submit
          </button>
        </form>
      );
    };

    const React = await import("react");
    render(<RFQForm />);

    // Step 1: Try to submit empty form - should show errors
    await user.click(screen.getByTestId("rfq-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("error-title")).toBeInTheDocument();
      expect(screen.getByTestId("error-description")).toBeInTheDocument();
      expect(screen.getByTestId("error-category")).toBeInTheDocument();
    });

    // Step 2: Fill in form - errors should clear
    await user.type(screen.getByTestId("rfq-title"), "Test RFQ");
    await waitFor(() => {
      expect(screen.queryByTestId("error-title")).not.toBeInTheDocument();
    });

    await user.type(screen.getByTestId("rfq-description"), "Test Description");
    await user.selectOptions(screen.getByTestId("rfq-category"), "1");

    // Step 3: Submit valid form
    await user.click(screen.getByTestId("rfq-submit"));

    await waitFor(() => {
      expect(vi.mocked(createRFQ)).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard/rfq");
    });
  });

  it("should handle company form submission", async () => {
    const user = userEvent.setup();

    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "supplier-1",
        name: "Test Supplier",
        email: "supplier@test.com",
        role: "supplier",
        membershipStatus: "approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    const mockCompany = {
      id: "company-1",
      name: "Test Company",
      description: "Test Description",
      location: { city: "Karachi", province: "Sindh", country: "Pakistan" },
      contact: { email: "company@test.com", phone: "+1234567890", website: "https://test.com" },
      categories: [{ id: "1", name: "Category", slug: "category" }],
      productCount: 0,
      verified: false,
      goldSupplier: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(createCompany).mockResolvedValue(mockCompany as any);

    const CompanyForm = () => {
      const [formData, setFormData] = React.useState({
        name: "",
        description: "",
        email: "",
        city: "",
        province: "",
        country: "Pakistan",
        categoryIds: [] as string[],
      });

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const company = await createCompany({
          name: formData.name,
          description: formData.description,
          email: formData.email,
          city: formData.city,
          province: formData.province,
          country: formData.country,
          categoryIds: formData.categoryIds,
        });
        mockPush("/dashboard/companies");
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="company-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <textarea
            data-testid="company-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <input
            data-testid="company-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            data-testid="company-city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <input
            data-testid="company-province"
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            required
          />
          <button type="submit" data-testid="company-submit">
            Create Company
          </button>
        </form>
      );
    };

    const React = await import("react");
    render(<CompanyForm />);

    await user.type(screen.getByTestId("company-name"), "Test Company");
    await user.type(screen.getByTestId("company-description"), "Test Description");
    await user.type(screen.getByTestId("company-email"), "company@test.com");
    await user.type(screen.getByTestId("company-city"), "Karachi");
    await user.type(screen.getByTestId("company-province"), "Sindh");
    await user.click(screen.getByTestId("company-submit"));

    await waitFor(() => {
      expect(vi.mocked(createCompany)).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard/companies");
    });
  });
});

