import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchCompanies, fetchCompany, createCompany } from "./companies";
import type { CompanyFilters } from "@/types/company";
import companiesMockData from "@/services/mocks/companies.json";
import { fetchCategories } from "./categories";

// Mock fetchCategories
vi.mock("./categories", () => ({
  fetchCategories: vi.fn().mockResolvedValue([
    { id: "1", name: "Textiles & Apparel", slug: "textiles-apparel" },
  ]),
}));

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

describe("fetchCompanies", () => {
  it("should return companies list with pagination", async () => {
    const result = await fetchCompanies();
    expect(result).toHaveProperty("companies");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("page");
    expect(result).toHaveProperty("pageSize");
    expect(result).toHaveProperty("totalPages");
    expect(Array.isArray(result.companies)).toBe(true);
  });

  it("should filter by category", async () => {
    const filters: CompanyFilters = { category: "textiles-apparel" };
    const result = await fetchCompanies(filters);
    expect(result.companies.length).toBeGreaterThan(0);
    result.companies.forEach((company) => {
      expect(
        company.categories.some(
          (cat) => cat.slug === "textiles-apparel" || cat.id === "textiles-apparel"
        )
      ).toBe(true);
    });
  });

  it("should filter by search query", async () => {
    const filters: CompanyFilters = { search: "textile" };
    const result = await fetchCompanies(filters);
    expect(result.companies.length).toBeGreaterThan(0);
    result.companies.forEach((company) => {
      const searchLower = "textile".toLowerCase();
      expect(
        company.name.toLowerCase().includes(searchLower) ||
          company.shortDescription?.toLowerCase().includes(searchLower) ||
          company.location.city.toLowerCase().includes(searchLower)
      ).toBe(true);
    });
  });

  it("should filter by location city", async () => {
    const firstCompany = companiesMockData[0] as { location: { city: string } };
    const filters: CompanyFilters = { location: { city: firstCompany.location.city } };
    const result = await fetchCompanies(filters);
    result.companies.forEach((company) => {
      expect(company.location.city.toLowerCase()).toBe(
        firstCompany.location.city.toLowerCase()
      );
    });
  });

  it("should filter by verified only", async () => {
    const filters: CompanyFilters = { verifiedOnly: true };
    const result = await fetchCompanies(filters);
    result.companies.forEach((company) => {
      expect(company.verified).toBe(true);
    });
  });

  it("should filter by gold supplier only", async () => {
    const filters: CompanyFilters = { goldSupplierOnly: true };
    const result = await fetchCompanies(filters);
    result.companies.forEach((company) => {
      expect(company.goldSupplier).toBe(true);
    });
  });

  it("should filter by minimum trust score", async () => {
    const filters: CompanyFilters = { minTrustScore: 80 };
    const result = await fetchCompanies(filters);
    result.companies.forEach((company) => {
      expect((company.trustScore || 0) >= 80).toBe(true);
    });
  });

  it("should paginate results", async () => {
    const result1 = await fetchCompanies(undefined, { page: 1, pageSize: 2 });
    const result2 = await fetchCompanies(undefined, { page: 2, pageSize: 2 });
    expect(result1.companies.length).toBeLessThanOrEqual(2);
    expect(result2.companies.length).toBeLessThanOrEqual(2);
    expect(result1.page).toBe(1);
    expect(result2.page).toBe(2);
  });

  it("should combine multiple filters", async () => {
    const filters: CompanyFilters = {
      search: "textile",
      verifiedOnly: true,
    };
    const result = await fetchCompanies(filters);
    result.companies.forEach((company) => {
      expect(company.verified).toBe(true);
      const searchLower = "textile".toLowerCase();
      expect(
        company.name.toLowerCase().includes(searchLower) ||
          company.shortDescription?.toLowerCase().includes(searchLower) ||
          company.location.city.toLowerCase().includes(searchLower)
      ).toBe(true);
    });
  });
});

describe("fetchCompany", () => {
  it("should return company for valid ID", async () => {
    const firstCompany = companiesMockData[0] as { id: string };
    const result = await fetchCompany(firstCompany.id);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("contact");
    expect(result.id).toBe(firstCompany.id);
  });

  it("should throw error for invalid ID", async () => {
    await expect(fetchCompany("non-existent-id")).rejects.toThrow(
      "Company with id non-existent-id not found"
    );
  });

  it("should return company with correct structure", async () => {
    const firstCompany = companiesMockData[0] as { id: string };
    const result = await fetchCompany(firstCompany.id);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("contact");
    expect(result).toHaveProperty("categories");
    expect(Array.isArray(result.categories)).toBe(true);
  });
});

describe("createCompany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new company", async () => {
    const newCompanyData = {
      name: "Test Company",
      description: "Test Description",
      email: "test@example.com",
      phone: "+1234567890",
      website: "https://test.com",
      city: "Karachi",
      province: "Sindh",
      country: "Pakistan",
      yearEstablished: 2020,
      employeeCount: "50-100",
      mainProducts: ["Product 1", "Product 2"],
      certifications: ["ISO 9001"],
      categoryIds: ["1"],
      logo: "https://example.com/logo.png",
      coverImage: "https://example.com/cover.png",
    };

    const result = await createCompany(newCompanyData);

    expect(result).toHaveProperty("id");
    expect(result.name).toBe(newCompanyData.name);
    expect(result.description).toBe(newCompanyData.description);
    expect(result.contact.email).toBe(newCompanyData.email);
    expect(result.contact.phone).toBe(newCompanyData.phone);
    expect(result.contact.website).toBe(newCompanyData.website);
    expect(result.location.city).toBe(newCompanyData.city);
    expect(result.location.province).toBe(newCompanyData.province);
    expect(result.location.country).toBe(newCompanyData.country);
    expect(result.yearEstablished).toBe(newCompanyData.yearEstablished);
    expect(result.employeeCount).toBe(newCompanyData.employeeCount);
    expect(result.mainProducts).toEqual(newCompanyData.mainProducts);
    expect(result.certifications).toEqual(newCompanyData.certifications);
    expect(result.verified).toBe(false);
    expect(result.goldSupplier).toBe(false);
    expect(result.productCount).toBe(0);
  });

  it("should generate unique ID for new company", async () => {
    const companyData1 = {
      name: "Company 1",
      description: "Description 1",
      email: "company1@example.com",
      city: "Karachi",
      province: "Sindh",
      country: "Pakistan",
      categoryIds: ["1"],
    };

    const companyData2 = {
      name: "Company 2",
      description: "Description 2",
      email: "company2@example.com",
      city: "Lahore",
      province: "Punjab",
      country: "Pakistan",
      categoryIds: ["1"],
    };

    const result1 = await createCompany(companyData1);
    const result2 = await createCompany(companyData2);

    expect(result1.id).not.toBe(result2.id);
  });

  it("should persist company to localStorage", async () => {
    const companyData = {
      name: "Test Company",
      description: "Test Description",
      email: "test@example.com",
      city: "Karachi",
      province: "Sindh",
      country: "Pakistan",
      categoryIds: ["1"],
    };

    await createCompany(companyData);

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const setItemCalls = localStorageMock.setItem.mock.calls;
    expect(setItemCalls.length).toBeGreaterThan(0);
    expect(setItemCalls[setItemCalls.length - 1][0]).toBe("companies");
  });
});

