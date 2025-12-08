"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Users,
  FileText,
  TrendingUp,
  ShoppingCart,
  Search,
  Upload,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { canUploadProducts } from "@/lib/membership";
import { useEffect, useState } from "react";
import { fetchUserProducts } from "@/services/api/products";
import { RecentProducts } from "./RecentProducts";
import { AIInsightsDashboard } from "@/components/placeholders/AIInsightsDashboard";
import { AIChatAssistant } from "@/components/placeholders/AIChatAssistant";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Buyer Dashboard Stats
const buyerStats = [
  {
    title: "Active RFQs",
    value: "12",
    change: "+3",
    icon: FileText,
    description: "Open requests",
  },
  {
    title: "Products Viewed",
    value: "48",
    change: "+12",
    icon: Search,
    description: "This month",
  },
  {
    title: "Suppliers",
    value: "24",
    change: "+5",
    icon: Users,
    description: "Connected",
  },
  {
    title: "Orders",
    value: "8",
    change: "+2",
    icon: ShoppingCart,
    description: "In progress",
  },
];

// Supplier Dashboard Stats
const supplierStats = [
  {
    title: "Total Products",
    value: "24",
    change: "+3",
    icon: Package,
    description: "Products listed",
  },
  {
    title: "Active RFQs",
    value: "18",
    change: "+5",
    icon: FileText,
    description: "Received",
  },
  {
    title: "Views",
    value: "1,250",
    change: "+12%",
    icon: TrendingUp,
    description: "This month",
  },
  {
    title: "Inquiries",
    value: "32",
    change: "+8",
    icon: Users,
    description: "New messages",
  },
];

export function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations("dashboard");
  const [mounted, setMounted] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.role === "supplier" && user?.companyId) {
      fetchUserProducts(user.companyId, {}, { page: 1, pageSize: 1 })
        .then((response) => {
          setProductCount(response.total);
        })
        .catch(() => {
          // Ignore errors for dashboard stats
        });
    }
  }, [mounted, user]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (mounted && user?.role === "admin") {
      router.push(ROUTES.admin);
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  // Don't render for admin users
  if (user?.role === "admin") {
    return null;
  }

  const isSupplier = user?.role === "supplier";
  const isBuyer = user?.role === "buyer";
  const canUpload = canUploadProducts(user);

  // Update supplier stats with real product count if available
  const supplierStatsWithCount = isSupplier && productCount !== null
    ? supplierStats.map((stat) =>
        stat.title === "Total Products"
          ? { ...stat, value: productCount.toString() }
          : stat
      )
    : supplierStats;

  const stats = isSupplier ? supplierStatsWithCount : buyerStats;
  const dashboardTitle = isSupplier ? t("supplierDashboard") : isBuyer ? t("buyerDashboard") : t("title");
  const dashboardDescription = isSupplier
    ? t("supplierDescription")
    : isBuyer
    ? t("buyerDescription")
    : t("welcomeBack");

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{dashboardTitle}</h1>
        <p className="text-muted-foreground">{dashboardDescription}</p>
      </div>

      {/* Upload Product CTA for Suppliers */}
      {isSupplier && canUpload && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">{t("addFirstProduct") || "Add Your First Product"}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("addFirstProductDescription") || "Start selling by adding products to your catalog"}
                </p>
              </div>
              <Button asChild>
                <Link href={ROUTES.dashboardProductNew}>
                  <Upload className="h-4 w-4 mr-2" />
                  {t("uploadProduct") || "Upload Product"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Insights Dashboard */}
      <div className="mb-8">
        <AIInsightsDashboard
          insightsCount={0}
          onViewInsights={() => {
            // Placeholder - would navigate to full insights page
          }}
        />
      </div>

      {/* Recent Activity or Additional Info */}
      <div>
        {isSupplier ? (
          <RecentProducts />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("recentActivity") || "Recent Activity"}</CardTitle>
              <CardDescription>{t("recentActivityDescription") || "Your latest actions"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {t("noRecentActivity") || "No recent activity. Start by submitting an RFQ or browsing products."}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Chat Assistant (Floating) */}
      <div className="fixed bottom-4 right-4 z-50 hidden md:block">
        <AIChatAssistant
          isMinimized={true}
          onSendMessage={(message) => {
            // Placeholder - would send message to AI
            console.log("AI Chat message:", message);
          }}
        />
      </div>
    </div>
  );
}

