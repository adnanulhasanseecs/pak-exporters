# How to Check Database Connection Logs on Vercel

## Step 1: Access Vercel Function Logs

### Option A: Via Deployment Page (Easiest Method)

1. **On the Deployment Details Page** (where you are now)
   - Scroll down past the preview image
   - Look for expandable sections like:
     - **Build Logs** (yellow warning icon)
     - **Deployment Summary**
     - **Functions** ← **This is what you need!**

2. **If "Functions" section is not visible:**
   - Click on **"Build Logs"** section first (expand it)
   - After that, scroll down more - "Functions" should appear below
   - OR look for tabs at the top: **Overview**, **Functions**, **Logs**, etc.

3. **Alternative: Access via Project Overview**
   - Go back to your project main page (click "pak-exporters" in breadcrumb)
   - Click **"Logs"** tab in the top navigation
   - This shows all function logs across all deployments

### Option B: Via Vercel Dashboard Navigation

1. **Go to Project Main Page**
   - Click on **"pak-exporters"** project name (top left)
   - Or go to: https://vercel.com/dashboard → Select `pak-exporters`

2. **Click "Logs" Tab**
   - In the top navigation bar, click **"Logs"**
   - This shows real-time function logs
   - Filter by function name (e.g., `api/products`)

3. **Or Click "Deployments" Tab**
   - Click **"Deployments"** in left sidebar
   - Click on latest deployment
   - Look for **"Functions"** section or tab

### Option B: Via Vercel CLI

```bash
# View logs for a specific deployment
vercel logs [deployment-url]

# View real-time logs
vercel logs --follow
```

---

## Step 2: What Logs to Look For

### ✅ **Correct Connection (What You Should See)**

Look for these log messages in order:

#### 1. Prisma Initialization Logs
```
[Prisma Init] Set process.env.DATABASE_URL to Prisma Accelerate connection
[Prisma Init] Environment check: {
  DATABASE_PRISMA_DATABASE_URL: ✅ Set,
  DATABASE_URL: ✅ Set,
  NODE_ENV: production
}
```

#### 2. Connection String Log
```
🔌 [Prisma Init] Will connect to: prisma+postgres://accelerate.prisma-data.net:default
```
OR
```
🔌 [Prisma Init] Will connect to: postgres://db.prisma.io:5432
```

**✅ Good signs:**
- Shows `accelerate.prisma-data.net` (Prisma Accelerate)
- OR shows `db.prisma.io:5432` (Vercel Postgres)
- **NOT** `localhost:5433` ❌

#### 3. Prisma Client Creation
```
✅ [Prisma Init] PrismaClient created with connection override
   Override URL host: accelerate.prisma-data.net:default
```

#### 4. API Route Connection Test
```
[API] Testing database connection to: accelerate.prisma-data.net:default
[API] Database connection successful
```

#### 5. Successful Query
```
[API] Found X products in database
```

---

### ❌ **Incorrect Connection (What You Should NOT See)**

#### 1. Localhost Warning
```
❌ [Prisma Init] WARNING: Connection string points to localhost!
   Host: localhost, Port: 5433
   This will NOT work on Vercel. Check environment variables.
```

#### 2. Connection Error
```
[API] Database connection failed: {
  message: "Can't reach database server at `localhost:5433`",
  code: "P1001"
}
```

#### 3. Missing Environment Variables
```
❌ [Prisma Init] DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set
   Available env vars: none
```

---

## Step 3: Where to Check in Logs

### Build Logs (During Deployment)

1. Go to **Deployments** → Click latest deployment
2. Click **Build Logs** tab
3. Look for:
   ```
   Running "npm run prebuild"
   Running "prisma generate --no-engine"
   ```

**What to check:**
- ✅ No errors about missing `DATABASE_URL`
- ✅ Prisma client generates successfully
- ❌ No warnings about `localhost:5433`

### Runtime Logs (After Deployment)

**Method 1: Via Deployment Page**
1. On the deployment details page, scroll down
2. Expand **"Functions"** section (if visible)
3. Click on a function name (e.g., `api/products/route.ts`)
4. Look for the logs we mentioned above

**Method 2: Via Project Logs (Easier)**
1. Go to project main page (click "pak-exporters")
2. Click **"Logs"** tab in top navigation
3. You'll see all function logs in real-time
4. Filter or search for `[Prisma Init]` or `[API]`

