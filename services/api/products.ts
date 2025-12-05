import type {
  Product,
  ProductListItem,
  ProductFilters,
  ProductListResponse,
  CreateProductInput,
  UpdateProductInput,
} from "@/types/product";
import type { PaginationParams } from "@/types/api";
import productsMockData from "@/services/mocks/products.json";

/**
 * Mock delay to simulate API call
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch products with filters and pagination
 */
export async function fetchProducts(
  filters?: ProductFilters,
  pagination?: PaginationParams
): Promise<ProductListResponse> {
  await delay(300); // Simulate API delay

  let filteredProducts = [...productsMockData] as ProductListItem[];

  // Apply filters
  if (filters?.category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.slug === filters.category || p.category.id === filters.category
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.shortDescription?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.minPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price.amount >= filters.minPrice!);
  }

  if (filters?.maxPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price.amount <= filters.maxPrice!);
  }

  if (filters?.verifiedOnly) {
    filteredProducts = filteredProducts.filter((p) => p.company.verified);
  }

  if (filters?.goldSupplierOnly) {
    filteredProducts = filteredProducts.filter((p) => p.company.goldSupplier);
  }

  if (filters?.membershipTier) {
    filteredProducts = filteredProducts.filter(
      (p) => p.company.membershipTier === filters.membershipTier
    );
  }

  if (filters?.companyId) {
    filteredProducts = filteredProducts.filter((p) => p.company.id === filters.companyId);
  }

  // Pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    products: paginatedProducts,
    total,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: string): Promise<Product> {
  await delay(200);

  const product = productsMockData.find((p) => p.id === id);

  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  // Ensure specifications is properly typed (filter out undefined values)
  const cleanSpecs: Record<string, string> = {};
  if (product.specifications) {
    Object.entries(product.specifications).forEach(([key, value]) => {
      if (value !== undefined && typeof value === "string") {
        cleanSpecs[key] = value;
      }
    });
  }

  return {
    ...product,
    specifications: Object.keys(cleanSpecs).length > 0 ? cleanSpecs : undefined,
    status: product.status as "active" | "inactive" | "pending",
  } as Product;
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<ProductListItem[]> {
  await delay(300);

  const queryLower = query.toLowerCase();
  return (productsMockData as ProductListItem[]).filter(
    (p) =>
      p.name.toLowerCase().includes(queryLower) ||
      p.shortDescription?.toLowerCase().includes(queryLower) ||
      p.category.name.toLowerCase().includes(queryLower)
  );
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
  await delay(300);

  // Filter by user's companyId
  const userCompanyId = companyId;

  let filteredProducts = (productsMockData as ProductListItem[]).filter(
    (p) => p.company.id === userCompanyId
  );

  // Apply additional filters
  if (filters?.category) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category.slug === filters.category || p.category.id === filters.category
    );
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.shortDescription?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.minPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price.amount >= filters.minPrice!);
  }

  if (filters?.maxPrice) {
    filteredProducts = filteredProducts.filter((p) => p.price.amount <= filters.maxPrice!);
  }

  // Pagination
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / pageSize);

  return {
    products: paginatedProducts,
    total,
    page,
    pageSize,
    totalPages,
  };
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
  category: { id: string; name: string; slug: string }
): Promise<Product> {
  await delay(500);

  // In real app, this would:
  // 1. Upload images to storage
  // 2. Create product in database
  // 3. Return created product with full details

  // Mock implementation
  const newProduct: Product = {
    id: `product-${Date.now()}`,
    ...productData,
    category,
    company: {
      id: companyId,
      name: "User Company", // Would come from company lookup
      verified: true,
      goldSupplier: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  productData: UpdateProductInput
): Promise<Product> {
  await delay(500);

  // In real app, this would:
  // 1. Verify ownership (user's company)
  // 2. Update product in database
  // 3. Handle image updates

  const existingProduct = productsMockData.find((p) => p.id === id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }

  // Mock update
  const updatedProduct: Product = {
    ...existingProduct,
    ...productData,
    id,
    updatedAt: new Date().toISOString(),
  } as Product;

  return updatedProduct;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await delay(300);

  // In real app, this would:
  // 1. Verify ownership
  // 2. Delete product from database
  // 3. Clean up associated images

  const product = productsMockData.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  // Mock: product would be deleted
}

/**
 * Duplicate a product
 */
export async function duplicateProduct(id: string): Promise<Product> {
  await delay(400);

  const product = productsMockData.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }

  // Create a duplicate with new ID
  const duplicated = {
    ...product,
    id: `product-${Date.now()}`,
    name: `${product.name} (Copy)`,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Clean specifications to ensure proper typing
  const cleanSpecs: Record<string, string> = {};
  if (duplicated.specifications) {
    Object.entries(duplicated.specifications).forEach(([key, value]) => {
      if (value !== undefined && typeof value === "string") {
        cleanSpecs[key] = value;
      }
    });
  }

  return {
    ...duplicated,
    specifications: Object.keys(cleanSpecs).length > 0 ? cleanSpecs : undefined,
  } as Product;
}

