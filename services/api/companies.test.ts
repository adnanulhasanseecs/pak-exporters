import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchCompanies, fetchCompany, createCompany } from "./companies";
import type { CompanyFilters } from "@/types/company";
import companiesMockData from "@/services/mocks/companies.json";

// Mock fetch globally
global.fetch = vi.fn();

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

const mockCompanyListResponse = {
  companies: companiesMockData,
  total: companiesMockData.length,
  page: 1,
  pageSize: 20,
  totalPages: Math.ceil(companiesMockData.length / 20),
};

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  
  // Default mock response
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    json: async () => mockCompanyListResponse,
  });
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
    const filteredCompanies = companiesMockData.filter((company) =>
      company.categories.some((cat) => cat.slug === "textiles-apparel" || cat.id === "textiles-apparel")
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { category: "textiles-apparel" };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should filter by search query", async () => {
    const filteredCompanies = companiesMockData.filter((company) => {
      const searchLower = "textile".toLowerCase();
      return (
        company.name.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower) ||
        company.location.city.toLowerCase().includes(searchLower)
      );
    });
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { search: "textile" };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should filter by location city", async () => {
    const firstCompany = companiesMockData[0] as { location: { city: string } };
    const filteredCompanies = companiesMockData.filter(
      (company) => company.location.city.toLowerCase() === firstCompany.location.city.toLowerCase()
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { location: { city: firstCompany.location.city } };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should filter by verified only", async () => {
    const filteredCompanies = companiesMockData.filter((company) => company.verified);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { verifiedOnly: true };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should filter by gold supplier only", async () => {
    const filteredCompanies = companiesMockData.filter((company) => company.goldSupplier);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { goldSupplierOnly: true };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should filter by minimum trust score", async () => {
    const filteredCompanies = companiesMockData.filter((company) => (company.trustScore || 0) >= 80);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = { minTrustScore: 80 };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });

  it("should paginate results", async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          companies: companiesMockData.slice(0, 2),
          total: companiesMockData.length,
          page: 1,
          pageSize: 2,
          totalPages: Math.ceil(companiesMockData.length / 2),
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          companies: companiesMockData.slice(2, 4),
          total: companiesMockData.length,
          page: 2,
          pageSize: 2,
          totalPages: Math.ceil(companiesMockData.length / 2),
        }),
      });

    const result1 = await fetchCompanies(undefined, { page: 1, pageSize: 2 });
    const result2 = await fetchCompanies(undefined, { page: 2, pageSize: 2 });
    expect(result1.companies.length).toBeLessThanOrEqual(2);
    expect(result2.companies.length).toBeLessThanOrEqual(2);
    expect(result1.page).toBe(1);
    expect(result2.page).toBe(2);
  });

  it("should combine multiple filters", async () => {
    const filteredCompanies = companiesMockData.filter(
      (company) =>
        company.verified &&
        (company.name.toLowerCase().includes("textile") ||
          company.description?.toLowerCase().includes("textile") ||
          company.location.city.toLowerCase().includes("textile"))
    );
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: filteredCompanies,
        total: filteredCompanies.length,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      }),
    });

    const filters: CompanyFilters = {
      search: "textile",
      verifiedOnly: true,
    };
    const result = await fetchCompanies(filters);
    expect(result.companies).toBeDefined();
  });
});

describe("fetchCompany", () => {
  it("should return company for valid ID", async () => {
    const firstCompany = companiesMockData[0] as { id: string };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => firstCompany,
    });

    const result = await fetchCompany(firstCompany.id);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("location");
    expect(result).toHaveProperty("contact");
    expect(result.id).toBe(firstCompany.id);
  });

  it("should throw error for invalid ID", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Company not found" }),
    });

    await expect(fetchCompany("non-existent-id")).rejects.toThrow();
  });

  it("should return company with correct structure", async () => {
    const firstCompany = companiesMockData[0] as { id: string };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => firstCompany,
    });

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
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
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

    const newCompany = {
      id: "new-company-id",
      name: newCompanyData.name,
      description: newCompanyData.description,
      contact: {
        email: newCompanyData.email,
        phone: newCompanyData.phone,
        website: newCompanyData.website,
      },
      location: {
        city: newCompanyData.city,
        province: newCompanyData.province,
        country: newCompanyData.country,
      },
      yearEstablished: newCompanyData.yearEstablished,
      employeeCount: newCompanyData.employeeCount,
      mainProducts: newCompanyData.mainProducts,
      certifications: newCompanyData.certifications,
      categories: [{ id: "1", name: "Test", slug: "test" }],
      verified: false,
      goldSupplier: false,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => newCompany,
    });

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

    const newCompany1 = {
      id: "company-1",
      ...companyData1,
      contact: { email: companyData1.email },
      location: {
        city: companyData1.city,
        province: companyData1.province,
        country: companyData1.country,
      },
      categories: [{ id: "1", name: "Test", slug: "test" }],
      verified: false,
      goldSupplier: false,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newCompany2 = {
      ...newCompany1,
      id: "company-2",
      ...companyData2,
      contact: { email: companyData2.email },
      location: {
        city: companyData2.city,
        province: companyData2.province,
        country: companyData2.country,
      },
    };

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newCompany1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => newCompany2,
      });

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

    const newCompany = {
      id: "new-company-id",
      ...companyData,
      contact: { email: companyData.email },
      location: {
        city: companyData.city,
        province: companyData.province,
        country: companyData.country,
      },
      categories: [{ id: "1", name: "Test", slug: "test" }],
      verified: false,
      goldSupplier: false,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => newCompany,
    });

    await createCompany(companyData);

    expect(global.fetch).toHaveBeenCalled();
  });
});

