# How to Find Vercel Function Logs

## Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: **pak-exporters**

2. **Navigate to Functions:**
   - Click **Functions** tab (in the top navigation bar, next to Deployments, Settings, etc.)
   - You should see a list of all API routes

3. **View Logs for Specific Function:**
   - Click on `/api/products` (or any function)
   - You'll see:
     - **Overview** tab - Function details
     - **Logs** tab - Real-time and historical logs
     - **Invocations** tab - Individual request logs

4. **Check Logs Tab:**
   - Click **Logs** tab
   - You'll see console.log outputs, errors, and function execution logs
   - Look for: `🔌 Prisma connecting to: ...` or `[API] Testing database connection to: ...`

## Method 2: Via Deployments Tab

1. **Go to Deployments:**
   - Click **Deployments** tab
   - Click on a specific deployment

2. **View Function Logs:**
   - Scroll down to see function invocations
   - Click on a function invocation to see its logs
   - Or click **View Function Logs** button

## Method 3: Via Vercel CLI

If you have Vercel CLI installed:

```bash
# View logs for a specific deployment
vercel logs [deployment-url]

# Or view logs in real-time
vercel logs --follow
```

## What to Look For in Logs

After the recent changes, you should see:

1. **Prisma Connection Logs:**
   ```
   🔌 Prisma connecting to: accelerate.prisma-data.net:default
   ```
   or
   ```
   🔌 Prisma connecting to: db.prisma.io:5432
   ```
   **NOT** `localhost:5433`

2. **API Connection Attempts:**
   ```
   [API] Testing database connection to: accelerate.prisma-data.net:default
   ```

3. **Errors:**
   - If you see `localhost:5433` → Prisma client was generated with wrong connection string
   - If you see connection errors → Database might not be accessible

## If You Can't Find Functions Tab

If the **Functions** tab is not visible:

1. **Check if you're on the right project**
2. **Make sure you have the correct permissions** (owner or member)
3. **Try refreshing the page**
4. **Check if functions are actually deployed** - Go to Deployments → Click on a deployment → Scroll down to see functions

## Alternative: Check Build Logs

If you can't find function logs, check build logs:

1. **Deployments** tab → Click on a deployment
2. **Build Logs** section
3. Look for:
   - `prisma generate` step
   - Any errors during Prisma generation
   - Environment variable availability

## Still Can't Find Logs?

1. **Check Vercel Dashboard URL:**
   - Make sure you're at: `https://vercel.com/[your-team]/pak-exporters`
   - Not a preview deployment URL

2. **Try accessing logs via API route directly:**
   - Visit: https://pak-exporters-l6jmeoyt6-adnanulhassan-9470s-projects.vercel.app/api/products
   - Then immediately check Functions tab - the invocation should appear

3. **Check if logs are enabled:**
   - Some Vercel plans have log retention limits
   - Free tier has limited log retention

