/**
 * Membership utilities and helpers
 */

import type { User } from "@/types/user";

/**
 * Check if user has approved membership
 */
export function hasApprovedMembership(user: User | null): boolean {
  if (!user) return false;
  if (user.role !== "supplier") return true; // Buyers don't need membership
  return user.membershipStatus === "approved";
}

/**
 * Check if user can upload products
 * Only suppliers with approved membership can upload products
 */
export function canUploadProducts(user: User | null): boolean {
  if (!user) return false;
  // Only suppliers can upload products
  if (user.role !== "supplier") return false;
  return hasApprovedMembership(user);
}

/**
 * Check if user has Platinum or Gold membership tier
 */
export function hasPremiumMembership(user: User | null): boolean {
  if (!user) return false;
  return user.membershipTier === "platinum" || user.membershipTier === "gold";
}

/**
 * Get membership status message
 */
export function getMembershipStatusMessage(user: User | null): string {
  if (!user) return "Please log in to continue";
  
  // Buyers cannot upload products - they need to register as a supplier
  if (user.role === "buyer") {
    return "You need a supplier account to upload products. Please register as a supplier.";
  }
  
  if (user.role !== "supplier") return "";
  
  switch (user.membershipStatus) {
    case "pending":
      return "Your membership application is pending approval";
    case "rejected":
      return "Your membership application was rejected. Please contact support.";
    case "approved":
      return "";
    default:
      return "Please complete your membership application to upload products";
  }
}

