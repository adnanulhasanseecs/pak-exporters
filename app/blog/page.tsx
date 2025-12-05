import Link from "next/link";
import { fetchBlogPosts } from "@/services/api/blog";
import { createPageMetadata, createItemListStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata = createPageMetadata({
  title: "Export Insights & Guides",
  description: "Read practical guides and insights about Pakistan exports, suppliers, and global trade.",
  path: "/blog",
  keywords: ["exports blog", "Pakistan exports", "Pak-Exporters blog"],
});

export default async function BlogPage() {
  const posts = await fetchBlogPosts();

  const itemListJsonLd = createItemListStructuredData(
    posts.map((post) => ({
      name: post.title,
      path: `/blog/${post.slug}`,
    })),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={itemListJsonLd} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Export Insights & Guides</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Learn how to work with Pakistani exporters, understand membership tiers, and grow your global trade business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border rounded-lg p-6 bg-background/60 hover:bg-background transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
            <p className="text-muted-foreground mb-4">{post.excerpt}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Read article
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}


