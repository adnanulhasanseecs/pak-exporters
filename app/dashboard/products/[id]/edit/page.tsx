import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fetchProduct } from "@/services/api/products";
import { fetchCategories } from "@/services/api/categories";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { ROUTES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { EditProductFormWrapper } from "./EditProductFormWrapper";
import type { ProductFormData } from "@/lib/validations/product";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps) {
  const { id } = await params;
  try {
    const product = await fetchProduct(id);
    return createPageMetadata({
      title: `Edit ${product.name}`,
      description: `Edit product listing for ${product.name}`,
      path: ROUTES.dashboardProductEdit(id),
      keywords: ["edit product", "product management"],
    });
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

async function EditProductContent({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    fetchProduct(id).catch(() => null),
    fetchCategories(),
  ]);

  if (!product) {
    notFound();
  }

  // Mock: In real app, verify ownership (user's company)
  // if (product.company.id !== userCompanyId) {
  //   redirect(ROUTES.dashboardProducts);
  // }

  // Convert product to form data
  const initialData: ProductFormData = {
    name: product.name,
    shortDescription: product.shortDescription || "",
    description: product.description,
    categoryId: product.category.id,
    price: {
      amount: product.price.amount,
      currency: product.price.currency as "USD" | "PKR" | "EUR" | "GBP",
      minOrderQuantity: product.price.minOrderQuantity,
    },
    images: product.images,
    specifications: product.specifications || {},
    tags: product.tags || [],
    status: product.status,
  };

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Dashboard", path: ROUTES.dashboard },
    { name: "Manage Products", path: ROUTES.dashboardProducts },
    { name: `Edit ${product.name}`, path: ROUTES.dashboardProductEdit(id) },
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <StructuredData data={breadcrumbJsonLd} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Product</h1>
          <p className="text-muted-foreground">
            Update your product listing information
          </p>
        </div>

        <EditProductFormWrapper
          productId={id}
          categories={categories}
          initialData={initialData}
        />
      </div>
    </div>
  );
}

export default async function EditProductPage(props: EditProductPageProps) {
  return (
    <MembershipGate redirect={true}>
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="max-w-4xl mx-auto space-y-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        }
      >
        <EditProductContent {...props} />
      </Suspense>
    </MembershipGate>
  );
}

