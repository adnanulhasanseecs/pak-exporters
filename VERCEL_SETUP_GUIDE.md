# Vercel Free Tier Setup Guide

Step-by-step guide to deploy your Pak-Exporters website to Vercel.

## ✅ Step 1: Vercel CLI Installed

Vercel CLI has been installed globally. ✓

## 🔐 Step 2: Login to Vercel

Run this command in your terminal:

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to sign up/login to Vercel (if you don't have an account)
3. Authorize the CLI

**Note:** If you don't have a Vercel account, you can sign up for free at [vercel.com](https://vercel.com)

---

## 🚀 Step 3: Initialize and Deploy

Once logged in, run:

```bash
vercel
```

You'll be prompted with:
1. **Set up and deploy?** → Type `Y` and press Enter
2. **Which scope?** → Select your account/team
3. **Link to existing project?** → Type `N` (for first time)
4. **Project name?** → Press Enter to use default (`pak-exporters`)
5. **Directory?** → Press Enter (uses current directory)
6. **Override settings?** → Type `N` (we already have `vercel.json`)

This will:
- Create a preview deployment
- Give you a URL like: `https://pak-exporters-abc123.vercel.app`

---

## 🔧 Step 4: Set Environment Variables

After first deployment, set up environment variables:

```bash
# Set DATABASE_URL (if using database)
vercel env add DATABASE_URL

# Set JWT_SECRET
vercel env add JWT_SECRET

# Set NEXT_PUBLIC_APP_URL (will be your Vercel URL)
vercel env add NEXT_PUBLIC_APP_URL
```

For each variable:
- **Value:** Enter the actual value
- **Environment:** Select `Production`, `Preview`, and `Development` (or just `Production`)

### Quick Environment Variable Setup

You can also set them via Vercel Dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable

---

## 🌐 Step 5: Production Deployment

For production deployment:

```bash
vercel --prod
```

Or connect GitHub for automatic deployments:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure environment variables
5. Deploy!

---

## 📋 Required Environment Variables

Make sure to set these in Vercel:

```env
# Required
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://... (if using database)
JWT_SECRET=your-secure-random-string-32-plus-chars

# Optional
NODE_ENV=production
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🔄 Automatic Deployments (Recommended)

To enable automatic deployments on every push:

1. **Connect GitHub**:
   - Go to Vercel Dashboard
   - Click **Add New Project**
   - Select your GitHub repository
   - Click **Import**

2. **Configure**:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Set Environment Variables** (same as Step 4)

4. **Deploy**:
   - Every push to `main` branch = Production deployment
   - Every push to other branches = Preview deployment
   - Every Pull Request = Preview deployment

---

## 🎯 Vercel Free Tier Limits

The free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ 100 serverless function executions/day
- ✅ Preview deployments for all branches/PRs
- ✅ Custom domains (1 free)
- ✅ SSL certificates (automatic)
- ✅ Edge Network (global CDN)

**Note:** Free tier is perfect for client review and small to medium projects.

---

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel Dashboard
2. **Test build locally first**:
   ```bash
   npm run build
   ```
3. **Check environment variables** are set correctly

### Database Connection Issues

- Make sure `DATABASE_URL` is set in Vercel
- For production, use PostgreSQL (not SQLite)
- Consider Vercel Postgres (add in Vercel Dashboard → Storage)

### Environment Variables Not Working

- Make sure variables are set for correct environment (Production/Preview/Development)
- Redeploy after adding new variables:
  ```bash
  vercel --prod
  ```

---

## 📚 Useful Commands

```bash
# Login
vercel login

# Deploy preview
vercel

# Deploy production
vercel --prod

# List deployments
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Link to existing project
vercel link
```

---

## 🎉 Next Steps

After deployment:
1. ✅ Share the preview URL with your client
2. ✅ Test all functionality
3. ✅ Set up custom domain (optional)
4. ✅ Configure automatic deployments from GitHub
5. ✅ Monitor performance in Vercel Dashboard

---

**Need Help?** Check [Vercel Documentation](https://vercel.com/docs) or [Vercel Support](https://vercel.com/support)

