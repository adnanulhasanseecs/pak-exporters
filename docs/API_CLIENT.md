# API Client Documentation

## Overview

The centralized API client (`lib/api-client.ts`) provides a unified interface for all API calls with built-in error handling, retry logic, authentication, and rate limiting.

## Features

✅ **Request/Response Interceptors** - Automatically adds auth tokens and handles errors  
✅ **Automatic Retry Logic** - Retries failed requests with exponential backoff  
✅ **Authentication Handling** - Manages token storage and refresh  
✅ **Rate Limiting** - Handles 429 responses with retry-after headers  
✅ **Request Deduplication** - Prevents duplicate concurrent requests  
✅ **Timeout Support** - Configurable request timeouts  
✅ **File Upload** - Built-in file upload with progress tracking  

## Usage

### Basic Usage

```typescript
import { apiClient } from "@/lib/api-client";

// GET request
const products = await apiClient.get<Product[]>("/products");

// POST request
const newProduct = await apiClient.post<Product>("/products", {
  name: "Product Name",
  price: 100,
});

// PUT request
const updated = await apiClient.put<Product>("/products/1", {
  name: "Updated Name",
});

// DELETE request
await apiClient.delete("/products/1");
```

### With Custom Configuration

```typescript
import { createApiClient } from "@/lib/api-client";

const customClient = createApiClient({
  baseURL: "https://api.example.com",
  timeout: 60000, // 60 seconds
  maxRetries: 5,
  retryDelay: 2000, // 2 seconds
  onAuthError: () => {
    // Custom auth error handler
    console.log("Auth failed");
  },
  onRateLimit: (retryAfter) => {
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  },
});
```

### File Upload

```typescript
const file = document.querySelector('input[type="file"]').files[0];

await apiClient.upload<{ url: string }>(
  "/upload",
  file,
  (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
);
```

### Request Configuration

```typescript
// Skip authentication
await apiClient.get("/public-endpoint", { skipAuth: true });

// Custom retry settings
await apiClient.get("/endpoint", {
  retries: 5,
  retryDelay: 2000,
  timeout: 60000,
});
```

## Authentication

The API client automatically:
- Reads the auth token from `localStorage.getItem("auth_token")`
- Adds it to requests as `Authorization: Bearer <token>`
- Clears the token on 401 errors
- Triggers `onAuthError` callback on authentication failures

### Setting Auth Token

```typescript
import { apiClient } from "@/lib/api-client";

// After login
apiClient.setAuthToken("your-jwt-token");

// On logout
apiClient.clearAuthToken();
```

## Error Handling

The client throws `ApiClientError` for all errors:

```typescript
import { apiClient, ApiClientError } from "@/lib/api-client";

try {
  const data = await apiClient.get("/endpoint");
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`Status: ${error.statusCode}`);
    console.error(`Message: ${error.message}`);
    console.error(`Data:`, error.data);
  }
}
```

## Retry Logic

The client automatically retries:
- Network errors
- 5xx server errors
- Timeout errors

It does NOT retry:
- 4xx client errors (except 429 rate limit)
- 401 authentication errors

Retry behavior:
- Default: 3 retries
- Exponential backoff: `retryDelay * 2^(attempt - 1)`
- Configurable per request or globally

## Rate Limiting

When a 429 (Rate Limit) response is received:
- The client extracts `Retry-After` header
- Calls `onRateLimit` callback with retry time
- Throws `ApiClientError` with status 429

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

The default client uses this environment variable for the base URL.

## Migration from Mock Services

Current services use mock data with `delay()` functions. To migrate to real API:

1. Replace mock data with API calls:

```typescript
// Before (mock)
export async function fetchProducts() {
  await delay(300);
  return productsMockData;
}

// After (real API)
import { apiClient } from "@/lib/api-client";

export async function fetchProducts() {
  const response = await apiClient.get<ProductListResponse>("/products");
  return response;
}
```

2. Update error handling:

```typescript
// Before
try {
  const products = await fetchProducts();
} catch (error) {
  console.error(error);
}

// After
import { ApiClientError } from "@/lib/api-client";

try {
  const products = await fetchProducts();
} catch (error) {
  if (error instanceof ApiClientError) {
    // Handle API errors
    toast.error(error.message);
  }
}
```

## CORS Configuration

CORS is configured on the **backend/server**, not in the client. The client sends requests with:
- `Authorization` header (if authenticated)
- `Content-Type: application/json` (for JSON requests)
- `X-Request-ID` header (for request tracking)

### Backend CORS Setup

For Next.js API routes, add to `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" }, // Or specific domain
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ];
}
```

For Express/Node.js backend:

```javascript
const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

## Testing

See `lib/api-client.test.ts` for comprehensive test examples.

## Best Practices

1. **Always handle errors** - Use try/catch with `ApiClientError`
2. **Set appropriate timeouts** - Default is 30s, adjust for slow endpoints
3. **Use request deduplication** - GET requests are automatically deduplicated
4. **Configure retries wisely** - Don't retry on 4xx errors (except 429)
5. **Handle rate limits** - Implement `onRateLimit` callback for user feedback

