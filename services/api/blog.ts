/**
 * Blog API Service
 * Real implementation using Next.js API routes
 */

import type { BlogPost } from "@/types/blog";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildApiUrl } from "@/lib/api-client";

/**
 * Get the API URL - always uses buildApiUrl for absolute URLs
 * Node.js fetch() requires absolute URLs, so we use buildApiUrl which now
 * correctly uses APP_CONFIG.url (includes correct port 3001)
 */
function getApiUrl(endpoint: string): string {
  // Always use buildApiUrl - it now correctly uses APP_CONFIG.url as fallback
  return buildApiUrl(endpoint);
}

/**
 * Fetch all blog posts
 */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const endpoint = `${API_ENDPOINTS.blog || "/api/blog"}?published=true`;
  const fullUrl = getApiUrl(endpoint);
  
  // Log URL construction in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[fetchBlogPosts] Fetching from: ${fullUrl}`);
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data for blog posts
    });
  } catch (fetchError: any) {
    console.error(`[fetchBlogPosts] Fetch failed for URL: ${fullUrl}`, {
      error: fetchError.message,
      stack: fetchError.stack,
      baseUrl: typeof window === "undefined" 
        ? (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "unknown")
        : window.location.origin,
    });
    throw new Error(
      `Failed to fetch blog posts: ${fetchError.message}. ` +
      `URL: ${fullUrl}. ` +
      `This might be a network issue or the API route might be password-protected on Vercel.`
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch blog posts" }));
    throw new Error(error.error || "Failed to fetch blog posts");
  }

  const posts = await response.json();
  // Map API response to BlogPost type
  return posts.map((post: any) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    author: post.author || "",
    publishedAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt,
    tags: Array.isArray(post.tags) ? post.tags : [],
    category: post.category,
    image: post.image,
  }));
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const endpoint = `${API_ENDPOINTS.blog || "/api/blog"}/${slug}`;
  
  const response = await fetch(getApiUrl(endpoint), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response.json().catch(() => ({ error: "Failed to fetch blog post" }));
    throw new Error(error.error || "Failed to fetch blog post");
  }

  const post = await response.json();
  // Map API response to BlogPost type
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    author: post.author || "",
    publishedAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt,
    tags: Array.isArray(post.tags) ? post.tags : [],
    category: post.category,
    image: post.image,
  };
}
