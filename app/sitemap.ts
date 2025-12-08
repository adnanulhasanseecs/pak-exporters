import type { MetadataRoute } from "next";
import { APP_CONFIG, ROUTES } from "@/lib/constants";
import { fetchProducts } from "@/services/api/products";
import { fetchCompanies } from "@/services/api/companies";

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
  // If API calls fail, return only static routes to prevent build errors
  let productEntries: MetadataRoute.Sitemap = [];
  let companyEntries: MetadataRoute.Sitemap = [];

  try {
    const [{ products }, { companies }] = await Promise.all([
      fetchProducts({}, { page: 1, pageSize: 1000 }).catch(() => ({ products: [] })),
      fetchCompanies(undefined, { page: 1, pageSize: 1000 }).catch(() => ({ companies: [] })),
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


