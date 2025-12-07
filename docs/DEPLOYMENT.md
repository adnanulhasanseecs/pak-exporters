# Deployment Guide

> **Note:** For detailed production deployment instructions, see [DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md)

## Quick Start

## Overview

This guide covers deploying the Pak-Exporters B2B Marketplace to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (recommended) or other hosting provider
- Domain name (optional)
- Environment variables configured

---

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NEXT_PUBLIC_APP_URL=https://pak-exporters.com
NODE_ENV=production

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Error Tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# API (when backend is ready)
NEXT_PUBLIC_API_URL=https://api.pak-exporters.com
```

---

## Deployment Options

You have several options for deploying your Next.js application:

### Option 1: Vercel (Recommended for Next.js)

**Pros:**
- Optimized for Next.js
- Zero configuration
- Automatic deployments from GitHub
- Free tier available
- Edge network for fast performance

**Cons:**
- Platform-specific (Vercel only)
- Limited customization on free tier

**Setup:**
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js
3. Configure environment variables in Vercel dashboard
4. Deployments happen automatically on push to main branch

**Note:** Vercel is optional. You can use any hosting provider.

### Option 2: Self-Hosted (VPS/Cloud Server)

**Pros:**
- Full control
- Can use any server (AWS, DigitalOcean, etc.)
- No platform lock-in
- Custom configurations

**Cons:**
- Requires server management
- Need to set up CI/CD yourself
- SSL certificate management

**Setup:** See "Manual Build & Deploy" section below.

### Option 3: Other Platforms

- **Netlify** - Similar to Vercel, good Next.js support
- **Railway** - Simple deployment, good for full-stack apps
- **Render** - Easy deployment, free tier available
- **AWS Amplify** - AWS ecosystem integration
- **Cloudflare Pages** - Fast CDN, good performance

**All platforms work with GitHub for automatic deployments.**

---

## Manual Build & Deploy

### Step 1: Build the Application

```bash
npm run build
```

### Step 2: Test the Build

```bash
npm start
```

Visit `http://localhost:3000` to verify the build works.

### Step 3: Deploy

Copy the `.next` folder and other required files to your server:

```bash
# Required files/folders:
- .next/
- public/
- package.json
- package-lock.json
- node_modules/ (or run npm install on server)
- .env.production
```

### Step 4: Start the Server

```bash
npm start
```

Or use PM2 for process management:

```bash
pm2 start npm --name "pak-exporters" -- start
```

---

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Build Docker Image

```bash
docker build -t pak-exporters .
```

### Step 3: Run Container

```bash
docker run -p 3000:3000 --env-file .env.production pak-exporters
```

---

## CI/CD Pipeline (GitHub Actions)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **Runs on every push** to main/master branch
2. **Lints and tests** the code
3. **Builds** the application
4. **Deploys** (if configured with deployment platform)

### GitHub Actions Only (No Auto-Deploy)

If you want to use GitHub Actions only for CI (testing/linting) without auto-deployment:

The workflow will:
- ✅ Run linter
- ✅ Run type check
- ✅ Run tests
- ✅ Build the application
- ❌ Skip deployment (unless you configure it)

This is useful if you:
- Want to deploy manually
- Use a different deployment platform
- Deploy from your local machine
- Use a different CI/CD service

### Configure Auto-Deployment

To enable auto-deployment, you need to:

1. **For Vercel:** Connect GitHub repo to Vercel (Vercel handles this automatically)
2. **For other platforms:** Add deployment secrets to GitHub Actions
3. **For self-hosted:** Set up SSH keys and deployment scripts

**You can use GitHub for code hosting and any deployment platform you prefer.**

---

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Forms submit successfully
- [ ] Images load properly
- [ ] Mobile responsive
- [ ] Fast page loads

### 2. Security

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] API keys protected
- [ ] CSP headers working

### 3. Performance

- [ ] Lighthouse score ≥90
- [ ] Images optimized
- [ ] Bundle size optimized
- [ ] Caching working
- [ ] CDN configured (if applicable)

### 4. Monitoring

- [ ] Analytics tracking active
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring set up

### 5. SEO

- [ ] Sitemap submitted to Google
- [ ] robots.txt configured
- [ ] Meta tags verified
- [ ] Structured data validated

---

## Troubleshooting

### Build Errors

1. Check Node.js version (requires 18+)
2. Clear `.next` folder and rebuild
3. Check for TypeScript errors
4. Verify all dependencies installed

### Runtime Errors

1. Check environment variables
2. Verify API endpoints (if backend connected)
3. Check browser console for errors
4. Review server logs

### Performance Issues

1. Enable compression
2. Optimize images
3. Check bundle size
4. Review caching strategy

---

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual

1. Revert to previous Git commit
2. Rebuild and redeploy
3. Restore database backup (if applicable)

---

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review security advisories
- Monitor performance metrics
- Backup data regularly
- Review error logs

### Updates

```bash
# Update dependencies
npm update

# Test locally
npm run build
npm start

# Deploy
vercel --prod
```

---

**Last Updated:** 2025-01-XX

