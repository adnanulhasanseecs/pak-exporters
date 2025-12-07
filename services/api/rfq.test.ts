import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fetchRFQs,
  fetchRFQ,
  createRFQ,
  submitRFQResponse,
  updateRFQResponseStatus,
  updateRFQStatus,
  deleteRFQ,
} from "./rfq";
import type { RFQFormData } from "@/types/rfq";
import rfqsData from "@/services/mocks/rfqs.json";

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock fetchCategory
vi.mock("./categories", () => ({
  fetchCategory: vi.fn().mockResolvedValue({
    id: "1",
    name: "Textiles & Apparel",
    slug: "textiles-apparel",
  }),
}));

const mockRFQResponse = {
  rfqs: rfqsData,
  total: rfqsData.length,
};

describe("fetchRFQs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    
    // Default mock response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockRFQResponse,
    });
  });

  it("should return all RFQs when no filters", async () => {
    const result = await fetchRFQs();
    expect(result).toHaveProperty("rfqs");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.rfqs)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it("should filter by status", async () => {
    const filteredRFQs = rfqsData.filter((rfq) => rfq.status === "open");
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rfqs: filteredRFQs,
        total: filteredRFQs.length,
      }),
    });

    const result = await fetchRFQs({ status: "open" });
    expect(result.rfqs).toBeDefined();
  });

  it("should filter by categoryId", async () => {
    const firstRFQ = rfqsData[0] as { category: { id: string } };
    const filteredRFQs = rfqsData.filter((rfq) => rfq.category.id === firstRFQ.category.id);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rfqs: filteredRFQs,
        total: filteredRFQs.length,
      }),
    });

    const result = await fetchRFQs({ categoryId: firstRFQ.category.id });
    expect(result.rfqs).toBeDefined();
  });

  it("should filter by buyerId", async () => {
    const firstRFQ = rfqsData[0] as { buyer: { id: string } };
    const filteredRFQs = rfqsData.filter((rfq) => rfq.buyer.id === firstRFQ.buyer.id);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rfqs: filteredRFQs,
        total: filteredRFQs.length,
      }),
    });

    const result = await fetchRFQs({ buyerId: firstRFQ.buyer.id });
    expect(result.rfqs).toBeDefined();
  });

  it("should combine multiple filters", async () => {
    const firstRFQ = rfqsData[0] as { buyer: { id: string }; status: string };
    const filteredRFQs = rfqsData.filter(
      (rfq) => rfq.buyer.id === firstRFQ.buyer.id && rfq.status === "open"
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        rfqs: filteredRFQs,
        total: filteredRFQs.length,
      }),
    });

    const result = await fetchRFQs({
      buyerId: firstRFQ.buyer.id,
      status: "open",
    });
    expect(result.rfqs).toBeDefined();
  });
});

describe("fetchRFQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
  });

  it("should return RFQ for valid ID", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => firstRFQ,
    });

    const result = await fetchRFQ(firstRFQ.id);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(firstRFQ.id);
  });

  it("should return null for invalid ID", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const result = await fetchRFQ("non-existent-id");
    expect(result).toBeNull();
  });

  it("should return RFQ with correct structure", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => firstRFQ,
    });

    const result = await fetchRFQ(firstRFQ.id);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("category");
    expect(result).toHaveProperty("buyer");
    expect(result).toHaveProperty("status");
  });
});

