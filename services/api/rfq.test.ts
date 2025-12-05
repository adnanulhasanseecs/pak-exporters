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

describe("fetchRFQs", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
  });

  it("should return all RFQs when no filters", async () => {
    const result = await fetchRFQs();
    expect(result).toHaveProperty("rfqs");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.rfqs)).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it("should filter by status", async () => {
    const result = await fetchRFQs({ status: "open" });
    result.rfqs.forEach((rfq) => {
      expect(rfq.status).toBe("open");
    });
  });

  it("should filter by categoryId", async () => {
    const firstRFQ = rfqsData[0] as { category: { id: string } };
    const result = await fetchRFQs({ categoryId: firstRFQ.category.id });
    result.rfqs.forEach((rfq) => {
      expect(rfq.category.id).toBe(firstRFQ.category.id);
    });
  });

  it("should filter by buyerId", async () => {
    const firstRFQ = rfqsData[0] as { buyer: { id: string } };
    const result = await fetchRFQs({ buyerId: firstRFQ.buyer.id });
    result.rfqs.forEach((rfq) => {
      expect(rfq.buyer.id).toBe(firstRFQ.buyer.id);
    });
  });

  it("should combine multiple filters", async () => {
    const firstRFQ = rfqsData[0] as { buyer: { id: string }; status: string };
    const result = await fetchRFQs({
      buyerId: firstRFQ.buyer.id,
      status: "open",
    });
    result.rfqs.forEach((rfq) => {
      expect(rfq.buyer.id).toBe(firstRFQ.buyer.id);
      expect(rfq.status).toBe("open");
    });
  });
});

describe("fetchRFQ", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
  });

  it("should return RFQ for valid ID", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    const result = await fetchRFQ(firstRFQ.id);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(firstRFQ.id);
  });

  it("should return null for invalid ID", async () => {
    const result = await fetchRFQ("non-existent-id");
    expect(result).toBeNull();
  });

  it("should return RFQ with correct structure", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
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

    await createRFQ("buyer-1", "Test Buyer", "buyer@test.com", "Test Company", formData);

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setItemCalls = localStorageMock.setItem.mock.calls;
    expect(setItemCalls.length).toBeGreaterThan(0);
    expect(setItemCalls[setItemCalls.length - 1][0]).toBe("rfqs");
  });
});

describe("submitRFQResponse", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should submit a response to an open RFQ", async () => {
    const firstRFQ = rfqsData[0] as { id: string; status: string };
    if (firstRFQ.status === "open") {
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
    }
  });

  it("should throw error for non-existent RFQ", async () => {
    await expect(
      submitRFQResponse(
        "non-existent-id",
        "supplier-1",
        "Test Supplier",
        "Supplier Company",
        { amount: 2000, currency: "USD" }
      )
    ).rejects.toThrow("RFQ not found");
  });

  it("should persist response to localStorage", async () => {
    const firstRFQ = rfqsData[0] as { id: string; status: string };
    if (firstRFQ.status === "open") {
      await submitRFQResponse(
        firstRFQ.id,
        "supplier-1",
        "Test Supplier",
        "Supplier Company",
        { amount: 2000, currency: "USD" }
      );

      expect(localStorageMock.setItem).toHaveBeenCalled();
    }
  });
});

describe("updateRFQResponseStatus", () => {
  beforeEach(() => {
    // Create a mock RFQ with a response
    const mockRFQ = {
      id: "rfq-1",
      title: "Test RFQ",
      description: "Test",
      category: { id: "1", name: "Test", slug: "test" },
      buyer: { id: "buyer-1", name: "Buyer", email: "buyer@test.com", company: "Company" },
      quantity: { min: 100, max: 500, unit: "pieces" },
      budget: { min: 1000, max: 5000, currency: "USD" },
      status: "open",
      responses: [
        {
          id: "resp-1",
          rfqId: "rfq-1",
          supplier: { id: "supplier-1", name: "Supplier", company: "Supplier Co" },
          price: { amount: 2000, currency: "USD" },
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockRFQ]));
    localStorageMock.setItem.mockClear();
  });

  it("should accept a response", async () => {
    const result = await updateRFQResponseStatus("rfq-1", "resp-1", "accepted");

    expect(result.status).toBe("accepted");
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should reject a response", async () => {
    const result = await updateRFQResponseStatus("rfq-1", "resp-1", "rejected");

    expect(result.status).toBe("rejected");
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should close RFQ when response is accepted", async () => {
    await updateRFQResponseStatus("rfq-1", "resp-1", "accepted");

    const setItemCalls = localStorageMock.setItem.mock.calls;
    const savedRFQs = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
    const updatedRFQ = savedRFQs.find((r: { id: string }) => r.id === "rfq-1");
    expect(updatedRFQ.status).toBe("awarded");
  });

  it("should throw error for non-existent RFQ", async () => {
    await expect(
      updateRFQResponseStatus("non-existent-id", "resp-1", "accepted")
    ).rejects.toThrow("RFQ or response not found");
  });

  it("should throw error for non-existent response", async () => {
    await expect(
      updateRFQResponseStatus("rfq-1", "non-existent-resp", "accepted")
    ).rejects.toThrow("Response not found");
  });
});

describe("updateRFQStatus", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should update RFQ status", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    const result = await updateRFQStatus(firstRFQ.id, "closed");

    expect(result.status).toBe("closed");
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it("should throw error for non-existent RFQ", async () => {
    await expect(updateRFQStatus("non-existent-id", "closed")).rejects.toThrow(
      "RFQ not found"
    );
  });
});

describe("deleteRFQ", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(rfqsData));
    localStorageMock.setItem.mockClear();
  });

  it("should delete an RFQ", async () => {
    const firstRFQ = rfqsData[0] as { id: string };
    await deleteRFQ(firstRFQ.id);

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setItemCalls = localStorageMock.setItem.mock.calls;
    const savedRFQs = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
    expect(savedRFQs.find((r: { id: string }) => r.id === firstRFQ.id)).toBeUndefined();
  });

  it("should throw error for non-existent RFQ", async () => {
    await expect(deleteRFQ("non-existent-id")).rejects.toThrow("RFQ not found");
  });
});

