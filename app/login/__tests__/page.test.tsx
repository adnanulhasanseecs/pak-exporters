import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../page";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

const mockLogin = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: mockRefresh,
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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockRefresh.mockClear();
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      token: null,
      login: mockLogin,
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });
  });

  it("should render login form", () => {
    render(<LoginPage />);
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0); // Title and button both have "Sign In"
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
  });

  it("should render forgot password link", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  });

  it("should render sign up link", () => {
    render(<LoginPage />);
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it("should handle admin login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "admin@admin.com");
    await user.type(passwordInput, "12345678");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalled();
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Admin login successful!");
      },
      { timeout: 2000 }
    );
  });

  it("should handle buyer login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "buyer@test.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalled();
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Login successful!");
      },
      { timeout: 2000 }
    );
  });

  it("should handle supplier login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "supplier@test.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalled();
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Login successful!");
        expect(vi.mocked(toast.info)).toHaveBeenCalledWith(
          "Please complete your membership application to access all features"
        );
      },
      { timeout: 2000 }
    );
  });

  it("should show loading state during login", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Signing in/i })).toBeDisabled();
    });
  });

  it("should handle login errors", async () => {
    const user = userEvent.setup();
    // Mock login to throw an error
    mockLogin.mockImplementationOnce(() => {
      throw new Error("Login failed");
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Sign In/i });

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Login failed. Please try again.");
      },
      { timeout: 2000 }
    );
  });

  it("should require email and password", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });
});

