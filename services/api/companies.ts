/**
 * Companies API Service
 * Real implementation using Next.js API routes
 */

import type {
  Company,
  CompanyListItem,
  CompanyFilters,
  CompanyListResponse,
} from "@/types/company";
import type { PaginationParams } from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildApiUrl } from "@/lib/api-client";

/**
 * Get the API URL - always uses buildApiUrl for absolute URLs
 * Node.js fetch() requires absolute URLs, so we use buildApiUrl which now
 * correctly uses APP_CONFIG.url (includes correct port 3001)
 */
function getApiUrl(endpoint: string): string {
  // Always use buildApiUrl - it now correctly uses APP_CONFIG.url as fallback
  return buildApiUrl(endpoint);
}

/**
 * Helper to build query string from filters and pagination
 */
function buildQueryString(filters?: CompanyFilters, pagination?: PaginationParams): string {
  const params = new URLSearchParams();

  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.location?.city) params.append("city", filters.location.city);
  if (filters?.location?.province) params.append("province", filters.location.province);
  if (filters?.verifiedOnly) params.append("verifiedOnly", "true");
  if (filters?.goldSupplierOnly) params.append("goldSupplierOnly", "true");
  if (filters?.minTrustScore !== undefined) {
    params.append("minTrustScore", filters.minTrustScore.toString());
  }

  if (pagination?.page) params.append("page", pagination.page.toString());
  if (pagination?.pageSize) params.append("pageSize", pagination.pageSize.toString());

  return params.toString();
}

/**
 * Fetch companies with filters and pagination
 */
export async function fetchCompanies(
  filters?: CompanyFilters,
  pagination?: PaginationParams
): Promise<CompanyListResponse> {
  const queryString = buildQueryString(filters, pagination);
  const url = `${API_ENDPOINTS.companies}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(getApiUrl(url), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch companies");
  }

  return response.json();
}

/**
 * Fetch a single company by ID
 */
export async function fetchCompany(id: string): Promise<Company> {
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.companies}/${id}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Company with id ${id} not found`);
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch company");
  }

  return response.json();
}

export interface CreateCompanyInput {
  name: string;
  description: string;
  email: string;
  phone?: string;
  website?: string;
  city: string;
  province: string;
  country: string;
  yearEstablished?: number;
  employeeCount?: string;
  mainProducts?: string[];
  certifications?: string[];
  categoryIds: string[];
  logo?: string;
  coverImage?: string;
}

/**
 * Create a new company
 */
export async function createCompany(data: CreateCompanyInput): Promise<Company> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.companies), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create company");
  }

  return response.json();
}
