/**
 * User API Service
 * Real implementation using Next.js API routes
 */

import type { User } from "@/types/user";
import { API_ENDPOINTS } from "@/lib/constants";

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  company?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
  rfqAlerts: boolean;
  language: string;
  timezone: string;
}

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Use /api/user/me for current user, or implement /api/user/[id] for other users
  if (userId === "me" || !userId) {
    return getCurrentUser();
  }

  // For now, only support current user
  throw new Error("Getting other users by ID is not yet implemented");
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${API_ENDPOINTS.auth.me || "/api/auth/me"}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch user");
  }

  return response.json();
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // Use /api/user/me for current user
  const endpoint = userId === "me" || !userId 
    ? "/api/user/me" 
    : `/api/user/${userId}`;

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  return response.json();
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  // For now, use localStorage (settings API can be added later)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`user-settings-${userId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Return defaults if parse fails
      }
    }
  }

  // Default settings
  return {
    emailNotifications: true,
    marketingEmails: false,
    productUpdates: true,
    rfqAlerts: true,
    language: "en",
    timezone: "UTC",
  };
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const currentSettings = await getUserSettings(userId);
  const updatedSettings = { ...currentSettings, ...settings };

  // Persist to localStorage (settings API can be added later)
  if (typeof window !== "undefined") {
    localStorage.setItem(
      `user-settings-${userId}`,
      JSON.stringify(updatedSettings)
    );
  }

  return updatedSettings;
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be less than 5MB");
  }

  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.append("file", file);

  // Use upload API endpoint (to be implemented)
  // For now, return a placeholder URL
  const mockUrl = `https://api.placeholder.com/200x200?text=${encodeURIComponent(userId)}`;

  // Update user avatar
  await updateUser(userId, { avatar: mockUrl });

  return mockUrl;
}

/**
 * Delete user account
 */
export async function deleteUser(userId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  // TODO: Implement DELETE /api/user/me endpoint
  throw new Error("Delete user account is not yet implemented");
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // TODO: Implement /api/user/me/password endpoint
  throw new Error("Change password is not yet implemented");
}
