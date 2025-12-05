/**
 * Mock User API Service
 * This service handles user profile and settings API calls
 */

import type { User } from "@/types/user";
import { delay } from "./utils";

// Mock users storage (would come from database in real app)
let mockUsers: User[] = [];

// Initialize from localStorage if available
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("mock-users");
  if (stored) {
    try {
      mockUsers = JSON.parse(stored);
    } catch {
      mockUsers = [];
    }
  }
}

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
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User> {
  await delay(300);

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: UpdateUserData
): Promise<User> {
  await delay(400);

  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found`);
  }

  const updatedUser: User = {
    ...mockUsers[userIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockUsers[userIndex] = updatedUser;

  // Persist to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("mock-users", JSON.stringify(mockUsers));
  }

  return updatedUser;
}

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  await delay(200);

  // Load from localStorage
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
  await delay(300);

  const currentSettings = await getUserSettings(userId);
  const updatedSettings = { ...currentSettings, ...settings };

  // Persist to localStorage
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
  await delay(800);

  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5MB limit
    throw new Error("Image size must be less than 5MB");
  }

  // In a real app, upload to cloud storage and return URL
  // For mock, return a placeholder URL
  const mockUrl = `https://api.placeholder.com/200x200?text=${encodeURIComponent(
    userId
  )}`;

  // Update user avatar
  await updateUser(userId, { avatar: mockUrl });

  return mockUrl;
}

/**
 * Delete user account
 */
export async function deleteUser(userId: string): Promise<void> {
  await delay(500);

  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found`);
  }

  mockUsers.splice(userIndex, 1);

  // Remove from localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("mock-users", JSON.stringify(mockUsers));
    localStorage.removeItem(`user-settings-${userId}`);
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await delay(400);

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // In a real app, verify current password hash
  // For mock, just validate new password
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // In a real app, update password hash in database
  // For mock, just simulate success
}

