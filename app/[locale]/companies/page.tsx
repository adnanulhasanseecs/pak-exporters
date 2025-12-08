import { CompanyCard } from "@/components/cards/CompanyCard";
import { fetchCompanies } from "@/services/api/companies";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ROUTES } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("companies");
  return createPageMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: ROUTES.companies,
    keywords: ["suppliers", "Pakistan exporters", "Pakistani manufacturers"],
  });
}

export default async function CompaniesPage() {
  const t = await getTranslations("companies");
  const tCommon = await getTranslations("common");
  
  let companies = [];
  try {
    const result = await fetchCompanies();
    companies = result.companies || [];
  } catch (error) {
    console.error("Failed to fetch companies:", error);
  }

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("title"), path: ROUTES.companies },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.membershipApply}>
            {t("becomeMember")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {t("noCompanies") || "No companies available. Please check your database connection."}
          </p>
        </div>
      )}
    </div>
  );
}

