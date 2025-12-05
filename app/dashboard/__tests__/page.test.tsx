import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "../page";
import { useAuthStore } from "@/store/useAuthStore";

const mockPush = vi.fn();

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/store/useAuthStore");
vi.mock("@/components/dashboard/DashboardContent", () => ({
  DashboardContent: () => <div data-testid="dashboard-content">Dashboard Content</div>,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it("should render dashboard content for buyer", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "1",
        email: "buyer@test.com",
        name: "Test Buyer",
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

    render(<DashboardPage />);
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  it("should render dashboard content for supplier", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "1",
        email: "supplier@test.com",
        name: "Test Supplier",
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

    render(<DashboardPage />);
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });

  it("should redirect admin users to admin dashboard", async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "admin-1",
        email: "admin@admin.com",
        name: "Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin");
    });
    
    // Should not render dashboard content for admin
    expect(screen.queryByTestId("dashboard-content")).not.toBeInTheDocument();
  });

  it("should return null for admin users", () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "admin-1",
        email: "admin@admin.com",
        name: "Admin",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
      updateUser: vi.fn(),
    });

    const { container } = render(<DashboardPage />);
    // Should render nothing (null) for admin
    expect(container.firstChild).toBeNull();
  });
});

