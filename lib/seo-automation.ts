/**
 * SEO Automation utilities for Platinum/Gold members
 * Auto-generates SEO metadata, JSON-LD, and geo-targeting tags for products
 */

import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import {
  createProductMetadata,
  createProductStructuredData,
  getGeoMeta,
} from "./seo";
import type { Metadata } from "next";

export interface ProductSEOData {
  metadata: Metadata;
  structuredData: object;
  geoMeta: Record<string, string>;
  keywords: string[];
}

/**
 * Generate SEO keywords from product and category
 */
export function generateProductKeywords(
  productName: string,
  category: Category,
  tags?: string[]
): string[] {
  const keywords: string[] = [];

  // Add category name
  keywords.push(category.name);

  // Add product name words (split and filter common words)
  const productWords = productName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !["the", "and", "for", "with"].includes(word));
  keywords.push(...productWords);

  // Add tags
  if (tags && tags.length > 0) {
    keywords.push(...tags);
  }

  // Add location-based keywords
  keywords.push("Pakistan exporter", "Pakistani supplier", "export from Pakistan");

  // Add category-specific keywords
  if (category.name.toLowerCase().includes("agriculture")) {
    keywords.push("agricultural exports", "farm products", "Pakistani agriculture");
  } else if (category.name.toLowerCase().includes("textile")) {
    keywords.push("textile exports", "garment manufacturing", "Pakistani textiles");
  } else if (category.name.toLowerCase().includes("surgical")) {
    keywords.push("medical instruments", "surgical equipment", "healthcare exports");
  }

  // Remove duplicates and return
  return [...new Set(keywords)];
}

/**
 * Auto-generate complete SEO data for a product (Platinum/Gold only)
 */
export function generateProductSEO(
  product: Product,
  category: Category
): ProductSEOData {
  // Generate keywords
  const keywords = generateProductKeywords(product.name, category, product.tags);

  // Generate metadata
  const metadata = createProductMetadata(product);

  // Generate structured data (JSON-LD)
  const structuredData = createProductStructuredData(product);

  // Generate geo-targeting meta tags
  const geoMeta = getGeoMeta();

  return {
    metadata,
    structuredData,
    geoMeta,
    keywords,
  };
}

/**
 * Generate SEO metadata for product creation/update
 * This would be stored with the product in the database
 */
export interface ProductSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  geoCountry?: string;
  geoRegion?: string;
  structuredData?: object;
}

export function createProductSEOMetadata(
  product: Product,
  category: Category
): ProductSEOMetadata {
  const keywords = generateProductKeywords(product.name, category, product.tags);

  return {
    title: `${product.name} - ${category.name} | Pak-Exporters`,
    description: product.shortDescription || product.description.substring(0, 160),
    keywords,
    ogTitle: product.name,
    ogDescription: product.shortDescription || product.description.substring(0, 200),
    ogImage: product.images[0],
    twitterTitle: product.name,
    twitterDescription: product.shortDescription || product.description.substring(0, 200),
    twitterImage: product.images[0],
    geoCountry: "PK",
    geoRegion: "Pakistan",
    structuredData: createProductStructuredData(product),
  };
}

