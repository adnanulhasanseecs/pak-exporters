import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchCompany } from "@/services/api/companies";
import { fetchProducts } from "@/services/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/cards/ProductCard";
import { Verified, Award, MapPin, Mail, Globe, Building, Users } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { createCompanyMetadata, createCompanyStructuredData, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { AITrustScore } from "@/components/placeholders/AITrustScore";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getTranslations } from "next-intl/server";

interface CompanyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { id } = await params;
  try {
    const company = await fetchCompany(id);
    return createCompanyMetadata(company);
  } catch {
    return {
      title: "Company Not Found",
    };
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const t = await getTranslations("companies");
  const tCommon = await getTranslations("common");

  let company;
  try {
    company = await fetchCompany(id);
  } catch {
    notFound();
  }

  const { products } = await fetchProducts({ companyId: id });

  const companyJsonLd = createCompanyStructuredData(company);
  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: tCommon("home"), path: ROUTES.home },
    { name: t("title"), path: ROUTES.companies },
    { name: company.name, path: ROUTES.company(company.id) },
  ]);

  return (
    <div className="flex flex-col">
      <StructuredData data={[companyJsonLd, breadcrumbJsonLd]} />
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumb
          items={[
            { label: t("title"), href: ROUTES.companies },
            { label: company.name },
          ]}
        />
      </div>
      {/* Hero Section with Pak-Exporters Logo */}
      <section className="relative h-64 w-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-primary/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        
        {/* Logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Image
            src="/logos/logo-white-bg.png"
            alt="Pak-Exporters"
            width={400}
            height={200}
            className="object-contain"
            priority
            aria-hidden="true"
          />
        </div>
        
        {/* Company name overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {company.name}
            </h1>
            {company.verified && (
              <Badge variant="outline" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                <Verified className="h-4 w-4 mr-1" />
                Verified Supplier
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {company.logo ? (
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={120}
                    height={120}
                    className="rounded-lg border-4 border-background"
                  />
                ) : (
                  <div className="h-30 w-30 rounded-lg bg-muted flex items-center justify-center border-4 border-background font-bold text-2xl">
                    {company.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {company.goldSupplier && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Award className="h-4 w-4 mr-1" />
                          Gold Supplier
                        </Badge>
                      )}
                      {company.trustScore && (
                        <Badge variant="secondary">
                          Trust Score: {company.trustScore}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {company.location.city}, {company.location.province}, {company.location.country}
                    </span>
                  </div>
                  {company.yearEstablished && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>Est. {company.yearEstablished}</span>
                    </div>
                  )}
                  {company.employeeCount && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{company.employeeCount} employees</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{company.productCount} products</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <a href={`mailto:${company.contact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </a>
                  </Button>
                  {company.contact.website && (
                    <Button variant="outline" asChild>
                      <a href={company.contact.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <p className="text-muted-foreground whitespace-pre-line">{company.description}</p>
        </div>

        {/* Categories */}
        {company.categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {company.categories.map((category) => (
                <Badge key={category.id} variant="secondary">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {company.certifications && company.certifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Certifications</h2>
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((cert) => (
                <Badge key={cert} variant="outline">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* AI Trust Score */}
        <div className="mb-8">
          <AITrustScore score={company.trustScore} />
        </div>

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Products ({products.length})</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products listed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
