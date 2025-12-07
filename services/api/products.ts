/**
 * Products API Service
 * Real implementation using Next.js API routes
 */

import type {
  Product,
  ProductListItem,
  ProductFilters,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import type { PaginationParams } from "@/types/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { buildApiUrl } from "@/lib/api-client";

/**
 * Get the API URL - always uses buildApiUrl for absolute URLs
 * Node.js fetch() requires absolute URLs, so we use buildApiUrl which now
 * correctly uses APP_CONFIG.url (includes correct port 3001)
 */
function getApiUrl(endpoint: string): string {
  // Always use buildApiUrl - it now correctly uses APP_CONFIG.url as fallback
  return buildApiUrl(endpoint);
}

/**
 * Helper to build query string from filters and pagination
 */
function buildQueryString(filters?: ProductFilters, pagination?: PaginationParams): string {
  const params = new URLSearchParams();

  if (filters?.category) params.append("category", filters.category);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.minPrice !== undefined) params.append("minPrice", filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.append("maxPrice", filters.maxPrice.toString());
  if (filters?.companyId) params.append("companyId", filters.companyId);
  if (filters?.verifiedOnly) params.append("verifiedOnly", "true");
  if (filters?.goldSupplierOnly) params.append("goldSupplierOnly", "true");
  if (filters?.membershipTier) params.append("membershipTier", filters.membershipTier);
  if (filters?.tags && filters.tags.length > 0) params.append("tags", filters.tags.join(","));

  if (pagination?.page) params.append("page", pagination.page.toString());
  if (pagination?.pageSize) params.append("pageSize", pagination.pageSize.toString());

  return params.toString();
}

/**
 * Fetch products with filters and pagination
 */
export async function fetchProducts(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ProductListResponse> {
  const queryString = buildQueryString(filters, pagination);
  const url = `${API_ENDPOINTS.products}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(getApiUrl(url), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    let errorMessage = `Failed to fetch products: ${response.status} ${response.statusText}`;
    
    if (contentType && contentType.includes("application/json")) {
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
        // Include hint if available
        if (error.hint) {
          errorMessage += `\n💡 ${error.hint}`;
        }
      } catch (parseError) {
        // If JSON parsing fails, use status text
        errorMessage = `Failed to fetch products: ${response.status} ${response.statusText}`;
      }
    } else {
      // Response is HTML (error page) or other non-JSON format
      try {
        const text = await response.text();
        // Try to extract error message from HTML if possible
        const errorMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                          text.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                          text.match(/Error[:\s]+([^<\n]+)/i);
        if (errorMatch && errorMatch[1]) {
          errorMessage = `Failed to fetch products: ${errorMatch[1].trim()}`;
        }
      } catch (textError) {
        // If we can't read the text, just use status
        errorMessage = `Failed to fetch products: ${response.status} ${response.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(getApiUrl(`${API_ENDPOINTS.products}/${id}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Product with id ${id} not found`);
    }
    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch product");
    } else {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<ProductListItem[]> {
  const response = await fetchProducts({ search: query });
  return response.products;
}

/**
 * Fetch products for the current logged-in user (supplier)
 * @param companyId - The company ID of the logged-in user (from auth context)
 */
export async function fetchUserProducts(
  companyId: string,
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ProductListResponse> {
  return fetchProducts({ ...filters, companyId }, pagination);
}

/**
 * Create a new product
 * @param productData - Product data to create
 * @param companyId - The company ID of the logged-in user (from auth context)
 * @param category - Category details (fetched separately)
 */
export async function createProduct(
  productData: CreateProductInput,
  companyId: string,
  _category: { id: string; name: string; slug: string }
): Promise<Product> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.products), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      ...productData,
      companyId, // Include companyId in request
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create product");
  }

  return response.json();
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  productData: UpdateProductInput
): Promise<Product> {
  const response = await fetch(buildApiUrl(`${API_ENDPOINTS.products}/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Product with id ${id} not found`);
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to update product");
  }

  return response.json();
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(buildApiUrl(`${API_ENDPOINTS.products}/${id}`), {
    method: "DELETE",
    headers: {
      // TODO: Add Authorization header with token
      // Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Product with id ${id} not found`);
    }
    const error = await response.json();
    throw new Error(error.error || "Failed to delete product");
  }
}

/**
 * Duplicate a product
 */
export async function duplicateProduct(id: string): Promise<Product> {
  // Fetch the original product
  const originalProduct = await fetchProduct(id);

  // Create a new product with copied data
  const duplicatedData: CreateProductInput = {
    name: `${originalProduct.name} (Copy)`,
    description: originalProduct.description,
    shortDescription: originalProduct.shortDescription,
    categoryId: originalProduct.category.id,
    price: originalProduct.price,
    images: originalProduct.images,
    specifications: originalProduct.specifications,
    tags: originalProduct.tags,
    status: "pending",
  };

  // Get company ID from original product
  const companyId = originalProduct.company.id;

  // Create the duplicated product
  return createProduct(duplicatedData, companyId, originalProduct.category);
}
