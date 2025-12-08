/**
 * Membership application API service
 * Real implementation using Next.js API routes
 */

import type {
  MembershipApplication,
  MembershipApplicationListResponse,
} from "@/types/membership";
import type { PaginationParams } from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Fetch all membership applications with filters and pagination
 */
export async function fetchMembershipApplications(
  filters?: { status?: "pending" | "approved" | "rejected" },
  pagination?: PaginationParams
): Promise<MembershipApplicationListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (pagination?.page) {
    params.append("page", pagination.page.toString());
  }
  if (pagination?.pageSize) {
    params.append("pageSize", pagination.pageSize.toString());
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_ENDPOINTS.membership || "/api/membership"}?${params.toString()}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch membership applications");
  }

  return response.json();
}

/**
 * Fetch a single membership application by ID
 */
export async function fetchMembershipApplication(
  id: string
): Promise<MembershipApplication> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_ENDPOINTS.membership || "/api/membership"}/${id}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to fetch membership application with id ${id}`);
  }

  return response.json();
}

/**
 * Create a new membership application
 */
export async function createMembershipApplication(
  _userId: string,
  _userEmail: string,
  _userName: string,
  applicationData: Omit<
    MembershipApplication,
    "id" | "userId" | "userEmail" | "userName" | "status" | "submittedAt"
  >
): Promise<MembershipApplication> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_ENDPOINTS.membership || "/api/membership"}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...applicationData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create membership application");
  }

  return response.json();
}

/**
 * Approve a membership application
 */
export async function approveMembershipApplication(
  applicationId: string,
  _reviewedBy: string
): Promise<MembershipApplication> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_ENDPOINTS.membership || "/api/membership"}/${applicationId}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        status: "approved",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to approve membership application ${applicationId}`);
  }

  return response.json();
}

/**
 * Reject a membership application
 */
export async function rejectMembershipApplication(
  applicationId: string,
  _reviewedBy: string,
  rejectionReason?: string
): Promise<MembershipApplication> {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_ENDPOINTS.membership || "/api/membership"}/${applicationId}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        status: "rejected",
        rejectionReason,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to reject membership application ${applicationId}`);
  }

  return response.json();
}

/**
 * Load applications from localStorage on client side
 * @deprecated - Use fetchMembershipApplications instead
 */
export function loadApplicationsFromStorage(): MembershipApplication[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem("membership-applications");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading applications from storage:", error);
  }
  
  return [];
}
