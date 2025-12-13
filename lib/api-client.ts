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
    // Log available environment variables for debugging (first call only)
    if (!(globalThis as any).__apiBaseUrlLogged) {
      console.log("[getBaseUrl] Environment check:", {
        VERCEL_URL: process.env.VERCEL_URL || "NOT set",
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT set",
        NODE_ENV: process.env.NODE_ENV || "not set",
        APP_CONFIG_url: APP_CONFIG.url,
      });
      (globalThis as any).__apiBaseUrlLogged = true;
    }
    
    // Priority order for server-side on Vercel:
    // 1. VERCEL_URL (most reliable, automatically set by Vercel)
    // 2. NEXT_PUBLIC_APP_URL (user-configured)
    // 3. Fail with clear error (never use localhost in production)
    
    // Check VERCEL_URL first (automatically set by Vercel)
    if (process.env.VERCEL_URL) {
      const vercelUrl = `https://${process.env.VERCEL_URL}`;
      console.log(`[getBaseUrl] ✅ Using VERCEL_URL: ${vercelUrl}`);
      return vercelUrl;
    }
    
    // Check NEXT_PUBLIC_APP_URL (user-configured)
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      // CRITICAL: Never use localhost in production
      if (appUrl.includes('localhost')) {
        console.error("❌ [getBaseUrl] NEXT_PUBLIC_APP_URL points to localhost!");
        console.error(`   Value: ${appUrl}`);
        console.error("   This will cause ECONNREFUSED errors on Vercel.");
        throw new Error("NEXT_PUBLIC_APP_URL cannot point to localhost. Update it in Vercel environment variables to your Vercel deployment URL.");
      }
      console.log(`[getBaseUrl] ✅ Using NEXT_PUBLIC_APP_URL: ${appUrl}`);
      return appUrl;
    }
    
    // If we reach here, neither VERCEL_URL nor NEXT_PUBLIC_APP_URL is set
    // This should never happen on Vercel, so fail with clear error
    console.error("❌ [getBaseUrl] Neither VERCEL_URL nor NEXT_PUBLIC_APP_URL is set!");
    console.error("   This should not happen on Vercel.");
    console.error("   VERCEL_URL should be automatically set by Vercel.");
    console.error("   If missing, set NEXT_PUBLIC_APP_URL in Vercel environment variables.");
    
    // In production, never fall back to localhost
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error(
        "Cannot determine API base URL. " +
        "VERCEL_URL should be automatically set by Vercel. " +
        "If it's missing, set NEXT_PUBLIC_APP_URL in Vercel environment variables to your deployment URL."
      );
    }
    
    // Only allow localhost in development (not on Vercel)
    console.warn(`[getBaseUrl] ⚠️ Falling back to APP_CONFIG.url: ${APP_CONFIG.url}`);
    console.warn("   This should only happen in local development.");
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
