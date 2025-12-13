/**
 * API Client Utility
 * Handles URL construction for API calls in both server and client contexts
 */

import { APP_CONFIG } from "@/lib/constants";

/**
 * Get the base URL for API calls
 * Works in both server and client contexts
 * Always returns an absolute URL (required for Node.js fetch)
 */
function getBaseUrl(): string {
  // In server context, use environment variable or default
  if (typeof window === "undefined") {
    // Server-side on Vercel: Use VERCEL_URL if available (most reliable)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // For production deployments, use NEXT_PUBLIC_APP_URL if set
    if (process.env.NEXT_PUBLIC_APP_URL) {
      // CRITICAL: Never use localhost in production
      if (process.env.NEXT_PUBLIC_APP_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
        console.error("❌ [getBaseUrl] NEXT_PUBLIC_APP_URL points to localhost in production!");
        console.error("   This will cause ECONNREFUSED errors on Vercel.");
        // Try VERCEL_URL as fallback
        if (process.env.VERCEL_URL) {
          return `https://${process.env.VERCEL_URL}`;
        }
        throw new Error("NEXT_PUBLIC_APP_URL cannot point to localhost in production. Set VERCEL_URL or fix NEXT_PUBLIC_APP_URL.");
      }
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    // Last resort: Use APP_CONFIG.url (but warn if it's localhost in production)
    if (APP_CONFIG.url.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.error("❌ [getBaseUrl] APP_CONFIG.url points to localhost in production!");
      console.error("   This will cause ECONNREFUSED errors on Vercel.");
      throw new Error("Cannot use localhost URL in production. Set VERCEL_URL or NEXT_PUBLIC_APP_URL environment variable.");
    }
    
    return APP_CONFIG.url;
  }
  
  // Client-side: use current origin (always correct for the current deployment)
  return window.location.origin;
}

/**
 * Build an absolute API URL from an endpoint path
 * Always returns an absolute URL (required for Node.js fetch in server components)
 */
export function buildApiUrl(endpoint: string): string {
  // If already absolute, return as-is
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const baseUrl = getBaseUrl();
  
  // Validate baseUrl
  if (!baseUrl || (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://"))) {
    // Fallback to APP_CONFIG.url if baseUrl is invalid
    const fallbackUrl = APP_CONFIG.url;
    console.warn(
      `[buildApiUrl] Invalid baseUrl "${baseUrl}", using fallback "${fallbackUrl}"`
    );
    const fullUrl = `${fallbackUrl}${normalizedEndpoint}`;
    // Validate the constructed URL
    try {
      new URL(fullUrl);
      return fullUrl;
    } catch (error) {
      throw new Error(
        `Failed to construct API URL: baseUrl="${baseUrl}", endpoint="${normalizedEndpoint}". ` +
        `Please set NEXT_PUBLIC_APP_URL in your .env file or check APP_CONFIG.url.`
      );
    }
  }
  
  // Build absolute URL
  const fullUrl = `${baseUrl}${normalizedEndpoint}`;
  
  // Validate the final URL
  try {
    new URL(fullUrl);
    return fullUrl;
  } catch (error) {
    throw new Error(
      `Invalid API URL constructed: "${fullUrl}". ` +
      `baseUrl: "${baseUrl}", endpoint: "${normalizedEndpoint}". ` +
      `Please check your NEXT_PUBLIC_APP_URL environment variable.`
    );
  }
}

/**
 * Fetch wrapper that automatically handles URL construction
 */
export async function apiFetch(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const url = buildApiUrl(endpoint);
  return fetch(url, options);
}
