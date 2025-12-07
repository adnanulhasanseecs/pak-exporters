/**
 * Single Blog Post API Route
 * GET /api/blog/[slug] - Get a single blog post by slug
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import blogData from "@/services/mocks/blog.json";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try database first
    try {
      const post = await prisma.blogPost.findUnique({
        where: { slug },
      });

      if (post) {
        return NextResponse.json({
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
          tags: [],
          category: undefined,
        });
      }
    } catch (dbError: any) {
      // Database not available, fall back to JSON
      console.warn("Database not available, using JSON fallback:", dbError.message);
    }

    // Fallback to JSON data
    const posts = blogData as any[];
    const post = posts.find((p) => p.slug === slug);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post", message: error.message },
      { status: 500 }
    );
  }
}

