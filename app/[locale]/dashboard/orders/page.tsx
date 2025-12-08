"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  Eye,
  Calendar,
  DollarSign,
  ShoppingCart,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import type { Order, OrderStatus } from "@/types/order";
import { formatDistanceToNow } from "date-fns";

// Mock orders data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    buyer: {
      id: "buyer-1",
      name: "John Smith",
      email: "john@example.com",
      company: "Global Imports Inc.",
    },
    supplier: {
      id: "supplier-1",
      name: "Ahmed Ali",
      company: "Pak Textiles Ltd.",
    },
    items: [
      {
        id: "item-1",
        productId: "product-1",
        productName: "Cotton T-Shirts",
        productImage: "/images/products/tshirt.jpg",
        quantity: 1000,
        unitPrice: { amount: 5, currency: "USD" },
        total: { amount: 5000, currency: "USD" },
      },
    ],
    total: { amount: 5000, currency: "USD" },
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    buyer: {
      id: "buyer-2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      company: "Fashion Retail Co.",
    },
    supplier: {
      id: "supplier-2",
      name: "Hassan Khan",
      company: "Leather Goods Export",
    },
    items: [
      {
        id: "item-2",
        productId: "product-2",
        productName: "Leather Handbags",
        productImage: "/images/products/handbag.jpg",
        quantity: 500,
        unitPrice: { amount: 25, currency: "USD" },
        total: { amount: 12500, currency: "USD" },
      },
    ],
    total: { amount: 12500, currency: "USD" },
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    trackingNumber: "TRK-123456789",
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    buyer: {
      id: "buyer-3",
      name: "Michael Brown",
      email: "michael@example.com",
      company: "Electronics Distributor",
    },
    supplier: {
      id: "supplier-3",
      name: "Fatima Ahmed",
      company: "Pak Electronics",
    },
    items: [
      {
        id: "item-3",
        productId: "product-3",
        productName: "Mobile Phone Cases",
        productImage: "/images/products/case.jpg",
        quantity: 2000,
        unitPrice: { amount: 2, currency: "USD" },
        total: { amount: 4000, currency: "USD" },
      },
    ],
    total: { amount: 4000, currency: "USD" },
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "secondary", icon: Package },
  shipped: { label: "Shipped", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (!user) {
      toast.error(tCommon("error"));
      router.push(ROUTES.login);
      return;
    }

    // Load mock orders
    setTimeout(() => {
      // Filter orders based on user role
      let filteredOrders = mockOrders;
      if (user.role === "buyer") {
        filteredOrders = mockOrders.filter((order) => order.buyer.id === user.id);
      } else if (user.role === "supplier") {
        filteredOrders = mockOrders.filter((order) => order.supplier.id === user.id);
      }

      setOrders(filteredOrders);
      setLoading(false);
    }, 500);
  }, [user, router]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("orders")}</h1>
        <p className="text-muted-foreground">
          {user.role === "buyer"
            ? t("trackOrders") || "Track and manage your orders"
            : t("manageOrders") || "Manage orders from buyers"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchOrders") || "Search by order number, buyer, or supplier..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("filterByStatus") || "Filter by status"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus") || "All Status"}</SelectItem>
            <SelectItem value="pending">{t("pending") || "Pending"}</SelectItem>
            <SelectItem value="confirmed">{t("confirmed") || "Confirmed"}</SelectItem>
            <SelectItem value="processing">{t("processing") || "Processing"}</SelectItem>
            <SelectItem value="shipped">{t("shipped") || "Shipped"}</SelectItem>
            <SelectItem value="delivered">{t("delivered") || "Delivered"}</SelectItem>
            <SelectItem value="cancelled">{t("cancelled") || "Cancelled"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <Badge variant={statusConfig[order.status].variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                        {order.paymentStatus === "paid" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Paid
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {order.total.currency} {order.total.amount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={ROUTES.dashboardOrderDetail(order.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {user.role === "buyer" ? "Supplier" : "Buyer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.role === "buyer"
                          ? order.supplier.company
                          : order.buyer.name}
                      </p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-sm font-medium mb-1">Tracking Number</p>
                        <p className="text-sm text-muted-foreground">{order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t("noOrders")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all"
                ? t("adjustFilters") || "Try adjusting your filters"
                : t("noOrdersYet") || "You don't have any orders yet"}
            </p>
            {user.role === "buyer" && (
              <Button asChild>
                <Link href={ROUTES.products}>{t("browseProducts") || "Browse Products"}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

