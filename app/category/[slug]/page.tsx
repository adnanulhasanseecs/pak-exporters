import { notFound } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { fetchCategoryBySlug } from "@/services/api/categories";
import { fetchProducts } from "@/services/api/products";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types/category";
import { ROUTES } from "@/lib/constants";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  try {
    const category = await fetchCategoryBySlug(slug);
    return createPageMetadata({
      title: category.name,
      description: category.description || `Browse ${category.name} products`,
      path: ROUTES.category(category.slug),
      keywords: [category.name, "Pakistan exporters", "Pakistani suppliers"],
    });
  } catch {
    return {
      title: "Category Not Found",
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  let category: Category;
  try {
    category = await fetchCategoryBySlug(slug);
  } catch {
    notFound();
  }

  const { products } = await fetchProducts({ category: slug });

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Categories", path: ROUTES.categories },
    { name: category.name, path: ROUTES.category(category.slug) },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{category.name}</Badge>
          <span className="text-muted-foreground">
            {category.productCount} products
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground text-lg max-w-3xl">
            {category.description}
          </p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}

