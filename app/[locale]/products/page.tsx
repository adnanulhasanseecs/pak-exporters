// Force dynamic rendering on Vercel to ensure Prisma queries run at request-time
// This prevents build-time database queries and ensures fresh data on every request
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    verifiedOnly?: string;
    goldSupplierOnly?: string;
    membershipTier?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // STEP 1 & 4: Diagnostic logging for auth issues
  console.log("[ProductsPage] Page rendering started");
  console.log("[ProductsPage] NODE_ENV:", process.env.NODE_ENV);
  console.log("[ProductsPage] This page uses DIRECT Prisma queries - NO HTTP fetch calls");
  console.log("[ProductsPage] Calling getProductsFromDb directly (not via API route)");
  
  // searchParams is a plain object (not a Promise) in Next.js App Router
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = PAGINATION.defaultPageSize;

  const filters = {
    category: searchParams.category,
    search: searchParams.search,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    verifiedOnly: searchParams.verifiedOnly === "true",
    goldSupplierOnly: searchParams.goldSupplierOnly === "true",
    membershipTier: searchParams.membershipTier as "platinum" | "gold" | "silver" | "starter" | undefined,
  };

  try {
    // Call Prisma queries directly - allow errors to throw instead of silently swallowing
    // This ensures we see database connection issues immediately rather than empty pages
    console.log("[ProductsPage] Calling getProductsFromDb...");
    const productsData = await getProductsFromDb(filters, { page, pageSize });
    console.log("[ProductsPage] getProductsFromDb succeeded:", {
      productsCount: productsData.products.length,
      total: productsData.total,
    });
    
    console.log("[ProductsPage] Calling getCategoriesFromDb...");
    const categories = await getCategoriesFromDb();
    console.log("[ProductsPage] getCategoriesFromDb succeeded:", {
      categoriesCount: categories.length,
    });
  } catch (error: any) {
    console.error("[ProductsPage] ERROR in data fetching:", error.message);
    console.error("[ProductsPage] Error stack:", error.stack);
    // Re-throw to show error page instead of empty data
    throw error;
  }

  const { products, total, totalPages } = productsData;

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
                        href={`/products?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}${searchParams.membershipTier ? `&membershipTier=${searchParams.membershipTier}` : ""}`}
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
                        href={`/products?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ""}${searchParams.search ? `&search=${searchParams.search}` : ""}${searchParams.membershipTier ? `&membershipTier=${searchParams.membershipTier}` : ""}`}
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
              {searchParams.search && (
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

