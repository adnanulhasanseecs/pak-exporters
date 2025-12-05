/**
 * Membership application type definitions
 */

export interface MembershipApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  membershipTier: "starter" | "silver" | "gold" | "platinum";
  status: "pending" | "approved" | "rejected";
  
  // Company Information
  companyName: string;
  businessRegistrationNumber: string;
  yearEstablished: string;
  
  // Contact Information
  email: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  province: string;
  country: string;
  
  // Business Details
  mainProducts: string;
  numberOfEmployees: string;
  annualRevenue?: string;
  exportMarkets?: string[];
  certifications?: string[];
  
  // Documents
  businessLicenseDocument?: string; // File name/URL
  certificationDocuments?: string[]; // File names/URLs
  
  // Additional Information
  companyDescription?: string;
  previousExperience?: string;
  
  // Metadata
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // Admin user ID
  rejectionReason?: string;
}

export interface MembershipApplicationListResponse {
  applications: MembershipApplication[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

