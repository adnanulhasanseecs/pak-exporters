"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "@/lib/validations/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductImageUpload } from "./ProductImageUpload";
import { ProductSpecifications } from "./ProductSpecifications";
import { ProductTagsInput } from "./ProductTagsInput";
import { AIWriteButton } from "@/components/placeholders/AIWriteButton";
import { Sparkles } from "lucide-react";
import type { Category } from "@/types/category";
import { hasPremiumMembership } from "@/lib/membership";
import { useAuthStore } from "@/store/useAuthStore";

interface ProductFormProps {
  categories: Category[];
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isSubmitting?: boolean;
  mode?: "create" | "edit";
}

export function ProductForm({
  categories,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ProductFormProps) {
  const { user } = useAuthStore();
  const isPremium = hasPremiumMembership(user);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      price: initialData?.price || {
        amount: 0,
        currency: "USD",
      },
      images: initialData?.images || [],
      specifications: initialData?.specifications || {},
      tags: initialData?.tags || [],
      status: initialData?.status || "pending",
    },
  });

  const images = watch("images");
  const specifications = watch("specifications") || {};
  const tags = watch("tags") || [];

  const onFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic details of your product</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Premium Cotton T-Shirts"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">
              Short Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="shortDescription"
              {...register("shortDescription")}
              placeholder="Brief description (max 200 characters)"
              rows={2}
              maxLength={200}
              aria-invalid={!!errors.shortDescription}
              aria-describedby={errors.shortDescription ? "shortDescription-error" : undefined}
            />
            {errors.shortDescription && (
              <p
                id="shortDescription-error"
                className="text-sm text-destructive"
                role="alert"
              >
                {errors.shortDescription.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Full Description <span className="text-destructive">*</span>
              </Label>
              <AIWriteButton />
            </div>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Detailed product description (min 50 characters)"
              rows={6}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Category & Pricing</CardTitle>
          <CardDescription>Select category and set pricing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger
                id="categoryId"
                aria-invalid={!!errors.categoryId}
                aria-describedby={errors.categoryId ? "categoryId-error" : undefined}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p id="categoryId-error" className="text-sm text-destructive" role="alert">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price.amount">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price.amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register("price.amount", { valueAsNumber: true })}
                placeholder="0.00"
                aria-invalid={!!errors.price?.amount}
                aria-describedby={errors.price?.amount ? "price-amount-error" : undefined}
              />
              {errors.price?.amount && (
                <p
                  id="price-amount-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.price.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price.currency">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("price.currency")}
                onValueChange={(value) =>
                  setValue("price.currency", value as "USD" | "PKR" | "EUR" | "GBP")
                }
              >
                <SelectTrigger
                  id="price.currency"
                  aria-invalid={!!errors.price?.currency}
                  aria-describedby={errors.price?.currency ? "price-currency-error" : undefined}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="PKR">PKR</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              {errors.price?.currency && (
                <p
                  id="price-currency-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {errors.price.currency.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price.minOrderQuantity">Minimum Order Quantity (Optional)</Label>
              <Input
                id="price.minOrderQuantity"
                type="number"
                min="1"
                {...register("price.minOrderQuantity", { valueAsNumber: true })}
                placeholder="e.g., 100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Product Images</CardTitle>
          <CardDescription>Upload product images (at least 1 required, max 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImageUpload
            images={images}
            onChange={(newImages) => setValue("images", newImages)}
          />
          {errors.images && (
            <p className="text-sm text-destructive mt-2">{errors.images.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications (Optional)</CardTitle>
          <CardDescription>Add key-value pairs for product specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSpecifications
            specifications={specifications}
            onChange={(newSpecs) => setValue("specifications", newSpecs)}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags (Optional)</CardTitle>
          <CardDescription>Add tags to help buyers find your product (max 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductTagsInput
            tags={tags}
            onChange={(newTags) => setValue("tags", newTags)}
            suggestions={[]} // Could be populated from category
          />
          {errors.tags && (
            <p className="text-sm text-destructive mt-2">{errors.tags.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Status & SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Status & SEO</CardTitle>
          <CardDescription>Set product status and SEO information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Product Status <span className="text-destructive">*</span></Label>
            <RadioGroup
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "active" | "inactive" | "pending")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (Visible to buyers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="cursor-pointer">
                  Inactive (Hidden from buyers)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="cursor-pointer">
                  Pending (Awaiting approval)
                </Label>
              </div>
            </RadioGroup>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <Separator />

          {/* SEO Status Indicator */}
          <div className="space-y-2">
            <Label>SEO Automation</Label>
            {isPremium ? (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SEO will be automatically applied</p>
                  <p className="text-xs text-muted-foreground">
                    As a {user?.membershipTier} member, your product will automatically receive
                    SEO metadata, JSON-LD structured data, and geo-targeting tags.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">SEO automation available for Platinum/Gold members</p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade to Platinum or Gold membership to get automatic SEO optimization for your products.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Product"
            : "Update Product"}
        </Button>
      </div>
    </form>
  );
}

