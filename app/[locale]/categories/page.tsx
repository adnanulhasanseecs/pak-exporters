import { CategoryCard } from "@/components/cards/CategoryCard";
import { fetchCategories } from "@/services/api/categories";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("categories");
  return createPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: ROUTES.categories,
    keywords: ["product categories", "Pakistan exporters", "Pakistani suppliers"],
  });
}

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const tCommon = await getTranslations("common");
  const categories = await fetchCategories();
  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("title"), path: ROUTES.categories },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("pageSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}

