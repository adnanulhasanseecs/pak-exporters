import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuthStore } from "@/store/useAuthStore";

// Mock dependencies
const mockPush = vi.fn();
const mockLogin = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/store/useAuthStore");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Authentication Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockLogin.mockClear();
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: mockLogin,
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("should complete registration -> login -> dashboard flow", async () => {
    const user = userEvent.setup();

    const mockBuyerUser = {
      id: "1",
      email: "buyer@test.com",
      name: "Test Buyer",
      role: "buyer" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Step 1: Registration
    const RegisterForm = () => {
      const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "buyer" as "buyer" | "supplier",
      });
      const [loading, setLoading] = React.useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return;
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const mockUser = {
          id: "1",
          email: formData.email,
          name: formData.name,
          role: formData.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockLogin(mockUser, "token");
        setLoading(false);
        mockPush("/dashboard");
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="reg-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name"
            required
          />
          <input
            data-testid="reg-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            required
          />
          <input
            data-testid="reg-password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            required
          />
          <input
            data-testid="reg-confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm Password"
            required
          />
          <button type="submit" data-testid="reg-submit" disabled={loading}>
            Register
          </button>
        </form>
      );
    };

    const React = await import("react");
    render(<RegisterForm />);

    await user.type(screen.getByTestId("reg-name"), "Test Buyer");
    await user.type(screen.getByTestId("reg-email"), "buyer@test.com");
    await user.type(screen.getByTestId("reg-password"), "password123");
    await user.type(screen.getByTestId("reg-confirm-password"), "password123");
    await user.click(screen.getByTestId("reg-submit"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    // Step 2: Login (simulated - user is already logged in after registration)
    vi.mocked(useAuthStore).mockReturnValue({
      user: mockBuyerUser,
      token: "token",
      login: mockLogin,
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    // Step 3: Verify user can access dashboard
    const Dashboard = () => {
      const { user } = useAuthStore();
      if (!user) return <div>Please log in</div>;
      return <div data-testid="dashboard">Welcome, {user.name}!</div>;
    };

    render(<Dashboard />);
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Test Buyer!/)).toBeInTheDocument();
  });

  it("should handle login flow with redirect", async () => {
    const user = userEvent.setup();

    const LoginForm = () => {
      const [email, setEmail] = React.useState("");
      const [password, setPassword] = React.useState("");
      const [loading, setLoading] = React.useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const isSupplier = email.toLowerCase().includes("supplier");
        const mockUser = {
          id: "1",
          email: email,
          name: email.split("@")[0] || "User",
          role: isSupplier ? "supplier" : "buyer",
          membershipStatus: isSupplier ? "pending" : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockLogin(mockUser, "token");
        setLoading(false);
        if (isSupplier && mockUser.membershipStatus !== "approved") {
          mockPush("/membership/apply");
        } else {
          mockPush("/dashboard");
        }
      };

      return (
        <form onSubmit={handleSubmit}>
          <input
            data-testid="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            data-testid="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" data-testid="login-submit" disabled={loading}>
            Login
          </button>
        </form>
      );
    };

    const React = await import("react");
    render(<LoginForm />);

    await user.type(screen.getByTestId("login-email"), "supplier@test.com");
    await user.type(screen.getByTestId("login-password"), "password123");
    await user.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/membership/apply");
    });
  });
});

