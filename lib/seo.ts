/**
 * SEO utilities: metadata helpers and structured data (JSON-LD) generators.
 *
 * These helpers are intentionally conservative and based on our current mock types.
 * They can be extended as we add more real backend fields (ratings, reviews, etc.).
 */

import type { Metadata } from "next";
import { APP_CONFIG, ROUTES } from "./constants";
import type { Product } from "@/types/product";
import type { Company } from "@/types/company";
import type { BlogPost } from "@/types/blog";
const DEFAULT_LOCALE = "en_PK";
const DEFAULT_COUNTRY_CODE = "PK";

/**
 * Normalizes the base URL so we never end up with double slashes.
 */
export function getBaseUrl(): string {
  const url = APP_CONFIG.url || "http://localhost:3000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function createPageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  imagePath?: string;
}): Metadata {
  const baseUrl = getBaseUrl();
  const url = options.path ? `${baseUrl}${options.path}` : baseUrl;
  const image = options.imagePath || "/logos/logo-white-bg.png";

  return {
    title: options.title,
    description: options.description,
    keywords: [
      "Pak-Exporters",
      "Pakistan exporters",
      "Pakistan B2B marketplace",
      "Pakistani suppliers",
      "global trade",
      "export from Pakistan",
      ...(options.keywords ?? []),
    ],
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: "website",
      siteName: APP_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
    },
  };
}

export function createProductMetadata(product: Product): Metadata {
  return createPageMetadata({
    title: product.name,
    description: product.shortDescription || product.description,
    path: ROUTES.product(product.id),
    keywords: [
      product.category.name,
      ...(product.tags ?? []),
      product.company.name,
      "Pakistan exporter",
      "Pakistani supplier",
    ],
    imagePath: product.images[0],
  });
}

export function createCompanyMetadata(company: Company): Metadata {
  const locationParts = [
    company.location.city,
    company.location.province,
    company.location.country,
  ].filter(Boolean);

  return createPageMetadata({
    title: company.name,
    description: company.description,
    path: ROUTES.company(company.id),
    keywords: [
      ...(company.mainProducts ?? []),
      ...company.categories.map((c) => c.name),
      ...locationParts,
      "Pakistan exporter",
      "Pakistani supplier",
    ],
    imagePath: company.logo || "/logos/logo-white-bg.png",
  });
}

/**
 * Basic geo meta data that we can surface via the root layout `metadata.other`.
 */
export function getGeoMeta(): Record<string, string> {
  return {
    "geo.region": "PK-IS",
    "geo.placename": "Islamabad, Pakistan",
    "geo.position": "33.6844;73.0479",
    ICBM: "33.6844, 73.0479",
  };
}

// ---------- Structured Data (JSON-LD) ----------

type JsonLd = Record<string, unknown>;

export function createWebsiteStructuredData(): JsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_CONFIG.name,
    url: baseUrl,
    description: APP_CONFIG.description,
    inLanguage: DEFAULT_LOCALE,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}${ROUTES.search}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function createProductStructuredData(product: Product): JsonLd {
  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}${ROUTES.product(product.id)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images.length ? product.images : undefined,
    sku: product.id,
    category: product.category.name,
    brand: {
      "@type": "Brand",
      name: product.company.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price.amount.toFixed(2),
      priceCurrency: product.price.currency,
      url: productUrl,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.company.name,
      },
    },
    url: productUrl,
    productionDate: product.createdAt,
    releaseDate: product.createdAt,
    // Minimal geo context – refined further at company level
    geo: {
      "@type": "GeoShape",
      addressCountry: DEFAULT_COUNTRY_CODE,
    },
  };
}

export function createCompanyStructuredData(company: Company): JsonLd {
  const baseUrl = getBaseUrl();
  const companyUrl = `${baseUrl}${ROUTES.company(company.id)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    url: companyUrl,
    logo: company.logo,
    image: company.coverImage || company.logo,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.location.city,
      addressRegion: company.location.province,
      addressCountry: DEFAULT_COUNTRY_CODE,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "33.6844",
      longitude: "73.0479",
    },
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
    foundingDate: company.yearEstablished?.toString(),
  };
}

export function createBreadcrumbStructuredData(items: {
  name: string;
  path: string;
}[]): JsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function createItemListStructuredData(items: {
  name: string;
  path: string;
}[]): JsonLd {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${baseUrl}${item.path}`,
    })),
  };
}

export function createBlogMetadata(post: BlogPost): Metadata {
  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: [
      ...(post.tags ?? []),
      "Pakistan exports blog",
      "Pak-Exporters insights",
    ],
  });
}

export function createBlogStructuredData(post: BlogPost): JsonLd {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    articleBody: post.content,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: APP_CONFIG.name,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