**Method 3: Trigger Function and Check Logs**
1. Visit your API endpoint: `https://pak-exporters.vercel.app/api/products`
2. Go back to Vercel Dashboard → Project → **Logs** tab
3. You'll see the logs from that request appear

**What to check:**
- ✅ Connection string shows correct host (not localhost)
- ✅ Database connection successful
- ✅ API returns data (not errors)

---

## Step 4: Test the Connection

### Option A: Visit API Endpoint Directly

1. **Open your deployment URL:**
   ```
   https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
   ```

2. **Check the response:**
   - ✅ **Success**: Returns JSON with products array
   - ❌ **Error**: Returns `{"error": "Database connection failed", "message": "Can't reach database server at localhost:5433"}`

### Option B: Check Function Logs After Request

1. Visit the API endpoint (triggers the function)
2. Go back to Vercel Dashboard
3. Check **Function Logs** for that request
4. Look for the connection logs we mentioned

---

## Step 5: Quick Diagnostic Checklist

### ✅ All Good If You See:
- [ ] `[Prisma Init] Set process.env.DATABASE_URL to Prisma Accelerate connection`
- [ ] `🔌 [Prisma Init] Will connect to: accelerate.prisma-data.net` (NOT localhost)
- [ ] `[API] Database connection successful`
- [ ] API endpoint returns data (not error)

### ❌ Problem If You See:
- [ ] `localhost:5433` anywhere in the logs
- [ ] `WARNING: Connection string points to localhost!`
- [ ] `Can't reach database server at localhost:5433`
- [ ] `DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set`

---

## Step 6: If You See localhost:5433

### Check Environment Variables in Vercel

1. Go to **Settings** → **Environment Variables**
2. Click the **eye icon** 👁️ next to `DATABASE_URL`
3. **If it shows `localhost:5433`:**
   - Click **Edit** (or delete and recreate)
   - Set to: `postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require`
   - Save and **redeploy**

### Check for Multiple DATABASE_URL Variables

Make sure you don't have:
- `DATABASE_URL` set to localhost
- `DATABASE_POSTGRES_URL` conflicting
- Multiple environment variables with different values

---

## Example: Good Logs vs Bad Logs

### ✅ Good Logs (Correct Connection)
```
[Prisma Init] Set process.env.DATABASE_URL to Prisma Accelerate connection
[Prisma Init] Environment check: {
  DATABASE_PRISMA_DATABASE_URL: ✅ Set,
  DATABASE_URL: ✅ Set,
  NODE_ENV: production
}
🔌 [Prisma Init] Will connect to: prisma+postgres://accelerate.prisma-data.net:default
✅ [Prisma Init] PrismaClient created with connection override
   Override URL host: accelerate.prisma-data.net:default
[API] Testing database connection to: accelerate.prisma-data.net:default
[API] Database connection successful
[API] Found 50 products in database
```

### ❌ Bad Logs (Incorrect Connection)
```
[Prisma Init] Environment check: {
  DATABASE_PRISMA_DATABASE_URL: ❌ NOT set,
  DATABASE_URL: ✅ Set,
  NODE_ENV: production
}
❌ [Prisma Init] WARNING: Connection string points to localhost!
   Host: localhost, Port: 5433
   This will NOT work on Vercel. Check environment variables.
[API] Testing database connection to: localhost:5433
[API] Database connection failed: {
  message: "Can't reach database server at `localhost:5433`",
  code: "P1001"
}
```

---

## Quick Test Command

After deployment, test the API endpoint:

```bash
curl https://your-deployment-url.vercel.app/api/products
```

**Expected response:**
```json
{
  "products": [...],
  "pagination": {...}
}
```

**If you get an error:**
```json
{
  "error": "Database connection failed",
  "message": "Can't reach database server at `localhost:5433`"
}
```

Then check the logs as described above.

---

## Summary

**To confirm correct DB connection, check:**

1. **Function Logs** in Vercel Dashboard
2. Look for `[Prisma Init]` logs showing connection string
3. **Verify** it shows `accelerate.prisma-data.net` or `db.prisma.io` (NOT `localhost:5433`)
4. **Check** `[API] Database connection successful` message
5. **Test** API endpoint returns data (not error)

If you see `localhost:5433` anywhere, the environment variables in Vercel are incorrect and need to be updated.

