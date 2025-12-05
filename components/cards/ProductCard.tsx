"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import { IMAGE_PLACEHOLDER } from "@/lib/constants";
import type { ProductListItem } from "@/types/product";
import { Verified, Award, TrendingUp, Star, Shield } from "lucide-react";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleCompanyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(ROUTES.company(product.company.id));
  };

  return (
    <Link href={ROUTES.product(product.id)} className="block">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="h-full"
      >
        <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={product.images && product.images.length > 0 && product.images[0] ? product.images[0] : IMAGE_PLACEHOLDER.product}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== IMAGE_PLACEHOLDER.product) {
                  target.src = IMAGE_PLACEHOLDER.product;
                }
              }}
            />
            {product.company.membershipTier && (
              <div className="absolute top-2 right-2">
                {product.company.membershipTier === "platinum" && (
                  <Badge variant="default" className="bg-gray-600">
                    <Star className="h-3 w-3 mr-1" />
                    Platinum
                  </Badge>
                )}
                {product.company.membershipTier === "gold" && (
                  <Badge variant="default" className="bg-yellow-500">
                    <Award className="h-3 w-3 mr-1" />
                    Gold
                  </Badge>
                )}
                {product.company.membershipTier === "silver" && (
                  <Badge variant="default" className="bg-slate-400">
                    <Shield className="h-3 w-3 mr-1" />
                    Silver
                  </Badge>
                )}
              </div>
            )}
            {product.company.goldSupplier && !product.company.membershipTier && (
              <div className="absolute top-2 right-2">
                <Badge variant="default" className="bg-yellow-500">
                  <Award className="h-3 w-3 mr-1" />
                  Gold
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {product.name}
              </h3>
            </div>
            {product.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.shortDescription}
              </p>
            )}
            {product.salesData?.soldLast7Days && product.salesData.soldLast7Days > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-2">
                <TrendingUp className="h-3 w-3" />
                <span className="font-medium">
                  {product.salesData.soldLast7Days.toLocaleString()} sold in last 7 days
                </span>
              </div>
            )}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-lg font-bold text-primary">
                    {product.price.currency} {product.price.amount.toLocaleString()}
                  </span>
                  {product.price.minOrderQuantity && (
                    <p className="text-xs text-muted-foreground">
                      Min. Order: {product.price.minOrderQuantity}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left"
                  onClick={handleCompanyClick}
                  aria-label={`View ${product.company.name} profile`}
                >
                  {product.company.name}
                </button>
                {product.company.verified && (
                  <Verified className="h-3 w-3 text-primary" aria-label="Verified supplier" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}

