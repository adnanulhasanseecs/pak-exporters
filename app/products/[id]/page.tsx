import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProduct } from "@/services/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";
import { Verified, Award, Package, Truck, Shield } from "lucide-react";
import { IMAGE_PLACEHOLDER } from "@/lib/constants";
import { createProductMetadata, createProductStructuredData, createBreadcrumbStructuredData } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";
import { AIWriteButton } from "@/components/placeholders/AIWriteButton";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ImageGallery } from "@/components/ui/image-gallery";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  try {
    const product = await fetchProduct(id);
    return createProductMetadata(product);
  } catch {
    return {
      title: "Product Not Found",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await fetchProduct(id);
  } catch {
    notFound();
  }

  const productJsonLd = createProductStructuredData(product);
  const breadcrumbJsonLd = createBreadcrumbStructuredData([
    { name: "Home", path: ROUTES.home },
    { name: "Products", path: ROUTES.products },
    { name: product.name, path: ROUTES.product(product.id) },
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <StructuredData data={[productJsonLd, breadcrumbJsonLd]} />
      <Breadcrumb
        items={[
          { label: "Products", href: ROUTES.products },
          { label: product.name },
        ]}
        className="mb-6"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <ImageGallery
          images={product.images.length > 0 ? product.images : [IMAGE_PLACEHOLDER.product]}
          alt={product.name}
          showThumbnails={product.images.length > 1}
        />

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category.name}</Badge>
              {product.company.goldSupplier && (
                <Badge variant="default" className="bg-yellow-500">
                  <Award className="h-3 w-3 mr-1" />
                  Gold Supplier
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-primary">
                {product.price.currency} {product.price.amount.toLocaleString()}
              </span>
            </div>
            {product.price.minOrderQuantity && (
              <p className="text-muted-foreground">
                Minimum Order Quantity: {product.price.minOrderQuantity} units
              </p>
            )}
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <AIWriteButton />
            </div>
            <p className="text-muted-foreground whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.specifications && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Supplier Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {product.company.logo ? (
                    <Image
                      src={product.company.logo}
                      alt={product.company.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {product.company.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <Link
                      href={ROUTES.company(product.company.id)}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {product.company.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {product.company.verified && (
                        <Badge variant="outline" className="text-xs">
                          <Verified className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full" asChild>
                <Link href={ROUTES.company(product.company.id)}>
                  View Supplier Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              Contact Supplier
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Request Quote
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Verified Supplier</p>
            </div>
            <div className="text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Quality Assured</p>
            </div>
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Global Shipping</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

