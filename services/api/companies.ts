import type {
  Company,
  CompanyListItem,
  CompanyFilters,
  CompanyListResponse,
} from "@/types/company";
import type { PaginationParams } from "@/types/api";
import companiesMockData from "@/services/mocks/companies.json";

/**
 * Mock delay to simulate API call
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch companies with filters and pagination
 */
export async function fetchCompanies(
  filters?: CompanyFilters,
  pagination?: PaginationParams
): Promise<CompanyListResponse> {
  await delay(300);

  let filteredCompanies = [...companiesMockData] as CompanyListItem[];

  // Apply filters
  if (filters?.category) {
    filteredCompanies = filteredCompanies.filter((c) =>
      c.categories.some(
        (cat) => cat.slug === filters.category || cat.id === filters.category
      )
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredCompanies = filteredCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.shortDescription?.toLowerCase().includes(searchLower) ||
        c.location.city.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.location?.city) {
    filteredCompanies = filteredCompanies.filter(
      (c) => c.location.city.toLowerCase() === filters.location!.city!.toLowerCase()
    );
  }

  if (filters?.verifiedOnly) {
    filteredCompanies = filteredCompanies.filter((c) => c.verified);
  }

  if (filters?.goldSupplierOnly) {
    filteredCompanies = filteredCompanies.filter((c) => c.goldSupplier);
  }

  if (filters?.minTrustScore) {
    filteredCompanies = filteredCompanies.filter(
      (c) => (c.trustScore || 0) >= filters.minTrustScore!
    );
  }

  // Pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
  const total = filteredCompanies.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    companies: paginatedCompanies,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single company by ID
 */
export async function fetchCompany(id: string): Promise<Company> {
  await delay(200);

  const company = companiesMockData.find((c) => c.id === id);

  if (!company) {
    throw new Error(`Company with id ${id} not found`);
  }

  return company as Company;
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
  await delay(500);

  // Get categories from category IDs
  const { fetchCategories } = await import("./categories");
  const categories = await fetchCategories();
  const selectedCategories = categories
    .filter((cat) => data.categoryIds.includes(cat.id))
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    }));

  const newCompany: Company = {
    id: `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    description: data.description,
    logo: data.logo,
    coverImage: data.coverImage,
    verified: false,
    goldSupplier: false,
    location: {
      city: data.city,
      province: data.province,
      country: data.country,
    },
    contact: {
      email: data.email,
      phone: data.phone,
      website: data.website,
    },
    categories: selectedCategories,
    productCount: 0,
    yearEstablished: data.yearEstablished,
    employeeCount: data.employeeCount,
    certifications: data.certifications,
    mainProducts: data.mainProducts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  (companiesMockData as Company[]).push(newCompany);

  // Persist to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("companies", JSON.stringify(companiesMockData));
  }

  return newCompany;
}

