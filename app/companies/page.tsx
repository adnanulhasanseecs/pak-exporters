import { CompanyCard } from "@/components/cards/CompanyCard";
import { fetchCompanies } from "@/services/api/companies";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ArrowRight } from "lucide-react";
import { createPageMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export const metadata = createPageMetadata({
  title: "Find Suppliers",
  description: "Browse verified Pakistani exporters and suppliers",
  path: ROUTES.companies,
  keywords: ["suppliers", "Pakistan exporters", "Pakistani manufacturers"],
});

export default async function CompaniesPage() {
  const { companies } = await fetchCompanies();

  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Find Suppliers", path: ROUTES.companies },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={breadcrumbJsonLd} />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Find Suppliers</h1>
          <p className="text-muted-foreground text-lg">
            Connect with verified Pakistani exporters and manufacturers
          </p>
        </div>
        <Button asChild>
          <Link href={ROUTES.membershipApply}>
            Become a Member
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}

