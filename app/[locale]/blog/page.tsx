import { fetchBlogPosts } from "@/services/api/blog";
import { createItemListStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import type { BlogPost } from "@/types/blog";
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
  const posts = await fetchBlogPosts();

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
