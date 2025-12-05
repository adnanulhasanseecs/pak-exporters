"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { IMAGE_PLACEHOLDER } from "@/lib/constants";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={ROUTES.category(category.slug)}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="h-full"
      >
        <Card className="group hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardContent className="p-0">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            <Image
              src={category.image || IMAGE_PLACEHOLDER.category}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {category.productCount} products
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}

