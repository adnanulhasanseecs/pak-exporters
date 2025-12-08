import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "../../[locale]/forgot-password/page";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock i18n routing
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Forgot Password Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the forgot password page", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole("heading", { name: /forgot password/i })).toBeInTheDocument();
  });

  it("should display description", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByText(/Enter your email address and we'll send you a reset link/i)
    ).toBeInTheDocument();
  });

  it("should display email input field", () => {
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should have submit button", () => {
    render(<ForgotPasswordPage />);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should have link back to login", () => {
    render(<ForgotPasswordPage />);
    const loginLink = screen.getByRole("link", { name: /back to login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should update email input value", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");
    
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("should show success message after submission", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send reset link/i });
    
    await user.type(emailInput, "test@example.com");
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});

