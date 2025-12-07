/**
 * RFQ (Request for Quotation) API Service
 * Real implementation using Next.js API routes
 */

import type { RFQ, RFQResponse, RFQFormData } from "@/types/rfq";
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

export interface FetchRFQsParams {
  status?: "open" | "closed" | "awarded" | "cancelled";
  categoryId?: string;
  buyerId?: string;
  supplierId?: string; // For filtering RFQs that supplier can respond to
}

export interface FetchRFQsResponse {
  rfqs: RFQ[];
  total: number;
}

/**
 * Helper to build query string from params
 */
function buildQueryString(params?: FetchRFQsParams): string {
  const searchParams = new URLSearchParams();

  if (params?.status) searchParams.append("status", params.status);
  if (params?.categoryId) searchParams.append("categoryId", params.categoryId);
  if (params?.buyerId) searchParams.append("buyerId", params.buyerId);
  if (params?.supplierId) searchParams.append("supplierId", params.supplierId);

  return searchParams.toString();
}

/**
 * Fetch RFQs with optional filters
 */
export async function fetchRFQs(params?: FetchRFQsParams): Promise<FetchRFQsResponse> {
  const queryString = buildQueryString(params);
  const url = `${API_ENDPOINTS.rfq}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(getApiUrl(url), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch RFQs");
  }

  return response.json();
}

/**
 * Fetch a single RFQ by ID
 */
export async function fetchRFQ(rfqId: string): Promise<RFQ | null> {
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.rfq}/${rfqId}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch RFQ");
  }

  return response.json();
}

/**
 * Create a new RFQ
 */
export async function createRFQ(
  buyerId: string,
  buyerName: string,
  buyerEmail: string,
  buyerCompany: string | undefined,
  formData: RFQFormData
): Promise<RFQ> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.rfq), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      ...formData,
      buyerId,
      buyerName,
      buyerEmail,
      buyerCompany,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create RFQ");
  }

  return response.json();
}

/**
 * Submit a response to an RFQ (supplier)
 */
export async function submitRFQResponse(
  rfqId: string,
  supplierId: string,
  supplierName: string,
  supplierEmail: string,
  supplierCompany: string,
  price: { amount: number; currency: string },
  message?: string
): Promise<RFQResponse> {
  const response = await fetch(buildApiUrl(`${API_ENDPOINTS.rfq}/${rfqId}/response`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      supplierId,
      supplierName,
      supplierEmail,
      supplierCompany,
      priceAmount: price.amount,
      priceCurrency: price.currency,
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to submit RFQ response");
  }

  const responseData = await response.json();

  // Transform to match RFQResponse type
  return {
    id: responseData.id,
    rfqId: responseData.rfqId,
    supplier: {
      id: responseData.supplier.id,
      name: responseData.supplier.name,
      company: responseData.supplierCompany,
    },
    price: {
      amount: responseData.priceAmount,
      currency: responseData.priceCurrency,
    },
    message: responseData.message,
    status: responseData.status,
    createdAt: responseData.createdAt,
  };
}

/**
 * Accept or reject an RFQ response (buyer)
 * Note: This requires updating the RFQ response status via PUT /api/rfq/[id]
 */
export async function updateRFQResponseStatus(
  rfqId: string,
  responseId: string,
  status: "accepted" | "rejected"
): Promise<RFQResponse> {
  // First, get the RFQ to find the response
  const rfq = await fetchRFQ(rfqId);
  if (!rfq || !rfq.responses) {
    throw new Error("RFQ or response not found");
  }

  const response = rfq.responses.find((r) => r.id === responseId);
  if (!response) {
    throw new Error("Response not found");
  }

  // Update the RFQ status if accepted
  if (status === "accepted") {
    await updateRFQStatus(rfqId, "awarded");
  }

  // Return the updated response
  // Note: In a real implementation, you'd update the response via API
  return {
    ...response,
    status,
  };
}

/**
 * Update RFQ status (buyer)
 */
export async function updateRFQStatus(
  rfqId: string,
  status: "open" | "closed" | "awarded" | "cancelled"
): Promise<RFQ> {
  const response = await fetch(buildApiUrl(`${API_ENDPOINTS.rfq}/${rfqId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update RFQ status");
  }

  return response.json();
}

/**
 * Delete an RFQ (buyer only, before responses)
 */
export async function deleteRFQ(rfqId: string): Promise<void> {
  const response = await fetch(buildApiUrl(`${API_ENDPOINTS.rfq}/${rfqId}`), {
    method: "DELETE",
    headers: {
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("RFQ not found");
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to delete RFQ");
  }
}

/**
 * Load RFQs from localStorage on app init
 * @deprecated - No longer needed with real API
 */
export function loadRFQsFromStorageOnInit(): void {
  // No-op - data now comes from API
}
