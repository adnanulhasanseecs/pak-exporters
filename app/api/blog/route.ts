/**
 * Blog API Route
 * GET /api/blog - List all blog posts
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import blogData from "@/services/mocks/blog.json";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get("published");

    // Try to fetch from database first
    try {
      const where: any = {};
      if (published === "true") {
        where.published = true;
      }

      const posts = await prisma.blogPost.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      // If database has posts, use them (even if they don't have categories)
      if (posts.length > 0) {
        return NextResponse.json(
          posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || post.content.substring(0, 200) || undefined,
            author: post.author || undefined,
            image: post.image || undefined,
            published: post.published,
            publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            tags: Array.isArray(post.tags) ? post.tags : [],
            category: post.category || undefined,
          }))
        );
      }
      // If database is empty, fall through to JSON fallback
    } catch (dbError: any) {
      // Database not available or error, fall back to JSON
      console.warn("Database not available, using JSON fallback:", dbError.message);
    }

    // Fallback to JSON data
    let posts = blogData as any[];
    
    // Filter by published if requested
    if (published === "true") {
      posts = posts.filter((post) => post.published !== false);
    }

    // Sort by publishedAt descending
    posts.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || post.content?.substring(0, 200) || "",
        author: post.author || "",
        image: post.image || undefined,
        published: post.published !== false,
        publishedAt: post.publishedAt || post.createdAt || new Date().toISOString(),
        createdAt: post.createdAt || post.publishedAt || new Date().toISOString(),
        updatedAt: post.updatedAt || post.publishedAt || new Date().toISOString(),
        tags: Array.isArray(post.tags) ? post.tags : [],
        category: post.category || undefined,
      }))
    );
  } catch (error: any) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts", message: error.message },
      { status: 500 }
    );
  }
}

