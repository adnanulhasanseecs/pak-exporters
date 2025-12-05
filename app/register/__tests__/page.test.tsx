import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "../page";
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

describe("RegisterPage", () => {
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

  it("should render registration form", () => {
    render(<RegisterPage />);
    expect(screen.getAllByText("Create Account").length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Password/i).length).toBeGreaterThanOrEqual(2); // Password and Confirm Password
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  it("should render role selection", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/I am a/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Buyer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Supplier/i)).toBeInTheDocument();
  });

  it("should default to buyer role", () => {
    render(<RegisterPage />);
    const buyerRadio = screen.getByLabelText(/Buyer/i);
    expect(buyerRadio).toBeChecked();
  });

  it("should allow role selection", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const supplierRadio = screen.getByLabelText(/Supplier/i);
    await user.click(supplierRadio);

    expect(supplierRadio).toBeChecked();
  });

  it("should show error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Create Account/i });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "differentpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Passwords do not match");
    });
  });

  it("should register buyer successfully", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Create Account/i });

    await user.type(nameInput, "Test Buyer");
    await user.type(emailInput, "buyer@test.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalled();
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Registration successful!");
      },
      { timeout: 2000 }
    );
  });

  it("should register supplier and redirect to membership application", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const supplierRadio = screen.getByLabelText(/Supplier/i);
    const submitButton = screen.getByRole("button", { name: /Create Account/i });

    await user.type(nameInput, "Test Supplier");
    await user.type(emailInput, "supplier@test.com");
    await user.click(supplierRadio);
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalled();
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Registration successful!");
        expect(vi.mocked(toast.info)).toHaveBeenCalledWith(
          "Please complete your membership application to start uploading products"
        );
      },
      { timeout: 2000 }
    );
  });

  it("should show loading state during registration", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Create Account/i });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Creating account/i })).toBeDisabled();
    });
  });

  it("should handle registration errors", async () => {
    const user = userEvent.setup();
    // Mock login to throw an error
    mockLogin.mockImplementationOnce(() => {
      throw new Error("Registration failed");
    });

    render(<RegisterPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Create Account/i });

    await user.type(nameInput, "Test User");
    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "password123");
    await user.type(confirmPasswordInput, "password123");
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Registration failed. Please try again.");
      },
      { timeout: 2000 }
    );
  });

  it("should require all fields", () => {
    render(<RegisterPage />);
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInputs = screen.getAllByLabelText(/Password/i);
    const passwordInput = passwordInputs[0]; // First one is Password
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it("should render sign in link", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });
});

