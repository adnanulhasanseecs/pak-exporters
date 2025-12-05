"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createProduct } from "@/services/api/products";
import { ProductForm } from "@/components/forms/ProductForm";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { hasPremiumMembership } from "@/lib/membership";
import { createProductSEOMetadata } from "@/lib/seo-automation";
import type { ProductFormData } from "@/lib/validations/product";
import type { Category } from "@/types/category";

interface CreateProductFormWrapperProps {
  categories: Category[];
}

export function CreateProductFormWrapper({ categories }: CreateProductFormWrapperProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPremium = hasPremiumMembership(user);

  // Safety check: prevent buyers from submitting
  if (user && user.role === "buyer") {
    router.push(ROUTES.register);
    return null;
  }

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Mock: In real app, get companyId from auth context
      const companyId = user?.companyId || "1";

      // Find category details
      const category = categories.find((c) => c.id === data.categoryId);
      if (!category) {
        toast.error("Category not found");
        return;
      }

      // Create product
      const product = await createProduct(
        {
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription,
          categoryId: data.categoryId,
          price: data.price,
          images: data.images,
          specifications: data.specifications,
          tags: data.tags,
          status: data.status,
        },
        companyId,
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
        }
      );

      // Auto-generate SEO metadata for Platinum/Gold members
      if (isPremium) {
        try {
          const seoMetadata = createProductSEOMetadata(product, category);
          // In real app, this would be stored with the product in the database
          // For now, we'll log it to show it's being generated
          console.log("SEO metadata auto-generated for premium member:", {
            title: seoMetadata.title,
            keywords: seoMetadata.keywords.length,
            hasStructuredData: !!seoMetadata.structuredData,
          });
          toast.success("Product created with automatic SEO optimization!");
        } catch (seoError) {
          console.error("Error generating SEO metadata:", seoError);
          // Don't fail the product creation if SEO generation fails
          toast.success("Product created successfully!");
        }
      } else {
        toast.success("Product created successfully!");
      }
      router.push(ROUTES.dashboardProducts);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create product. Please try again."
      );
    }
  };

  return <ProductForm categories={categories} onSubmit={handleSubmit} mode="create" />;
}

