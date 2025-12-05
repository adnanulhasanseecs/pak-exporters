/**
 * Product form validation schema using Zod
 */

import * as z from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must not exceed 200 characters"),
  
  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description must not exceed 200 characters"),
  
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must not exceed 5000 characters"),
  
  categoryId: z
    .string()
    .min(1, "Please select a category"),
  
  price: z
    .object({
      amount: z
        .number()
        .positive("Price must be a positive number")
        .min(0.01, "Price must be at least 0.01"),
      currency: z.enum(["USD", "PKR", "EUR", "GBP"], {
        message: "Please select a currency",
      }),
      minOrderQuantity: z
        .number()
        .positive("Minimum order quantity must be positive")
        .int("Minimum order quantity must be a whole number")
        .optional(),
    }),
  
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one product image is required")
    .max(10, "Maximum 10 images allowed"),
  
  specifications: z
    .record(z.string(), z.string().min(1, "Specification value cannot be empty"))
    .optional(),
  
  tags: z
    .array(z.string().min(1, "Tag cannot be empty"))
    .max(10, "Maximum 10 tags allowed"),
  
  status: z.enum(["active", "inactive", "pending"], {
    message: "Please select a status",
  }),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

