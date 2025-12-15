import type { MetadataRoute } from "next";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
// Use direct DB queries instead of HTTP API calls to avoid auth issues
import { getProductsFromDb } from "@/services/db/products";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (APP_CONFIG.url || "http://localhost:3000").replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    ROUTES.home,
    ROUTES.categories,
    ROUTES.products,
    ROUTES.companies,
    ROUTES.rfq,
    ROUTES.search,
    ROUTES.about,
    ROUTES.contact,
    ROUTES.membership,
    ROUTES.membershipApply,
    ROUTES.login,
    ROUTES.register,
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === ROUTES.home ? 1 : 0.8,
  }));

  // Fetch products and companies with error handling
  // Use direct DB queries instead of HTTP API calls to avoid auth issues
  let productEntries: MetadataRoute.Sitemap = [];
  let companyEntries: MetadataRoute.Sitemap = [];

  try {
    // Use direct DB queries - no HTTP requests, no auth required
    const [{ products }, companies] = await Promise.all([
      getProductsFromDb({}, { page: 1, pageSize: 1000 }).catch(() => ({ products: [] })),
      prisma.company.findMany({ take: 1000 }).catch(() => []),
    ]);

    productEntries = products.map((product) => ({
      url: `${baseUrl}${ROUTES.product(product.id)}`,
      lastModified: new Date(product.updatedAt || product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    companyEntries = companies.map((company) => ({
      url: `${baseUrl}${ROUTES.company(company.id)}`,
      lastModified: new Date(company.updatedAt || company.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    // Log error but don't fail the build
    console.warn("Sitemap generation: Failed to fetch dynamic content, using static routes only", error);
  }

  return [...staticRoutes, ...productEntries, ...companyEntries];
}


