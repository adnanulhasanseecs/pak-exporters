import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "../Header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/",
  }),
  usePathname: () => "/",
}));

// Mock zustand store
vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
    setUser: vi.fn(),
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render logo", () => {
    render(<Header />);
    // Header has two logos (light and dark mode), so use getAllByAltText
    const logos = screen.getAllByAltText(/pak-exporters logo/i);
    expect(logos.length).toBeGreaterThan(0);
  });

  it("should render navigation links", () => {
    render(<Header />);
    expect(screen.getByText(/categories/i)).toBeInTheDocument();
    expect(screen.getByText(/products/i)).toBeInTheDocument();
    expect(screen.getByText(/suppliers/i)).toBeInTheDocument();
  });

  it("should render search bar", () => {
    render(<Header />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("should render sign in and join free buttons when not authenticated", () => {
    render(<Header />);
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/join free/i)).toBeInTheDocument();
  });

  it("should render user profile when authenticated", async () => {
    // Re-import and re-mock useAuthStore
    const authModule = await import("@/store/useAuthStore");
    vi.mocked(authModule).useAuthStore = vi.fn(() => ({
      user: {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "supplier",
      },
      token: "mock-token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    }));

    const { rerender } = render(<Header />);

    // Force re-render with new mock
    rerender(<Header />);

    await waitFor(() => {
      // Check for user profile elements (name, email, or avatar)
      const hasUserProfile = 
        screen.queryByText(/test user/i) || 
        screen.queryByText(/test@example.com/i) ||
        screen.queryByRole("button", { name: /test user/i });
      expect(hasUserProfile).toBeTruthy();
    }, { timeout: 3000 });
  });
});

