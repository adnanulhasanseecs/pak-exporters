 "use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import type { CompanyListItem } from "@/types/company";
import { Verified, Award, MapPin } from "lucide-react";

interface CompanyCardProps {
  company: CompanyListItem;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={ROUTES.company(company.id)}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="h-full"
      >
        <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardContent className="p-0">
          <div className="relative h-32 w-full overflow-hidden rounded-t-lg bg-muted">
            {company.coverImage ? (
              <Image
                src={company.coverImage}
                alt={company.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-primary/10" />
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              {company.logo ? (
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-background -mt-6"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center border-2 border-background -mt-6 font-semibold">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {company.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {company.verified && (
                    <Badge variant="outline" className="text-xs">
                      <Verified className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {company.goldSupplier && (
                    <Badge variant="default" className="bg-yellow-500 text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      Gold
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {company.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {company.shortDescription}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {company.location.city}, {company.location.province}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {company.productCount} products
                </span>
                {company.trustScore && (
                  <span className="text-sm font-medium">
                    Trust Score: {company.trustScore}%
                  </span>
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

