/**
 * Company/Exporter type definitions
 */

export type MembershipTier = "platinum" | "gold" | "silver" | "starter";

export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  verified: boolean;
  goldSupplier: boolean;
  membershipTier?: MembershipTier;
  trustScore?: number;
  location: {
    city: string;
    province: string;
    country: string;
  };
  contact: {
    email: string;
    phone?: string;
    website?: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  productCount: number;
  yearEstablished?: number;
  employeeCount?: string;
  certifications?: string[];
  mainProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListItem extends Omit<Company, "description" | "contact"> {
  shortDescription?: string;
}

export interface CompanyFilters {
  category?: string;
  location?: {
    city?: string;
    province?: string;
    country?: string;
  };
  verifiedOnly?: boolean;
  goldSupplierOnly?: boolean;
  minTrustScore?: number;
  search?: string;
}

export interface CompanyListResponse {
  companies: CompanyListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

