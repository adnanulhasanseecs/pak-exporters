import posts from "@/services/mocks/blog.json";
import type { BlogPost } from "@/types/blog";

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return posts as BlogPost[];
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = posts as BlogPost[];
  const found = all.find((post) => post.slug === slug);
  return found ?? null;
}


