# API Documentation

## Overview

Pak-Exporters B2B Marketplace uses a service-based architecture with mock API services. This document describes the API structure and endpoints.

## Base URL

- **Development:** `http://localhost:3001`
- **Production:** `https://pak-exporters.com`

## Authentication

Currently using mock authentication. In production, this will use JWT tokens.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## API Services

### Products API

**Location:** `services/api/products.ts`

#### `fetchProducts(options?)`

Fetch a list of products with optional filters.

**Parameters:**
- `options.categoryId?: string` - Filter by category
- `options.companyId?: string` - Filter by company
- `options.search?: string` - Search query
- `options.page?: number` - Page number (default: 1)
- `options.limit?: number` - Items per page (default: 20)

**Returns:** `Promise<{ products: Product[], total: number, page: number, limit: number }>`

**Example:**
```typescript
const { products, total } = await fetchProducts({
  categoryId: "1",
  search: "cotton",
  page: 1,
  limit: 20
});
```

#### `fetchProduct(id: string)`

Fetch a single product by ID.

**Returns:** `Promise<Product>`

#### `createProduct(data, companyId, category)`

Create a new product.

**Parameters:**
- `data: ProductFormData` - Product data
- `companyId: string` - Company ID
- `category: Category` - Category object

**Returns:** `Promise<Product>`

#### `updateProduct(id: string, data: Partial<Product>)`

Update an existing product.

**Returns:** `Promise<Product>`

#### `deleteProduct(id: string)`

Delete a product.

**Returns:** `Promise<void>`

---

### Categories API

**Location:** `services/api/categories.ts`

#### `fetchCategories()`

Fetch all categories.

**Returns:** `Promise<Category[]>`

#### `fetchCategoryTree()`

Fetch categories as a tree structure.

**Returns:** `Promise<CategoryTree[]>`

#### `fetchCategoryBySlug(slug: string)`

Fetch a category by slug.

**Returns:** `Promise<Category>`

---

### Companies API

**Location:** `services/api/companies.ts`

#### `fetchCompanies(options?)`

Fetch companies with optional filters.

**Parameters:**
- `options.search?: string` - Search query
- `options.categoryId?: string` - Filter by category
- `options.verified?: boolean` - Filter verified companies
- `options.page?: number` - Page number
- `options.limit?: number` - Items per page

**Returns:** `Promise<{ companies: Company[], total: number }>`

#### `fetchCompany(id: string)`

Fetch a single company by ID.

**Returns:** `Promise<Company>`

#### `createCompany(data: CompanyFormData)`

Create a new company.

**Returns:** `Promise<Company>`

---

### RFQ API

**Location:** `services/api/rfq.ts`

#### `fetchRFQs(options?)`

Fetch RFQs with optional filters.

**Parameters:**
- `options.userId?: string` - Filter by user
- `options.status?: RFQStatus` - Filter by status
- `options.page?: number` - Page number
- `options.limit?: number` - Items per page

**Returns:** `Promise<{ rfqs: RFQ[], total: number }>`

#### `fetchRFQ(id: string)`

Fetch a single RFQ by ID.

**Returns:** `Promise<RFQ>`

#### `createRFQ(data: RFQFormData)`

Create a new RFQ.

**Returns:** `Promise<RFQ>`

#### `submitRFQResponse(rfqId: string, data: RFQResponseData)`

Submit a response to an RFQ.

**Returns:** `Promise<RFQResponse>`

---

### Search API

**Location:** `services/api/search.ts`

#### `searchProducts(query: string, filters?)`

Search for products.

**Parameters:**
- `query: string` - Search query
- `filters?: SearchFilters` - Additional filters

**Returns:** `Promise<{ products: Product[], total: number }>`

#### `searchCompanies(query: string)`

Search for companies.

**Returns:** `Promise<{ companies: Company[], total: number }>`

---

## Data Types

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: Category;
  company: Company;
  price: {
    amount: number;
    currency: "USD" | "PKR" | "EUR" | "GBP";
    minOrderQuantity?: number;
  };
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt: string;
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
}
```

### Company

```typescript
interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  location: {
    city: string;
    province: string;
    country: string;
  };
  categories: Category[];
  mainProducts?: string[];
  verified: boolean;
  membershipTier: "platinum" | "gold" | "silver" | "basic";
  yearEstablished?: number;
}
```

### RFQ

```typescript
interface RFQ {
  id: string;
  title: string;
  description: string;
  category: Category;
  quantity: number;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  deadline?: string;
  status: "open" | "closed" | "awarded";
  createdBy: User;
  responses: RFQResponse[];
  createdAt: string;
}
```

---

## Error Handling

All API functions throw errors that should be caught and handled:

```typescript
try {
  const product = await fetchProduct("123");
} catch (error) {
  if (error instanceof Error) {
    console.error("Error fetching product:", error.message);
  }
}
```

---

## Mock Data

Currently, all API services use mock data from JSON files in `services/mocks/`. In production, these will be replaced with real API calls.

---

## Future Backend Integration

When the backend is implemented, API calls will be made to:

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

Similar patterns will apply to other resources (categories, companies, RFQs).

---

**Last Updated:** 2025-01-XX

