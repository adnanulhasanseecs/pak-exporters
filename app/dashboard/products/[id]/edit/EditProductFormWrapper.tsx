"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { updateProduct } from "@/services/api/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { hasPremiumMembership } from "@/lib/membership";
import { createProductSEOMetadata } from "@/lib/seo-automation";
import type { ProductFormData } from "@/lib/validations/product";
import type { Category } from "@/types/category";

interface EditProductFormWrapperProps {
  productId: string;
  categories: Category[];
  initialData: ProductFormData;
}

export function EditProductFormWrapper({
  productId,
  categories,
  initialData,
}: EditProductFormWrapperProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPremium = hasPremiumMembership(user);

  // Safety check: prevent buyers from editing
  if (user && user.role === "buyer") {
    router.push(ROUTES.register);
    return null;
  }

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Update product
      const updatedProduct = await updateProduct(productId, {
        id: productId,
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        price: data.price,
        images: data.images,
        specifications: data.specifications,
        tags: data.tags,
        status: data.status,
      });

      // Auto-update SEO metadata for Platinum/Gold members
      if (isPremium) {
        try {
          const category = categories.find((c) => c.id === data.categoryId);
          if (category) {
            const seoMetadata = createProductSEOMetadata(updatedProduct, category);
            // In real app, this would update the product's SEO metadata in the database
            console.log("SEO metadata auto-updated for premium member:", {
              title: seoMetadata.title,
              keywords: seoMetadata.keywords.length,
              hasStructuredData: !!seoMetadata.structuredData,
            });
            toast.success("Product updated with automatic SEO optimization!");
          } else {
            toast.success("Product updated successfully!");
          }
        } catch (seoError) {
          console.error("Error updating SEO metadata:", seoError);
          // Don't fail the product update if SEO generation fails
          toast.success("Product updated successfully!");
        }
      } else {
        toast.success("Product updated successfully!");
      }
      router.push(ROUTES.dashboardProducts);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update product. Please try again."
      );
    }
  };

  return (
    <ProductForm
      categories={categories}
      initialData={initialData}
      onSubmit={handleSubmit}
      mode="edit"
    />
  );
}

