"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { Category } from "@/types/category";

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedTier, setSelectedTier] = useState<string | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const category = searchParams.get("category");
    const tier = searchParams.get("membershipTier");
    setSelectedCategory(category || undefined);
    setSelectedTier(tier || undefined);
  }, [searchParams]);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setSelectedCategory(undefined);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("category");
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    } else {
      setSelectedCategory(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set("category", value);
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleTierChange = (value: string) => {
    if (value === "all") {
      setSelectedTier(undefined);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("membershipTier");
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    } else {
      setSelectedTier(value);
      const params = new URLSearchParams(searchParams.toString());
      params.set("membershipTier", value);
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedTier(undefined);
    router.push("/products");
  };

  const hasActiveFilters = selectedCategory || selectedTier;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="category-filter" className="mb-2 block">
            Category
          </Label>
          <Select 
            value={mounted ? (selectedCategory || "all") : "all"} 
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="tier-filter" className="mb-2 block">
            Supplier Tier
          </Label>
          <Select 
            value={mounted ? (selectedTier || "all") : "all"} 
            onValueChange={handleTierChange}
          >
            <SelectTrigger id="tier-filter">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="platinum">Platinum Supplier</SelectItem>
              <SelectItem value="gold">Gold Supplier</SelectItem>
              <SelectItem value="silver">Silver Supplier</SelectItem>
              <SelectItem value="starter">Starter Supplier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

