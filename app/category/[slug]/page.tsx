import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

// Redirect to locale-aware category page
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/${defaultLocale}/category/${slug}`);
}
