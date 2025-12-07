# Backend Setup Plan for Pak-Exporters

## Overview

Set up a backend to efficiently handle the migrated data from the old website, currently stored in JSON files.

## Current Data Storage

**Location:** `services/mocks/*.json`
- `products.json` - Product catalog
- `companies.json` - Supplier/company data
- `categories.json` - Category hierarchy
- `rfqs.json` - Request for Quotation data
- `blog.json` - Blog posts
- `membership-applications.json` - Membership applications

**Total Size:** ~46 KB

## Backend Architecture Options

### Option 1: Next.js API Routes + SQLite (Recommended for Start)
✅ **Pros:**
- Same repository, simple setup
- SQLite for development (no external DB needed)
- Easy migration path to PostgreSQL
- Works with existing API client

❌ **Cons:**
- Limited scalability
- File-based database

### Option 2: Next.js API Routes + PostgreSQL
✅ **Pros:**
- Production-ready
- Better performance
- Full SQL features
- Scalable

❌ **Cons:**
- Requires external database setup
- More complex initial setup

### Option 3: Separate Express Backend
✅ **Pros:**
- Complete separation
- Can use any tech stack
- Independent scaling

❌ **Cons:**
- More complex deployment
- Two repositories to manage

## Recommended Approach: Next.js API Routes + Prisma + SQLite/PostgreSQL

### Why This Approach?
1. ✅ Uses existing Next.js infrastructure
2. ✅ Prisma provides type-safe database access
3. ✅ Easy migration from SQLite (dev) to PostgreSQL (prod)
4. ✅ Works seamlessly with existing API client
5. ✅ Can import JSON data easily

## Implementation Plan

### Phase 1: Database Setup
1. Install Prisma and database dependencies
2. Set up Prisma schema based on existing types
3. Configure SQLite for development
4. Create migration scripts

### Phase 2: Data Migration
1. Create script to import JSON data into database
2. Validate data integrity
3. Set up indexes for performance

### Phase 3: API Routes
1. Create Next.js API routes (`app/api/*`)
2. Implement CRUD operations
3. Add filtering, pagination, search
4. Integrate with existing API client

### Phase 4: Authentication
1. Set up JWT authentication
2. Implement user sessions
3. Add role-based access control

### Phase 5: File Upload
1. Set up file storage (local/S3)
2. Implement image upload endpoints
3. Add file validation

## Database Schema (Prisma)

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  currency    String   @default("USD")
  images      String[]
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Company {
  id          String    @id @default(cuid())
  name        String
  description String
  logo        String?
  verified    Boolean   @default(false)
  goldSupplier Boolean  @default(false)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String
  password        String   // hashed
  role            String   // buyer, supplier, admin
  membershipTier  String?
  companyId       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model RFQ {
  id          String     @id @default(cuid())
  title       String
  description String
  buyerId     String
  buyer       User       @relation(fields: [buyerId], references: [id])
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  status      String     @default("open")
  responses   RFQResponse[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

## Migration Strategy

1. **Keep JSON files** as backup
2. **Create import script** to migrate data
3. **Validate** all data imported correctly
4. **Update API services** to use database instead of JSON
5. **Test** all endpoints work correctly

## Next Steps

1. Set up Prisma
2. Create database schema
3. Import JSON data
4. Create API routes
5. Update frontend to use real API

---

**Ready to proceed?** This will set up a production-ready backend that efficiently handles your migrated data.

