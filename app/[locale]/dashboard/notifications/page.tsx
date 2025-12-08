"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants";
import {
  Bell,
  CheckCircle2,
  Package,
  ShoppingCart,
  MessageSquare,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { formatDistanceToNow } from "date-fns";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
  type Notification as ServiceNotification,
} from "@/services/notification/notification";
import { useTranslations } from "next-intl";

interface PageNotification {
  id: string;
  type: "order" | "rfq" | "message" | "system" | "product";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<PageNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }

    loadNotifications();
  }, [user, router]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Use notification service
      const serviceNotifications: ServiceNotification[] = await getUserNotifications(user.id);
      
      // Convert service notifications to page format
      const pageNotifications: PageNotification[] = serviceNotifications.map((notif) => ({
        id: notif.id,
        type: mapNotificationType(notif.type),
        title: notif.title,
        message: notif.message,
        read: notif.read,
        timestamp: notif.createdAt,
        actionUrl: notif.link,
      }));

      // If no notifications from service, use mock data for demo
      if (pageNotifications.length === 0) {
        const mockNotifications: PageNotification[] = [
          {
            id: "1",
            type: "order",
            title: "New Order Received",
            message: "You received a new order for Cotton T-Shirts (Order #1234)",
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            actionUrl: "/dashboard/orders/1234",
          },
          {
            id: "2",
            type: "rfq",
            title: "RFQ Response",
            message: "A supplier responded to your RFQ for Leather Jackets",
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            actionUrl: "/dashboard/rfq/rfq-1",
          },
        ];
        setNotifications(mockNotifications);
      } else {
        setNotifications(pageNotifications);
      }
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mapNotificationType = (type: string): PageNotification["type"] => {
    switch (type) {
      case "order_update":
        return "order";
      case "rfq_response":
        return "rfq";
      case "message":
        return "message";
      case "membership_status":
        return "system";
      default:
        return "system";
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      await markNotificationAsRead(user.id, id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
      toast.success(tCommon("success"));
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      toast.success(tCommon("success"));
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteNotificationService(user.id, id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      toast.success(tCommon("success"));
    } catch (error) {
      toast.error(tCommon("error"));
      console.error(error);
    }
  };

  const deleteSelected = async () => {
    setNotifications((prev) => prev.filter((notif) => !selectedIds.includes(notif.id)));
    setSelectedIds([]);
    toast.success(tCommon("success"));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getNotificationIcon = (type: PageNotification["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-5 w-5" />;
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "product":
        return <Package className="h-5 w-5" />;
      case "rfq":
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: PageNotification["type"]) => {
    switch (type) {
      case "order":
        return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400";
      case "message":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400";
      case "product":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400";
      case "rfq":
        return "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400";
    }
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" text={tCommon("loading")} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("notifications")}</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} ${t("unreadNotifications", { count: unreadCount })}` : t("allCaughtUp") || "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("deleteSelected") || "Delete Selected"} ({selectedIds.length})
            </Button>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              {t("markAllRead") || "Mark All Read"}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            {tCommon("all")} ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            {t("unread") || "Unread"} ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read">
            {t("read") || "Read"} ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === "unread"
                ? t("noUnreadNotifications") || "No unread notifications"
                : filter === "read"
                ? t("noReadNotifications") || "No read notifications"
                : t("noNotificationsYet") || "No notifications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={!notification.read ? "border-primary/50 bg-primary/5" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedIds.includes(notification.id)}
                    onCheckedChange={() => toggleSelect(notification.id)}
                    className="mt-1"
                  />
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                        <Button
                        variant="link"
                        size="sm"
                        className="mt-2 p-0 h-auto"
                        onClick={() => router.push(notification.actionUrl!)}
                      >
                        {t("viewDetails") || "View Details"} →
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

