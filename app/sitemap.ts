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

  const [{ products }, { companies }] = await Promise.all([
    fetchProducts({}),
    fetchCompanies(),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}${ROUTES.product(product.id)}`,
    lastModified: new Date(product.updatedAt || product.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${baseUrl}${ROUTES.company(company.id)}`,
    lastModified: new Date(company.updatedAt || company.createdAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productEntries, ...companyEntries];
}