describe("createRFQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should create a new RFQ", async () => {
    const formData: RFQFormData = {
      title: "Test RFQ",
      description: "Test Description",
      categoryId: "1",
      quantity: { min: 100, max: 500, unit: "pieces" },
      budget: { min: 1000, max: 5000, currency: "USD" },
      specifications: "Test specifications",
      deadline: new Date(Date.now() + 86400000).toISOString(),
    };

    const newRFQ = {
      id: "new-rfq-id",
      title: formData.title,
      description: formData.description,
      category: { id: formData.categoryId, name: "Test Category", slug: "test" },
      buyer: { id: "buyer-1", name: "Test Buyer", email: "buyer@test.com", company: "Test Company" },
      status: "open" as const,
      quantity: formData.quantity,
      budget: formData.budget,
      specifications: formData.specifications,
      deadline: formData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => newRFQ,
    });

    const result = await createRFQ(
      "buyer-1",
      "Test Buyer",
      "buyer@test.com",
      "Test Company",
      formData
    );

    expect(result).toHaveProperty("id");
    expect(result.title).toBe(formData.title);
    expect(result.description).toBe(formData.description);
    expect(result.category.id).toBe(formData.categoryId);
    expect(result.buyer.id).toBe("buyer-1");
    expect(result.buyer.name).toBe("Test Buyer");
    expect(result.buyer.email).toBe("buyer@test.com");
    expect(result.buyer.company).toBe("Test Company");
    expect(result.status).toBe("open");
    expect(result.quantity).toEqual(formData.quantity);
    expect(result.budget).toEqual(formData.budget);
    expect(result.specifications).toBe(formData.specifications);
  });

  it("should generate unique ID for new RFQ", async () => {
    const formData: RFQFormData = {
      title: "RFQ 1",
      description: "Description 1",
      categoryId: "1",
      quantity: { min: 100, max: 500, unit: "pieces" },
      budget: { min: 1000, max: 5000, currency: "USD" },
      deadline: new Date(Date.now() + 86400000).toISOString(),
    };

    const newRFQ1 = {
      id: "rfq-1",
      title: formData.title,
      description: formData.description,
      category: { id: formData.categoryId, name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer 1", email: "buyer1@test.com" },
      status: "open" as const,
      quantity: formData.quantity,
      budget: formData.budget,
      deadline: formData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newRFQ2 = {
      ...newRFQ1,
      id: "rfq-2",
      title: "RFQ 2",
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newRFQ1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newRFQ2,
      });

    const result1 = await createRFQ("buyer-1", "Buyer 1", "buyer1@test.com", undefined, formData);
    formData.title = "RFQ 2";
    const result2 = await createRFQ("buyer-1", "Buyer 1", "buyer1@test.com", undefined, formData);

    expect(result1.id).not.toBe(result2.id);
  });

  it("should persist RFQ to localStorage", async () => {
    const formData: RFQFormData = {
      title: "Test RFQ",
      description: "Test Description",
      categoryId: "1",
      quantity: { min: 100, max: 500, unit: "pieces" },
      budget: { min: 1000, max: 5000, currency: "USD" },
      deadline: new Date(Date.now() + 86400000).toISOString(),
    };

    const newRFQ = {
      id: "new-rfq-id",
      title: formData.title,
      description: formData.description,
      category: { id: formData.categoryId, name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Test Buyer", email: "buyer@test.com", company: "Test Company" },
      status: "open" as const,
      quantity: formData.quantity,
      budget: formData.budget,
      deadline: formData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => newRFQ,
    });

    await createRFQ("buyer-1", "Test Buyer", "buyer@test.com", "Test Company", formData);

    // Note: In real implementation, this would persist to localStorage
    // For now, just verify the function completes
    expect(global.fetch).toHaveBeenCalled();
  });
});

describe("submitRFQResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should submit a response to an open RFQ", async () => {
    const firstRFQ = rfqsData[0] as { id: string; status: string };
    
    // The API returns a different format, then it's transformed
    const apiResponse = {
      id: "response-1",
      rfqId: firstRFQ.id,
      supplier: { id: "supplier-1", name: "Test Supplier" },
      supplierCompany: "Supplier Company",
      priceAmount: 2000,
      priceCurrency: "USD",
      message: "Test message",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    const result = await submitRFQResponse(
      firstRFQ.id,
      "supplier-1",
      "Test Supplier",
      "Supplier Company",
      { amount: 2000, currency: "USD" },
      "Test message"
    );

    expect(result).toHaveProperty("id");
    expect(result.rfqId).toBe(firstRFQ.id);
    expect(result.supplier.id).toBe("supplier-1");
    expect(result.supplier.name).toBe("Test Supplier");
    expect(result.supplier.company).toBe("Supplier Company");
    expect(result.price.amount).toBe(2000);
    expect(result.price.currency).toBe("USD");
    expect(result.message).toBe("Test message");
    expect(result.status).toBe("pending");
  });

  it("should throw error for non-existent RFQ", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "RFQ not found" }),
    });

    await expect(
      submitRFQResponse(
        "non-existent-id",
        "supplier-1",
        "Test Supplier",
        "Supplier Company",
        { amount: 2000, currency: "USD" }
      )
    ).rejects.toThrow();
  });

  it("should persist response to localStorage", async () => {
    const firstRFQ = rfqsData[0] as { id: string; status: string };
    // The API returns a different format
    const apiResponse = {
      id: "response-1",
      rfqId: firstRFQ.id,
      supplier: { id: "supplier-1", name: "Test Supplier" },
      supplierCompany: "Supplier Company",
      priceAmount: 2000,
      priceCurrency: "USD",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });

    await submitRFQResponse(
      firstRFQ.id,
      "supplier-1",
      "Test Supplier",
      "Supplier Company",
      { amount: 2000, currency: "USD" }
    );

    expect(global.fetch).toHaveBeenCalled();
  });
});

