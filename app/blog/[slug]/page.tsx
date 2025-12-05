import { notFound } from "next/navigation";
import { fetchBlogPostBySlug } from "@/services/api/blog";
import { createBlogMetadata, createBlogStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return createBlogMetadata(post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = createBlogStructuredData(post);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={jsonLd} />
      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {new Date(post.publishedAt).toLocaleDateString()} · {post.author}
        </p>
        <div className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-line">
          {post.content}
        </div>
      </article>
    </div>
  );
}


