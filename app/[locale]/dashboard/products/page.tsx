import { Suspense } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchUserProducts } from "@/services/api/products";
import { ROUTES } from "@/lib/constants";
import { Package, Plus, Search, Edit, Eye } from "lucide-react";
import Image from "next/image";
import { PAGINATION } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("dashboard");
  return createPageMetadata({
    title: t("products") || "Manage Products",
    description: t("manageProductsDescription") || "Manage your product listings on Pak-Exporters",
    path: ROUTES.dashboardProducts,
    keywords: ["product management", "dashboard", "supplier"],
  });
}

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

async function ProductsListContent({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const page = parseInt(params.page || "1", 10);
  const pageSize = PAGINATION.defaultPageSize;

  // Mock: In real app, get companyId from auth context
  const companyId = "1";

  const filters = {
    search: params.search,
  };

  const { products, total, totalPages } = await fetchUserProducts(companyId, filters, {
    page,
    pageSize,
  });

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("title"), path: ROUTES.dashboard },
    { name: t("products"), path: ROUTES.dashboardProducts },
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <StructuredData data={breadcrumbJsonLd} />
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("products")}</h1>
            <p className="text-muted-foreground">
              {t("manageProductsDescription") || "Manage your product listings and inventory"}
              {total > 0 && (
                <span className="ml-2">({total} {total === 1 ? tCommon("product") || "product" : tCommon("products") || "products"})</span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href={ROUTES.dashboardProductNew}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createProduct") || "Add Product"}
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchProducts") || "Search products..."}
              className="pl-9"
              defaultValue={params.search}
            />
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        product.status === "active"
                          ? "default"
                          : product.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {product.shortDescription || product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold">
                        {product.price.currency} {product.price.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={ROUTES.product(product.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        {tCommon("view")}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={ROUTES.dashboardProductEdit(product.id)}>
                        <Edit className="h-4 w-4 mr-1" />
                        {tCommon("edit")}
                      </Link>
                    </Button>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              {page > 1 ? (
                <Button variant="outline" asChild>
                  <Link href={`${ROUTES.dashboardProducts}?page=${page - 1}`}>Previous</Link>
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
                  <Link href={`${ROUTES.dashboardProducts}?page=${page + 1}`}>Next</Link>
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
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first product to the marketplace
            </p>
            <Button asChild>
              <Link href={ROUTES.dashboardProductNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function ProductsPage(props: ProductsPageProps) {
  // In real app, check auth and membership here
  // For now, we'll use MembershipGate component
  return (
    <MembershipGate redirect={true}>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        }
      >
        <ProductsListContent {...props} />
      </Suspense>
    </MembershipGate>
  );
}

