/**
 * Order type definitions
 */

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  supplier: {
    id: string;
    name: string;
    company: string;
  };
  items: OrderItem[];
  total: {
    amount: number;
    currency: string;
  };
  status: OrderStatus;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    country: string;
    postalCode?: string;
  };
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  notes?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: {
    amount: number;
    currency: string;
  };
  total: {
    amount: number;
    currency: string;
  };
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

