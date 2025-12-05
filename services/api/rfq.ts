/**
 * RFQ (Request for Quotation) API Service
 * Mock implementation for RFQ management
 */

import type { RFQ, RFQResponse, RFQFormData } from "@/types/rfq";
import { fetchCategory } from "@/services/api/categories";
import rfqsData from "@/services/mocks/rfqs.json";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Load from localStorage if available, otherwise use mock data
function loadRFQsFromStorage(): RFQ[] {
  if (typeof window === "undefined") {
    return rfqsData as unknown as RFQ[];
  }

  const stored = localStorage.getItem("rfqs");
  if (stored) {
    try {
      return JSON.parse(stored) as RFQ[];
    } catch {
      return rfqsData as unknown as RFQ[];
    }
  }
  return rfqsData as unknown as RFQ[];
}

// Save to localStorage
function saveRFQsToStorage(rfqs: RFQ[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("rfqs", JSON.stringify(rfqs));
  }
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
 * Fetch RFQs with optional filters
 */
export async function fetchRFQs(params?: FetchRFQsParams): Promise<FetchRFQsResponse> {
  await delay(300);

  let rfqs = loadRFQsFromStorage();

  // Apply filters
  if (params?.status) {
    rfqs = rfqs.filter((rfq) => rfq.status === params.status);
  }

  if (params?.categoryId) {
    rfqs = rfqs.filter((rfq) => rfq.category.id === params.categoryId);
  }

  if (params?.buyerId) {
    rfqs = rfqs.filter((rfq) => rfq.buyer.id === params.buyerId);
  }

  // For suppliers, show all open RFQs (they can respond)
  // In a real app, you might filter by category match, location, etc.

  return {
    rfqs,
    total: rfqs.length,
  };
}

/**
 * Fetch a single RFQ by ID
 */
export async function fetchRFQ(rfqId: string): Promise<RFQ | null> {
  await delay(200);

  const rfqs = loadRFQsFromStorage();
  const rfq = rfqs.find((r) => r.id === rfqId);

  return rfq || null;
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
  await delay(400);

  const rfqs = loadRFQsFromStorage();

  // Fetch category details
  const category = await fetchCategory(formData.categoryId);
  
  const newRFQ: RFQ = {
    id: `rfq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: formData.title,
    description: formData.description,
    category: {
      id: formData.categoryId,
      name: category?.name || "",
      slug: category?.slug || "",
    },
    buyer: {
      id: buyerId,
      name: buyerName,
      email: buyerEmail,
      company: buyerCompany,
    },
    quantity: formData.quantity,
    budget: formData.budget,
    specifications: formData.specifications,
    attachments: [],
    status: "open",
    deadline: formData.deadline,
    responses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  rfqs.push(newRFQ);
  saveRFQsToStorage(rfqs);

  return newRFQ;
}

/**
 * Submit a response to an RFQ (supplier)
 */
export async function submitRFQResponse(
  rfqId: string,
  supplierId: string,
  supplierName: string,
  supplierCompany: string,
  price: { amount: number; currency: string },
  message?: string
): Promise<RFQResponse> {
  await delay(400);

  const rfqs = loadRFQsFromStorage();
  const rfq = rfqs.find((r) => r.id === rfqId);

  if (!rfq) {
    throw new Error("RFQ not found");
  }

  if (rfq.status !== "open") {
    throw new Error("RFQ is not open for responses");
  }

  const response: RFQResponse = {
    id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    rfqId,
    supplier: {
      id: supplierId,
      name: supplierName,
      company: supplierCompany,
    },
    price,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (!rfq.responses) {
    rfq.responses = [];
  }
  rfq.responses.push(response);
  rfq.updatedAt = new Date().toISOString();

  saveRFQsToStorage(rfqs);

  return response;
}

/**
 * Accept or reject an RFQ response (buyer)
 */
export async function updateRFQResponseStatus(
  rfqId: string,
  responseId: string,
  status: "accepted" | "rejected"
): Promise<RFQResponse> {
  await delay(300);

  const rfqs = loadRFQsFromStorage();
  const rfq = rfqs.find((r) => r.id === rfqId);

  if (!rfq || !rfq.responses) {
    throw new Error("RFQ or response not found");
  }

  const response = rfq.responses.find((r) => r.id === responseId);
  if (!response) {
    throw new Error("Response not found");
  }

  response.status = status;
  rfq.updatedAt = new Date().toISOString();

  // If accepted, close the RFQ
  if (status === "accepted") {
    rfq.status = "awarded";
  }

  saveRFQsToStorage(rfqs);

  return response;
}

/**
 * Update RFQ status (buyer)
 */
export async function updateRFQStatus(
  rfqId: string,
  status: "open" | "closed" | "awarded" | "cancelled"
): Promise<RFQ> {
  await delay(300);

  const rfqs = loadRFQsFromStorage();
  const rfq = rfqs.find((r) => r.id === rfqId);

  if (!rfq) {
    throw new Error("RFQ not found");
  }

  rfq.status = status;
  rfq.updatedAt = new Date().toISOString();

  saveRFQsToStorage(rfqs);

  return rfq;
}

/**
 * Delete an RFQ (buyer only, before responses)
 */
export async function deleteRFQ(rfqId: string): Promise<void> {
  await delay(300);

  const rfqs = loadRFQsFromStorage();
  const filtered = rfqs.filter((r) => r.id !== rfqId);

  if (filtered.length === rfqs.length) {
    throw new Error("RFQ not found");
  }

  saveRFQsToStorage(filtered);
}

/**
 * Load RFQs from localStorage on app init
 */
export function loadRFQsFromStorageOnInit(): void {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("rfqs");
    if (!stored) {
      localStorage.setItem("rfqs", JSON.stringify(rfqsData as unknown as RFQ[]));
    }
  }
}

