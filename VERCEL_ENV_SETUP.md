# Vercel Environment Variables Setup

## Quick Setup via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/dashboard
   - Select your project: `pak-exporters`

2. **Navigate to Settings**:
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add Required Variables**:

   Add these variables one by one:

   ### JWT_SECRET (Required)
   - **Key**: `JWT_SECRET`
   - **Value**: `ff67b4b678ab2c877029e03059d1c52a33bf43ec8f7f4b0b3d2619af5d915532`
   - **Environment**: Select `Production`, `Preview`, and `Development`
   - Click **Save**

   ### NEXT_PUBLIC_APP_URL (Required)
   - **Key**: `NEXT_PUBLIC_APP_URL`
   - **Value**: `https://pak-exporters.vercel.app` (or your actual Vercel URL after first deployment)
   - **Environment**: Select `Production`, `Preview`, and `Development`
   - Click **Save**

   ### DATABASE_URL (Optional for Preview)
   - **Key**: `DATABASE_URL`
   - **Value**: 
     - For preview/testing: You can skip this initially or use SQLite: `file:./dev.db`
     - For production: PostgreSQL connection string: `postgresql://user:pass@host:5432/dbname`
   - **Environment**: Select `Production`, `Preview`, and `Development`
   - Click **Save**

   ### NODE_ENV (Optional)
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Select `Production` only
   - Click **Save**

---

## Setup via CLI (Alternative)

If you prefer using CLI, run these commands:

```bash
# Set JWT_SECRET
echo ff67b4b678ab2c877029e03059d1c52a33bf43ec8f7f4b0b3d2619af5d915532 | vercel env add JWT_SECRET production

# Set NEXT_PUBLIC_APP_URL (update with your actual URL after deployment)
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, enter: https://pak-exporters.vercel.app

# Set DATABASE_URL (optional - skip for initial preview)
vercel env add DATABASE_URL production
# When prompted, enter your database URL or skip for now
```

**Note**: After adding variables, you need to redeploy:
```bash
vercel --prod
```

---

## After Setting Environment Variables

1. **Redeploy** your application:
   ```bash
   vercel --prod
   ```

2. **Or trigger redeploy** from Vercel Dashboard:
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment

---

## Important Notes

- ✅ Environment variables are encrypted in Vercel
- ✅ You can set different values for Production, Preview, and Development
- ✅ Changes require a new deployment to take effect
- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ Secrets should never be committed to git

---

## For Initial Preview Deployment

For a quick preview without database:
1. Set `JWT_SECRET` (required)
2. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL (after first deployment)
3. Skip `DATABASE_URL` initially if your app can work without it
4. Deploy and test
5. Add database later if needed

---

## Getting Your Vercel URL

After your first deployment, you'll get a URL like:
- Preview: `https://pak-exporters-abc123.vercel.app`
- Production: `https://pak-exporters.vercel.app` (if you set a custom domain)

Use this URL for `NEXT_PUBLIC_APP_URL`.

