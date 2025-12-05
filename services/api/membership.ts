/**
 * Membership application API service
 * Mock implementation - ready for backend integration
 */

import type {
  MembershipApplication,
  MembershipApplicationListResponse,
} from "@/types/membership";
import type { PaginationParams } from "@/types/api";
import membershipApplicationsData from "@/services/mocks/membership-applications.json";

/**
 * Mock delay to simulate API call
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch all membership applications with filters and pagination
 */
export async function fetchMembershipApplications(
  filters?: { status?: "pending" | "approved" | "rejected" },
  pagination?: PaginationParams
): Promise<MembershipApplicationListResponse> {
  await delay(300);

  // Load from localStorage if available (client-side)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("membership-applications");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Update the in-memory data
        (membershipApplicationsData as any[]).length = 0;
        (membershipApplicationsData as any[]).push(...parsed);
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }

  let filteredApplications = [...(membershipApplicationsData as MembershipApplication[])];

  // Apply filters
  if (filters?.status) {
    filteredApplications = filteredApplications.filter(
      (app) => app.status === filters.status
    );
  }

  // Sort by submitted date (newest first)
  filteredApplications.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);
  const total = filteredApplications.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    applications: paginatedApplications,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single membership application by ID
 */
export async function fetchMembershipApplication(
  id: string
): Promise<MembershipApplication> {
  await delay(200);

  const application = (membershipApplicationsData as MembershipApplication[]).find(
    (app) => app.id === id
  );

  if (!application) {
    throw new Error(`Membership application with id ${id} not found`);
  }

  return application;
}

/**
 * Create a new membership application
 */
export async function createMembershipApplication(
  userId: string,
  userEmail: string,
  userName: string,
  applicationData: Omit<
    MembershipApplication,
    "id" | "userId" | "userEmail" | "userName" | "status" | "submittedAt"
  >
): Promise<MembershipApplication> {
  await delay(300);

  const newApplication: MembershipApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userEmail,
    userName,
    status: "pending",
    submittedAt: new Date().toISOString(),
    ...applicationData,
  };

  (membershipApplicationsData as MembershipApplication[]).push(newApplication);

  // Save to localStorage for persistence across page refreshes
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("membership-applications");
      const applications = existing ? JSON.parse(existing) : [];
      applications.push(newApplication);
      localStorage.setItem("membership-applications", JSON.stringify(applications));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return newApplication;
}

/**
 * Approve a membership application
 */
export async function approveMembershipApplication(
  applicationId: string,
  reviewedBy: string
): Promise<MembershipApplication> {
  await delay(300);

  const applications = membershipApplicationsData as MembershipApplication[];
  const application = applications.find((app) => app.id === applicationId);

  if (!application) {
    throw new Error(`Membership application with id ${applicationId} not found`);
  }

  application.status = "approved";
  application.reviewedAt = new Date().toISOString();
  application.reviewedBy = reviewedBy;

  // Update localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "membership-applications",
        JSON.stringify(applications)
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return application;
}

/**
 * Reject a membership application
 */
export async function rejectMembershipApplication(
  applicationId: string,
  reviewedBy: string,
  rejectionReason?: string
): Promise<MembershipApplication> {
  await delay(300);

  const applications = membershipApplicationsData as MembershipApplication[];
  const application = applications.find((app) => app.id === applicationId);

  if (!application) {
    throw new Error(`Membership application with id ${applicationId} not found`);
  }

  application.status = "rejected";
  application.reviewedAt = new Date().toISOString();
  application.reviewedBy = reviewedBy;
  if (rejectionReason) {
    application.rejectionReason = rejectionReason;
  }

  // Update localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "membership-applications",
        JSON.stringify(applications)
      );
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  return application;
}

/**
 * Load applications from localStorage on client side
 */
export function loadApplicationsFromStorage(): MembershipApplication[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem("membership-applications");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Update the in-memory data
      (membershipApplicationsData as any[]).length = 0;
      (membershipApplicationsData as any[]).push(...parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Error loading applications from storage:", error);
  }
  
  return [];
}

