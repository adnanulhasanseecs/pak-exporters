/**
 * Direct Database Queries for Blog Posts
 * For use in Server Components - bypasses HTTP API layer
 * 
 * Production: Fail fast on database errors - no JSON fallbacks
 */

import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types/blog";

/**
 * Fetch blog posts directly from database (for Server Components)
 * Blog posts are publicly readable - no authentication required
 */
export async function getBlogPostsFromDb(published: boolean = true): Promise<BlogPost[]> {
  try {
    const where: any = {};
    if (published) {
      where.published = true;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts.map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || post.content.substring(0, 200) || "",
      content: post.content,
      author: post.author || "",
      publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      tags: Array.isArray(post.tags) ? post.tags : [],
      category: post.category || undefined,
      image: post.image || undefined,
    }));
  } catch (error: any) {
    // In production, fail fast - do not mask database errors
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    // In development, still throw but with better error message
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }
}
