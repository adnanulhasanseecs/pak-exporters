import { Suspense } from "react";
import { fetchCategories } from "@/services/api/categories";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { ROUTES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { createPageMetadata } from "@/lib/seo";
import { CreateProductFormWrapper } from "./CreateProductFormWrapper";

export const metadata = createPageMetadata({
  title: "Add New Product",
  description: "Add a new product to your listings on Pak-Exporters",
  path: ROUTES.dashboardProductNew,
  keywords: ["add product", "product upload", "supplier"],
});

async function CreateProductContent() {
  const categories = await fetchCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product listing for your catalog
          </p>
        </div>

        <CreateProductFormWrapper categories={categories} />
      </div>
    </div>
  );
}

export default async function CreateProductPage() {
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
        <CreateProductContent />
      </Suspense>
    </MembershipGate>
  );
}

