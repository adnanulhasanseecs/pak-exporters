"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/cards/ProductCard";
import { CompanyCard } from "@/components/cards/CompanyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles } from "lucide-react";
import { searchProducts } from "@/services/api/products";
import { fetchCompanies } from "@/services/api/companies";
import type { ProductListItem } from "@/types/product";
import type { CompanyListItem } from "@/types/company";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

function SearchContent() {
  const searchParams = useSearchParams();
  const t = useTranslations("pages.search");
  const tCommon = useTranslations("common");
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);
    // Reset state to prevent stale data display
    setProducts([]);
    setCompanies([]);

    try {
      const [productResults, companyResults] = await Promise.all([
        searchProducts(query),
        fetchCompanies({ search: query }),
      ]);

      setProducts(productResults);
      setCompanies(companyResults.companies);
    } catch (err) {
      // Reset state on error to prevent stale data
      setProducts([]);
      setCompanies([]);
      setError(
        err instanceof Error ? err.message : tCommon("error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-4">Search</h1>
        <div className="flex gap-2">
          <div className="relative flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, suppliers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-9 pr-10"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    disabled
                    onClick={() => {
                      // Placeholder - would trigger AI search
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="sr-only">AI Search Assistant</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Search Assistant (Coming Soon)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
            <p className="font-medium">{t("searchError") || "Search Error"}</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {searched && !error && (
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">
              {tCommon("products")} ({products.length})
            </TabsTrigger>
            <TabsTrigger value="companies">
              {tCommon("companies") || "Companies"} ({companies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("noResults")}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            {companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("noResults")}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!searched && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t("enterQuery") || "Enter a search query to find products and suppliers."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const tCommon = useTranslations("common");
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12">{tCommon("loading")}</div>}>
      <SearchContent />
    </Suspense>
  );
}
