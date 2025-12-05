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

  let company;
  try {
    company = await fetchCompany(id);
  } catch {
    notFound();
  }

  const { products } = await fetchProducts({ companyId: id });

  const companyJsonLd = createCompanyStructuredData(company);
  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Find Suppliers", path: ROUTES.companies },
    { name: company.name, path: ROUTES.company(company.id) },
  ]);

  return (
    <div className="flex flex-col">
      <StructuredData data={[companyJsonLd, breadcrumbJsonLd]} />
      <div className="container mx-auto px-4 pt-6">
        <Breadcrumb
          items={[
            { label: "Find Suppliers", href: ROUTES.companies },
            { label: company.name },
          ]}
        />
      </div>
      {/* Cover Image */}
      <div className="relative h-64 w-full overflow-hidden bg-muted">
        {company.coverImage ? (
          <Image
            src={company.coverImage}
            alt={company.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

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
                    <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      {company.verified && (
                        <Badge variant="outline">
                          <Verified className="h-4 w-4 mr-1" />
                          Verified
                        </Badge>
                      )}
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

