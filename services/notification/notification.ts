/**
 * Notification Service
 * Handles in-app notifications and push notifications
 */

export type NotificationType = 
  | "info" 
  | "success" 
  | "warning" 
  | "error"
  | "rfq_response"
  | "order_update"
  | "membership_status"
  | "message";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    [key in NotificationType]?: boolean;
  };
}

/**
 * Create a notification
 */
export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    link?: string;
    metadata?: Record<string, unknown>;
  }
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    link: options?.link,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: options?.metadata,
  };
}

/**
 * Store notification in localStorage (mock implementation)
 */
function storeNotification(notification: Notification): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(`notifications-${notification.userId}`);
  const notifications: Notification[] = stored ? JSON.parse(stored) : [];
  notifications.unshift(notification);
  
  // Keep only last 100 notifications
  const limited = notifications.slice(0, 100);
  localStorage.setItem(`notifications-${notification.userId}`, JSON.stringify(limited));
}

/**
 * Send notification
 */
export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  options?: {
    link?: string;
    metadata?: Record<string, unknown>;
    sendEmail?: boolean;
    sendPush?: boolean;
  }
): Promise<Notification> {
  const notification = createNotification(userId, type, title, message, options);

  // Store notification
  storeNotification(notification);

  // Send email if requested
  if (options?.sendEmail) {
    // In production, this would call the email service
    console.log("[Notification] Sending email notification:", notification);
  }

  // Send push notification if requested
  if (options?.sendPush) {
    // In production, this would send push notification via service worker
    console.log("[Notification] Sending push notification:", notification);
  }

  return notification;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  }
): Promise<Notification[]> {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(`notifications-${userId}`);
  if (!stored) return [];

  let notifications: Notification[] = JSON.parse(stored);

  if (options?.unreadOnly) {
    notifications = notifications.filter((n) => !n.read);
  }

  if (options?.limit) {
    notifications = notifications.slice(0, options.limit);
  }

  return notifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(`notifications-${userId}`);
  if (!stored) return;

  const notifications: Notification[] = JSON.parse(stored);
  const notification = notifications.find((n) => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    localStorage.setItem(`notifications-${userId}`, JSON.stringify(notifications));
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(`notifications-${userId}`);
  if (!stored) return;

  const notifications: Notification[] = JSON.parse(stored);
  notifications.forEach((n) => {
    n.read = true;
  });

  localStorage.setItem(`notifications-${userId}`, JSON.stringify(notifications));
}

/**
 * Delete notification
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem(`notifications-${userId}`);
  if (!stored) return;

  const notifications: Notification[] = JSON.parse(stored);
  const filtered = notifications.filter((n) => n.id !== notificationId);

  localStorage.setItem(`notifications-${userId}`, JSON.stringify(filtered));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const notifications = await getUserNotifications(userId, { unreadOnly: true });
  return notifications.length;
}

/**
 * Notification helper functions for common scenarios
 */
export const notificationHelpers = {
  rfqResponse: (userId: string, supplierName: string, rfqTitle: string, rfqId: string) =>
    sendNotification(
      userId,
      "rfq_response",
      "New RFQ Response",
      `${supplierName} has responded to your RFQ: ${rfqTitle}`,
      {
        link: `/dashboard/rfq/${rfqId}`,
        sendEmail: true,
      }
    ),

  orderUpdate: (userId: string, orderNumber: string, status: string, orderId: string) =>
    sendNotification(
      userId,
      "order_update",
      "Order Update",
      `Order ${orderNumber} status updated to ${status}`,
      {
        link: `/dashboard/orders/${orderId}`,
        sendEmail: true,
      }
    ),

  membershipApproved: (userId: string, tier: string) =>
    sendNotification(
      userId,
      "membership_status",
      "Membership Approved",
      `Your ${tier} membership application has been approved!`,
      {
        link: "/dashboard",
        sendEmail: true,
      }
    ),

  newMessage: (userId: string, senderName: string, messageId: string) =>
    sendNotification(
      userId,
      "message",
      "New Message",
      `You have a new message from ${senderName}`,
      {
        link: `/messages/${messageId}`,
        sendPush: true,
      }
    ),
};

