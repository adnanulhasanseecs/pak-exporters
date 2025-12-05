/**
 * Mock Authentication API Service
 * This service handles authentication-related API calls
 */

import type { User } from "@/types/user";
import { delay } from "./utils";

// Mock users database
const mockUsers: User[] = [
  {
    id: "user-1",
    email: "buyer@example.com",
    name: "John Buyer",
    role: "buyer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    email: "supplier@example.com",
    name: "Jane Supplier",
    role: "supplier",
    membershipStatus: "approved",
    membershipTier: "gold",
    companyId: "company-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "admin-1",
    email: "admin@admin.com",
    name: "Admin",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock tokens storage
const mockTokens = new Map<string, string>();

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role: "buyer" | "supplier";
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(500);

  // Special admin account
  if (credentials.email.toLowerCase() === "admin@admin.com" && credentials.password === "12345678") {
    const adminUser = mockUsers.find((u) => u.role === "admin");
    if (!adminUser) {
      throw new Error("Admin user not found");
    }
    const token = `mock-jwt-token-admin-${Date.now()}`;
    mockTokens.set(adminUser.id, token);
    return { user: adminUser, token };
  }

  // Find user by email
  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // In a real app, verify password hash here
  // For mock, accept any password for existing users
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;
  mockTokens.set(user.id, token);

  return { user, token };
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  await delay(500);

  // Check if user already exists
  const existingUser = mockUsers.find(
    (u) => u.email.toLowerCase() === data.email.toLowerCase()
  );

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: data.email,
    name: data.name,
    role: data.role,
    membershipStatus: data.role === "supplier" ? "pending" : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);

  const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
  mockTokens.set(newUser.id, token);

  // Persist to localStorage
  if (typeof window !== "undefined") {
    const users = JSON.parse(localStorage.getItem("mock-users") || "[]");
    users.push(newUser);
    localStorage.setItem("mock-users", JSON.stringify(users));
  }

  return { user: newUser, token };
}

/**
 * Logout user (invalidate token)
 */
export async function logout(token: string): Promise<void> {
  await delay(200);

  // Find and remove token
  for (const [userId, userToken] of mockTokens.entries()) {
    if (userToken === token) {
      mockTokens.delete(userId);
      break;
    }
  }
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token: string): Promise<User> {
  await delay(200);

  // Find user by token
  for (const [userId, userToken] of mockTokens.entries()) {
    if (userToken === token) {
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        return user;
      }
    }
  }

  throw new Error("Invalid or expired token");
}

/**
 * Refresh user token
 */
export async function refreshToken(token: string): Promise<string> {
  await delay(200);

  const user = await getCurrentUser(token);
  const newToken = `mock-jwt-token-${user.id}-${Date.now()}`;
  mockTokens.set(user.id, newToken);

  return newToken;
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  await delay(500);

  // In a real app, verify the email token
  // For mock, just simulate success
  if (!token || token.length < 10) {
    throw new Error("Invalid verification token");
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await delay(500);

  const user = mockUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    // Don't reveal if user exists (security best practice)
    return;
  }

  // In a real app, send password reset email
  // For mock, just simulate success
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await delay(500);

  if (!token || token.length < 10) {
    throw new Error("Invalid reset token");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // In a real app, update password hash in database
  // For mock, just simulate success
}

