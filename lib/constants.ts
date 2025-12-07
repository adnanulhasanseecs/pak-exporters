/**
 * Application constants
 */

export const APP_CONFIG = {
  name: "Pak-Exporters",
  description: "Pakistan's First Export Marketplace - Connecting exporters with global buyers since 2019",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
  contact: {
    phone: "+92 321 9555507",
    email: "admin@pak-exporters.com",
    address: "18 Level 1, I 8, Islamabad, Pakistan",
    workingHours: "Mon - Sat / 9:00 AM - 8:00 PM",
  },
  established: 2019,
} as const;

export const ROUTES = {
  home: "/",
  categories: "/categories",
  category: (slug: string) => `/category/${slug}`,
  products: "/products",
  product: (id: string) => `/products/${id}`,
  companies: "/companies",
  company: (id: string) => `/company/${id}`,
  rfq: "/rfq",
  search: "/search",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
  terms: "/terms",
  privacy: "/privacy",
  membership: "/membership",
  membershipApply: "/membership/apply",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  dashboardProducts: "/dashboard/products",
  dashboardProductNew: "/dashboard/products/new",
  dashboardProductEdit: (id: string) => `/dashboard/products/${id}/edit`,
  dashboardCompanies: "/dashboard/companies",
  dashboardCompanyNew: "/dashboard/companies/new",
  dashboardCompanyEdit: (id: string) => `/dashboard/companies/${id}/edit`,
  dashboardRfq: "/dashboard/rfq",
  dashboardRfqDetail: (id: string) => `/dashboard/rfq/${id}`,
  dashboardRfqRespond: (id: string) => `/dashboard/rfq/${id}/respond`,
  dashboardOrders: "/dashboard/orders",
  dashboardOrderDetail: (id: string) => `/dashboard/orders/${id}`,
  dashboardAnalytics: "/dashboard/analytics",
  dashboardNotifications: "/dashboard/notifications",
  dashboardSettings: "/dashboard/settings",
  profile: "/profile",
  profileSettings: "/profile/settings",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  admin: "/admin",
} as const;

export const API_ENDPOINTS = {
  products: "/api/products",
  companies: "/api/companies",
  categories: "/api/categories",
  rfq: "/api/rfq",
  blog: "/api/blog",
  membership: "/api/membership",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
    refresh: "/api/auth/refresh",
    verifyEmail: "/api/auth/verify-email",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
  },
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

export const IMAGE_PLACEHOLDER = {
  product: "https://via.placeholder.com/400x400?text=Product",
  company: "https://via.placeholder.com/200x200?text=Company",
  category: "https://via.placeholder.com/300x200?text=Category",
} as const;

