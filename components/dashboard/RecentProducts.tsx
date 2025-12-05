"use client";

import { useEffect, useState } from "react";
import { fetchUserProducts } from "@/services/api/products";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "supplier" && user?.companyId) {
      fetchUserProducts(user.companyId, {}, { page: 1, pageSize: 5 })
        .then((response) => {
          setProducts(response.products);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== "supplier") {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>Your latest product listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>Your latest product listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">No products yet</p>
            <Button asChild size="sm">
              <Link href={ROUTES.dashboardProductNew}>
                Add Your First Product
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Your latest product listings</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.dashboardProducts}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {product.category.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {product.status}
                  </Badge>
                  <span className="text-xs font-medium">
                    {product.price.currency} {product.price.amount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={ROUTES.product(product.id)}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={ROUTES.dashboardProductEdit(product.id)}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

