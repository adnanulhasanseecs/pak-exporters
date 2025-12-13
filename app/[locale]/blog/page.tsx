import { fetchBlogPosts } from "@/services/api/blog";
import { createItemListStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BlogPage() {
  let posts: any[] = [];
  
  try {
    posts = await fetchBlogPosts();
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    // posts remains empty array, page will show "no posts" message
  }

  const itemListJsonLd = createItemListStructuredData(
    posts.map((post) => ({
      name: post.title,
      path: `/blog/${post.slug}`,
    }))
  );

  return (
    <>
      <StructuredData data={itemListJsonLd} />
      <BlogPageClient initialPosts={posts} />
    </>
  );
}
