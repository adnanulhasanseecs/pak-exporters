/**
 * Product type definitions
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: {
    amount: number;
    currency: string;
    minOrderQuantity?: number;
  };
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  company: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
    goldSupplier: boolean;
    membershipTier?: "platinum" | "gold" | "silver" | "starter";
  };
  specifications?: Record<string, string>;
  tags?: string[];
  status: "active" | "inactive" | "pending";
  salesData?: {
    soldLast7Days?: number;
    totalSold?: number;
    viewsLast7Days?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem extends Omit<Product, "description" | "specifications"> {
  description?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  companyId?: string;
  verifiedOnly?: boolean;
  goldSupplierOnly?: boolean;
  membershipTier?: "platinum" | "gold" | "silver" | "starter";
  search?: string;
  tags?: string[];
}

export interface ProductListResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Input type for creating a new product
 * Omits fields that are auto-generated or come from user context
 */
export interface CreateProductInput {
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  price: {
    amount: number;
    currency: string;
    minOrderQuantity?: number;
  };
  images: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  status: "active" | "inactive" | "pending";
}

/**
 * Input type for updating a product
 * All fields are optional except id
 */
export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

/**
 * Form-specific product data type
 * Used in product form components
 */
export interface ProductFormData {
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  price: {
    amount: number;
    currency: "USD" | "PKR" | "EUR" | "GBP";
    minOrderQuantity?: number;
  };
  images: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  status: "active" | "inactive" | "pending";
}

