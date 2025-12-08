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
  let categories = [];
  
  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Return error message to user
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Add New Product</h1>
            <p className="text-muted-foreground">
              Create a new product listing for your catalog
            </p>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2 text-destructive">
              Failed to Load Categories
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Unable to fetch categories. Please check your database connection and try again.
            </p>
            <p className="text-xs text-muted-foreground">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

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

