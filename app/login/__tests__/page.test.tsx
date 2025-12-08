import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@/i18n/routing";
import LoginPage from "../../[locale]/login/page";

// Mock i18n routing
vi.mock("@/i18n/routing", () => ({
  useRouter: vi.fn(),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useAuthStore
const mockLogin = vi.fn();
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    login: mockLogin,
  }),
}));

describe("Login Page", () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  it("should render the login page", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("should have email input field", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should have password input field", () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should have submit button", () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole("button", { name: /login|sign in/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should have link to register page", () => {
    render(<LoginPage />);
    const registerLink = screen.getByRole("link", { name: /register|sign up/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });

  it("should have link to forgot password", () => {
    render(<LoginPage />);
    const forgotPasswordLink = screen.getByRole("link", { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it("should update email input value", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");
    
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should update password input value", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, "password123");
    
    expect(passwordInput).toHaveValue("password123");
  });
});
