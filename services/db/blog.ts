/**
 * Direct Database Queries for Blog Posts
 * For use in Server Components - bypasses HTTP API layer
 */

import { prisma } from "@/lib/prisma";
import type { BlogPost } from "@/types/blog";
import blogData from "@/services/mocks/blog.json";

/**
 * Fetch blog posts directly from database (for Server Components)
 */
export async function getBlogPostsFromDb(published: boolean = true): Promise<BlogPost[]> {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error: any) {
    console.warn("[getBlogPostsFromDb] Database not available, using JSON fallback:", error.message);
    // Fall back to JSON mock data
    return getBlogPostsFromJson(published);
  }

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
    console.error("[getBlogPostsFromDb] Error fetching blog posts:", error);
    // Fall back to JSON mock data
    return getBlogPostsFromJson(published);
  }
}

/**
 * Fallback: Get blog posts from JSON mock data
 */
function getBlogPostsFromJson(published: boolean = true): BlogPost[] {
  let posts = blogData as any[];
  if (published) {
    posts = posts.filter((p) => p.published !== false);
  }
  return posts.map((post: any) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content,
    author: post.author || "",
    publishedAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt || post.createdAt,
    tags: Array.isArray(post.tags) ? post.tags : [],
    category: post.category,
    image: post.image,
  }));
}

