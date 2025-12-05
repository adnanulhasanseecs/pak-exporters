/**
 * User and authentication type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: "buyer" | "supplier" | "admin" | "publisher";
  companyId?: string;
  avatar?: string;
  membershipStatus?: "pending" | "approved" | "rejected" | null;
  membershipTier?: "platinum" | "gold" | "silver" | "starter";
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: "buyer" | "supplier";
  companyName?: string;
}

