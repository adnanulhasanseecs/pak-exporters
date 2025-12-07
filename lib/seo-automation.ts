/**
 * SEO Automation for Products
 * Automatically generates enhanced SEO metadata for Platinum/Gold members
 */

import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { createProductMetadata, createProductStructuredData, getGeoMeta } from "./seo";
import type { Metadata } from "next";

export interface ProductSEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: Record<string, unknown>;
  geoMeta: Record<string, string>;
  openGraph: {
    title: string;
    description: string;
    images: string[];
  };
  twitter: {
    title: string;
    description: string;
    images: string[];
  };
}

// Legacy interface for backward compatibility
export interface ProductSEOData {
  metadata: Metadata;
  structuredData: object;
  geoMeta: Record<string, string>;
  keywords: string[];
}

/**
 * Generate keywords based on product name, category, and tags
 * Exported for use in tests and other modules
 */
export function generateProductKeywords(
  productName: string,
  category: Category,
  tags?: string[]
): string[] {
  const categoryName = category.name;
  const keywords: string[] = [];

  // Extract key terms from product name
  const productTerms = productName
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 3);

  // Add product-specific keywords
  keywords.push(...productTerms);

  // Add category
  keywords.push(categoryName.toLowerCase());

  // Add tags
  if (tags && tags.length > 0) {
    keywords.push(...tags.map((tag) => tag.toLowerCase()));
  }

  // Add Pakistan-focused keywords
  keywords.push(
    "pakistan exporter",
    "pakistani supplier",
    "pakistan manufacturer",
    "export from pakistan",
    "pakistan b2b",
    "pakistani products",
    "made in pakistan"
  );

  // Add category-specific Pakistan keywords
  const categoryKeywords = [
    `${categoryName} from pakistan`,
    `pakistan ${categoryName} exporter`,
    `pakistani ${categoryName} supplier`,
  ];
  keywords.push(...categoryKeywords);

  // Add category-specific keywords based on category type
  const categoryLower = categoryName.toLowerCase();
  if (categoryLower.includes("agriculture")) {
    keywords.push("agricultural exports", "farm products", "pakistani agriculture");
  } else if (categoryLower.includes("textile")) {
    keywords.push("textile exports", "garment manufacturing", "pakistani textiles");
  } else if (categoryLower.includes("surgical")) {
    keywords.push("medical instruments", "surgical equipment", "healthcare exports");
  }

  // Remove duplicates and return
  return [...new Set(keywords)];
}


/**
 * Generate enhanced description with geo-targeting
 */
function generateDescription(
  product: Product,
  category: Category
): string {
  const baseDescription = product.shortDescription || product.description;
  
  // Enhance description with location context for Platinum/Gold members
  const locationContext = "from Pakistan";
  const supplierContext = product.company.verified
    ? "verified Pakistani supplier"
    : "Pakistani supplier";

  // If description doesn't already mention Pakistan, add context
  if (!baseDescription.toLowerCase().includes("pakistan")) {
    return `${baseDescription} ${locationContext} by ${supplierContext}. ${category.name} available for export.`;
  }

  return baseDescription;
}

/**
 * Generate enhanced title with geo-targeting
 */
function generateTitle(product: Product, category: Category): string {
  const baseTitle = product.name;
  
  // For premium members, add location context if not present
  if (!baseTitle.toLowerCase().includes("pakistan")) {
    return `${baseTitle} - ${category.name} from Pakistan | Pak-Exporters`;
  }

  return `${baseTitle} | Pak-Exporters`;
}

/**
 * Create enhanced SEO metadata for Platinum/Gold members
 * 
 * This function automatically generates:
 * - Enhanced title with geo-targeting
 * - Enhanced description with location context
 * - Comprehensive keywords including Pakistan-focused terms
 * - JSON-LD structured data with geo information
 * - Geo-targeting meta tags
 * 
 * @param product - Product data
 * @param category - Category data
 * @returns Enhanced SEO metadata
 */
export function createProductSEOMetadata(
  product: Product,
  category: Category
): ProductSEOMetadata {
  // Generate enhanced content
  const title = generateTitle(product, category);
  const description = generateDescription(product, category);
  const keywords = generateProductKeywords(product.name, category, product.tags);
  
  // Get structured data
  const structuredData = createProductStructuredData(product);
  
  // Enhance structured data with additional geo information
  const enhancedStructuredData = {
    ...structuredData,
    // Add additional geo context
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
      identifier: "PK",
    },
    // Add manufacturing location
    manufacturer: {
      "@type": "Organization",
      name: product.company.name,
      address: {
        "@type": "PostalAddress",
        addressCountry: "PK",
      },
    },
  };

  // Get geo meta tags
  const geoMeta = getGeoMeta();

  // Enhance Open Graph data
  const openGraph = {
    title,
    description,
    images: product.images.length > 0 ? product.images : ["/logos/logo-white-bg.png"],
  };

  // Enhance Twitter Card data
  const twitter = {
    title,
    description,
    images: product.images.length > 0 ? product.images : ["/logos/logo-white-bg.png"],
  };

  return {
    title,
    description,
    keywords,
    structuredData: enhancedStructuredData,
    geoMeta,
    openGraph,
    twitter,
  };
}

/**
 * Check if product should have SEO automation applied
 * Only for Platinum/Gold members
 */
export function shouldApplySEOAutomation(
  membershipTier?: "platinum" | "gold" | "silver" | "starter"
): boolean {
  return membershipTier === "platinum" || membershipTier === "gold";
}

/**
 * Convert ProductSEOMetadata to Next.js Metadata format
 */
export function productSEOMetadataToMetadata(
  seoMetadata: ProductSEOMetadata,
  productPath: string
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const url = `${baseUrl}${productPath}`;

  return {
    title: seoMetadata.title,
    description: seoMetadata.description,
    keywords: seoMetadata.keywords,
    openGraph: {
      title: seoMetadata.openGraph.title,
      description: seoMetadata.openGraph.description,
      url,
      type: "website",
      siteName: "Pak-Exporters",
      images: seoMetadata.openGraph.images.map((image) => ({
        url: image,
        width: 1200,
        height: 630,
        alt: seoMetadata.title,
      })),
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      title: seoMetadata.twitter.title,
      description: seoMetadata.twitter.description,
      images: seoMetadata.twitter.images,
    },
    other: {
      ...seoMetadata.geoMeta,
      "geo.region": "PK-IS",
      "geo.placename": "Pakistan",
    },
  };
}

/**
 * Generate complete SEO data (legacy function for backward compatibility)
 */
export function generateProductSEO(
  product: Product,
  category: Category
): ProductSEOData {
  const keywords = generateProductKeywords(product.name, category, product.tags);
  const metadata = createProductMetadata(product);
  const structuredData = createProductStructuredData(product);
  const geoMeta = getGeoMeta();

  return {
    metadata,
    structuredData,
    geoMeta,
    keywords,
  };
}
