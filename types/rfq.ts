/**
 * RFQ (Request for Quotation) type definitions
 */

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  buyer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  quantity?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  specifications?: Record<string, string>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  status: "open" | "closed" | "awarded" | "cancelled";
  deadline?: string;
  responses?: RFQResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  supplier: {
    id: string;
    name: string;
    company: string;
  };
  price: {
    amount: number;
    currency: string;
  };
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface RFQFormData {
  title: string;
  description: string;
  categoryId: string;
  quantity?: {
    min?: number;
    max?: number;
    unit?: string;
  };
  budget?: {
    min?: number;
    max?: number;
    currency: string;
  };
  specifications?: Record<string, string>;
  deadline?: string;
  attachments?: File[];
}

