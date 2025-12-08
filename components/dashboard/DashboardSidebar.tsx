"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Building2,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Plus,
  Users,
  Search,
  ShoppingCart,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isSupplier = user.role === "supplier";

  const supplierNavItems: NavItem[] = [
    {
      title: "Overview",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: ROUTES.dashboardProducts,
      icon: Package,
    },
    {
      title: "New Product",
      href: ROUTES.dashboardProductNew,
      icon: Plus,
    },
    {
      title: "Companies",
      href: ROUTES.dashboardCompanies,
      icon: Building2,
    },
    {
      title: "New Company",
      href: ROUTES.dashboardCompanyNew,
      icon: Plus,
    },
    {
      title: "RFQs",
      href: ROUTES.dashboardRfq,
      icon: FileText,
    },
    {
      title: "Orders",
      href: ROUTES.dashboardOrders,
      icon: ShoppingCart,
    },
    {
      title: "Analytics",
      href: ROUTES.dashboardAnalytics,
      icon: BarChart3,
    },
    {
      title: "Notifications",
      href: ROUTES.dashboardNotifications,
      icon: Bell,
    },
    {
      title: "Settings",
      href: ROUTES.dashboardSettings,
      icon: Settings,
    },
  ];

  const buyerNavItems: NavItem[] = [
    {
      title: "Overview",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
    },
    {
      title: "Submit RFQ",
      href: ROUTES.rfq,
      icon: Plus,
    },
    {
      title: "My RFQs",
      href: ROUTES.dashboardRfq,
      icon: FileText,
    },
    {
      title: "Orders",
      href: ROUTES.dashboardOrders,
      icon: ShoppingCart,
    },
    {
      title: "Browse Products",
      href: ROUTES.products,
      icon: Search,
    },
    {
      title: "Find Suppliers",
      href: ROUTES.companies,
      icon: Users,
    },
    {
      title: "Analytics",
      href: ROUTES.dashboardAnalytics,
      icon: BarChart3,
    },
    {
      title: "Notifications",
      href: ROUTES.dashboardNotifications,
      icon: Bell,
    },
    {
      title: "Settings",
      href: ROUTES.dashboardSettings,
      icon: Settings,
    },
  ];

  const navItems = isSupplier ? supplierNavItems : buyerNavItems;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-20 left-4 z-40 bg-background border"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 border-r bg-muted/40 min-h-screen p-4 fixed md:sticky top-16 z-30 transition-transform",
          "md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto bg-primary/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}

