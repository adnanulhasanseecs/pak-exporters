import { CategoryCard } from "@/components/cards/CategoryCard";
import { fetchCategories } from "@/services/api/categories";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata = createPageMetadata({
  title: "Browse Categories",
  description: "Explore all product categories on Pak-Exporters",
  path: ROUTES.categories,
  keywords: ["product categories", "Pakistan exporters", "Pakistani suppliers"],
});

export default async function CategoriesPage() {
  const categories = await fetchCategories();
  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Categories", path: ROUTES.categories },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Categories</h1>
        <p className="text-muted-foreground text-lg">
          Explore our wide range of product categories from Pakistani exporters
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

