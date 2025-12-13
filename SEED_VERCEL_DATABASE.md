# How to Seed Vercel Database

## The Problem

**Vercel database is empty** - it has tables (from migrations) but no data.

Local database has:
- ✅ 28 products
- ✅ 14 categories  
- ✅ 13 blog posts
- ✅ 6 companies

Vercel database has:
- ❌ 0 products
- ❌ 0 categories
- ❌ 0 blog posts
- ❌ 0 companies

## Solution: Seed the Database

### Method 1: Via Vercel CLI (Recommended)

1. **Pull Vercel environment variables:**
   ```bash
   cd C:\Users\office\.cursor\pak-exporters
   vercel env pull .env.local
   ```

2. **Run seed script with Vercel environment:**
   ```bash
   # The .env.local file now has Vercel's DATABASE_URL
   npm run db:seed
   ```

   This will populate the Vercel database with data from JSON files.

3. **Verify:**
   ```bash
   npm run db:check-content
   ```

### Method 2: Create a One-Time Seed API Route

Create an API route that seeds the database (protected by a secret):

```typescript
// app/api/admin/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ... import seed logic

export async function POST(request: NextRequest) {
  // Check for secret token
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run seed logic
  // ...
  
  return NextResponse.json({ success: true, message: "Database seeded" });
}
```

Then call it once:
```bash
curl -X POST https://your-app.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_SECRET"
```

### Method 3: Via Vercel Dashboard SQL Editor

1. Go to Vercel Dashboard → Storage → Your Database
2. Click "SQL Editor" or "Query"
3. Manually insert data (not practical for large datasets)

## Quick Fix Command

```bash
# 1. Pull Vercel env vars
vercel env pull .env.local

# 2. Seed database
npm run db:seed

# 3. Verify
npm run db:check-content
```

## After Seeding

1. **Redeploy** (to clear any cached empty responses):
   ```bash
   vercel --prod --force
   ```

2. **Test API endpoints:**
   - `https://your-app.vercel.app/api/products` - Should return products
   - `https://your-app.vercel.app/api/categories` - Should return categories
   - `https://your-app.vercel.app/api/blog` - Should return blog posts

3. **Test pages:**
   - Products page should show products
   - Categories page should show categories
   - Blog page should show blog posts

## Why This Happens

- Migrations create tables (structure)
- Seeding populates tables (data)
- Vercel runs migrations automatically (if configured)
- But seeding must be done manually

## Prevention

Add seeding to your deployment process:
- Create a one-time seed script
- Or add it to post-deploy hook
- Or use Vercel's database seeding feature (if available)

