/**
 * Authentication API Service
 * Real implementation using Next.js API routes
 */

import type { User, AuthResponse, LoginCredentials, RegisterData } from "@/types/user";
import { API_ENDPOINTS } from "@/lib/constants";

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Invalid email or password");
  }

  const data = await response.json();
  
  // Store token in localStorage
  if (typeof window !== "undefined" && data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return {
    user: data.user,
    token: data.token,
    expiresIn: data.expiresIn,
  };
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(API_ENDPOINTS.auth.register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  const responseData = await response.json();

  // Store token in localStorage
  if (typeof window !== "undefined" && responseData.token) {
    localStorage.setItem("auth_token", responseData.token);
  }

  return {
    user: responseData.user,
    token: responseData.token,
    expiresIn: responseData.expiresIn,
  };
}

/**
 * Logout user (invalidate token)
 */
export async function logout(token: string): Promise<void> {
  // Remove token from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }

  // TODO: Call logout API endpoint if available
  // await fetch(API_ENDPOINTS.auth.logout, {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   },
  // });
}

/**
 * Get current user from token
 */
export async function getCurrentUser(token?: string): Promise<User> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  
  if (!authToken) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(API_ENDPOINTS.auth.me, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get current user");
  }

  const user = await response.json();
  
  // Cache user in localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("current_user", JSON.stringify(user));
  }

  return user;
}

/**
 * Refresh user token
 */
export async function refreshToken(token?: string): Promise<string> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
  
  if (!authToken) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(API_ENDPOINTS.auth.refresh, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to refresh token");
  }

  const data = await response.json();
  
  // Update token in localStorage
  if (typeof window !== "undefined" && data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  return data.token;
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  if (!token || token.length < 10) {
    throw new Error("Invalid verification token");
  }

  const response = await fetch(API_ENDPOINTS.auth.verifyEmail, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to verify email");
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(API_ENDPOINTS.auth.forgotPassword, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to request password reset");
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  if (!token || token.length < 10) {
    throw new Error("Invalid reset token");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reset password");
  }
}
