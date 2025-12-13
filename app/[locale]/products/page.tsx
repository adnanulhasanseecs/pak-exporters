import { Link } from "@/i18n/routing";
import { Suspense } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { getProductsFromDb } from "@/services/db/products";
import { getCategoriesFromDb } from "@/services/db/categories";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("products");
  return createPageMetadata({
    title: t("allProducts"),
    description: t("pageSubtitle"),
    path: ROUTES.products,
    keywords: ["all products", "Pakistan exporters", "Pakistani suppliers"],
  });
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    verifiedOnly?: string;
    goldSupplierOnly?: string;
    membershipTier?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const page = parseInt(params.page || "1", 10);
  const pageSize = PAGINATION.defaultPageSize;

  const filters = {
    category: params.category,
    search: params.search,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    verifiedOnly: params.verifiedOnly === "true",
    goldSupplierOnly: params.goldSupplierOnly === "true",
    membershipTier: params.membershipTier as "platinum" | "gold" | "silver" | "starter" | undefined,
  };

  let productsData: { products: any[]; total: number; totalPages: number };
  let categories: any[] = [];
  
  try {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      getProductsFromDb(filters, { page, pageSize }),
      getCategoriesFromDb(),
    ]);

    if (productsResult.status === "fulfilled") {
      productsData = productsResult.value;
    } else {
      console.error("Failed to fetch products:", productsResult.reason);
      productsData = { products: [], total: 0, totalPages: 0 };
    }

    if (categoriesResult.status === "fulfilled") {
      categories = categoriesResult.value;
    } else {
      console.error("Failed to fetch categories:", categoriesResult.reason);
      categories = [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    productsData = { products: [], total: 0, totalPages: 0 };
    categories = [];
  }

  const { products, total, totalPages } = productsData;

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("allProducts"), path: ROUTES.products },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("allProducts")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("pageSubtitle")}
        </p>
        {total > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {t("showingProducts", { current: products.length, total })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="p-4 border rounded-lg space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  {page > 1 ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/products?page=${page - 1}${params.category ? `&category=${params.category}` : ""}${params.search ? `&search=${params.search}` : ""}${params.membershipTier ? `&membershipTier=${params.membershipTier}` : ""}`}
                      >
                        {t("previous")}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      {t("previous")}
                    </Button>
                  )}
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {t("page")} {page} {t("of")} {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/products?page=${page + 1}${params.category ? `&category=${params.category}` : ""}${params.search ? `&search=${params.search}` : ""}${params.membershipTier ? `&membershipTier=${params.membershipTier}` : ""}`}
                      >
                        {t("next")}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      {t("next")}
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t("noProducts")}</p>
              {params.search && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t("noProductsMessage")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

