import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { ProductFilters } from "@/components/filters/ProductFilters";
import { fetchProducts } from "@/services/api/products";
import { fetchCategories } from "@/services/api/categories";
import { PAGINATION, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = createPageMetadata({
  title: "All Products",
  description: "Browse all products from Pakistani exporters on Pak-Exporters marketplace",
  path: ROUTES.products,
  keywords: ["all products", "Pakistan exporters", "Pakistani suppliers"],
});

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

  const [productsData, categories] = await Promise.all([
    fetchProducts(filters, { page, pageSize }),
    fetchCategories(),
  ]);

  const { products, total, totalPages } = productsData;

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "All Products", path: ROUTES.products },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">All Products</h1>
        <p className="text-muted-foreground text-lg">
          Browse our complete catalog of products from verified Pakistani exporters
        </p>
        {total > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing {products.length} of {total} products
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Previous
                    </Button>
                  )}
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={`/products?page=${page + 1}${params.category ? `&category=${params.category}` : ""}${params.search ? `&search=${params.search}` : ""}${params.membershipTier ? `&membershipTier=${params.membershipTier}` : ""}`}
                      >
                        Next
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      Next
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No products found.</p>
              {params.search && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria or browse all categories.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