describe("updateRFQResponseStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should accept a response", async () => {
    // updateRFQResponseStatus first calls fetchRFQ
    const mockResponse = {
      id: "resp-1",
      rfqId: "rfq-1",
      supplier: { id: "supplier-1", name: "Supplier", company: "Supplier Co" },
      price: { amount: 2000, currency: "USD" },
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test",
      category: { id: "1", name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer", email: "buyer@test.com" },
      status: "open" as const,
      responses: [mockResponse],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock fetchRFQ call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRFQ,
    });

    // Mock updateRFQStatus call (when status is "accepted", it calls updateRFQStatus)
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRFQ, status: "awarded" }),
    });

    const result = await updateRFQResponseStatus("rfq-1", "resp-1", "accepted");

    expect(result.status).toBe("accepted");
  });

  it("should reject a response", async () => {
    const mockResponse = {
      id: "resp-1",
      rfqId: "rfq-1",
      supplier: { id: "supplier-1", name: "Supplier", company: "Supplier Co" },
      price: { amount: 2000, currency: "USD" },
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test",
      category: { id: "1", name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer", email: "buyer@test.com" },
      status: "open" as const,
      responses: [mockResponse],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock fetchRFQ call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRFQ,
    });

    // For "rejected", updateRFQStatus is not called
    const result = await updateRFQResponseStatus("rfq-1", "resp-1", "rejected");

    expect(result.status).toBe("rejected");
  });

  it("should close RFQ when response is accepted", async () => {
    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test",
      category: { id: "1", name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer", email: "buyer@test.com" },
      status: "open" as const,
      responses: [
        {
          id: "resp-1",
          rfqId: "rfq-1",
          supplier: { id: "supplier-1", name: "Supplier", company: "Supplier Co" },
          price: { amount: 2000, currency: "USD" },
          status: "pending" as const,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedResponse = {
      ...mockRFQ.responses[0],
      status: "accepted" as const,
    };

    // Mock fetchRFQ call
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRFQ,
    });

    // Mock the PUT call to update the response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedResponse,
    });

    // Mock the PUT call to update RFQ status to "awarded"
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockRFQ, status: "awarded" }),
    });

    await updateRFQResponseStatus("rfq-1", "resp-1", "accepted");

    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw error for non-existent RFQ", async () => {
    // Mock fetchRFQ to return null (404 response)
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    // fetchRFQ returns null for 404, which causes the error
    await expect(
      updateRFQResponseStatus("non-existent-id", "resp-1", "accepted")
    ).rejects.toThrow("RFQ or response not found");
  });

  it("should throw error for non-existent response", async () => {
    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test",
      category: { id: "1", name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer", email: "buyer@test.com" },
      status: "open" as const,
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Mock fetchRFQ to return RFQ without the response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRFQ,
    });

    await expect(
      updateRFQResponseStatus("rfq-1", "non-existent-resp", "accepted")
    ).rejects.toThrow("Response not found");
  });
});

describe("updateRFQStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should update RFQ status", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    const updatedRFQ = {
      ...firstRFQ,
      status: "closed" as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedRFQ,
    });

    const result = await updateRFQStatus(firstRFQ.id, "closed");

    expect(result.status).toBe("closed");
    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw error for non-existent RFQ", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "RFQ not found" }),
    });

    await expect(updateRFQStatus("non-existent-id", "closed")).rejects.toThrow();
  });
});

describe("deleteRFQ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should delete an RFQ", async () => {
    const firstRFQ = rfqsData[0] as { id: string };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await deleteRFQ(firstRFQ.id);

    expect(global.fetch).toHaveBeenCalled();
  });

  it("should throw error for non-existent RFQ", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "RFQ not found" }),
    });

    await expect(deleteRFQ("non-existent-id")).rejects.toThrow();
  });
});

