import { Suspense } from "react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCompanies } from "@/services/api/companies";
import { ROUTES } from "@/lib/constants";
import { Building2, Plus, Search, Edit, Trash2, Eye, CheckCircle2, Star } from "lucide-react";
import Image from "next/image";
import { PAGINATION } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { createBreadcrumbStructuredData } from "@/lib/seo";
import { MembershipGate } from "@/components/membership/MembershipGate";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("dashboard");
  return createPageMetadata({
    title: t("companies"),
    description: t("manageCompaniesDescription"),
    path: ROUTES.dashboard,
    keywords: ["dashboard", "company management", "supplier management"],
  });
}

async function CompaniesList() {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const { companies, total, page, totalPages } = await fetchCompanies(
    undefined,
    { page: 1, pageSize: PAGINATION.defaultPageSize }
  );

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">{t("noCompaniesYet") || "No Companies Yet"}</h3>
        <p className="text-muted-foreground mb-4">
          {t("noCompaniesMessage") || "Start by creating your company profile to showcase your business."}
        </p>
        <Button asChild>
          <Link href={ROUTES.dashboardCompanyNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t("createCompany")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
              {company.coverImage ? (
                <Image
                  src={company.coverImage}
                  alt={company.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                {company.verified && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {company.goldSupplier && (
                  <Badge variant="default" className="bg-yellow-600">
                    <Star className="h-3 w-3 mr-1" />
                    Gold
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">{company.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {company.shortDescription || ""}
              </p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs text-muted-foreground">
                  <p>{company.location.city}, {company.location.province}</p>
                  <p>{company.productCount || 0} Products</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={ROUTES.company(company.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    {tCommon("view")}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={ROUTES.dashboardCompanyEdit(company.id)}>
                    <Edit className="h-4 w-4 mr-1" />
                    {tCommon("edit")}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  {tCommon("delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} total)
          </span>
          <Button variant="outline" disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default async function DashboardCompaniesPage() {
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");
  const breadcrumbs = [
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("title"), path: ROUTES.dashboard },
    { name: t("companies"), path: ROUTES.dashboardCompanies },
  ];

  return (
    <MembershipGate>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <StructuredData data={createBreadcrumbStructuredData(breadcrumbs)} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("companies")}</h1>
              <p className="text-muted-foreground">
                {t("manageCompaniesDescription")}
              </p>
            </div>
            <Button asChild>
              <Link href={ROUTES.dashboardCompanyNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t("createCompany")}
              </Link>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchCompanies")}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <CompaniesList />
        </Suspense>
      </div>
    </MembershipGate>
  );
}

