# Client Review Deployment Options

Complete guide for making your Pak-Exporters website accessible for client review.

## 🚀 Quick Decision Matrix

| Option | Speed | Cost | Best For | Setup Time |
|--------|-------|------|----------|------------|
| **Vercel Preview** | ⚡ Fastest | Free | Quick client review | 5 min |
| **ngrok/LocalTunnel** | ⚡ Fast | Free | Testing with local data | 2 min |
| **Vercel Production** | Fast | Free/Paid | Final client review | 15 min |
| **Netlify** | Fast | Free | Alternative to Vercel | 15 min |
| **Railway** | Medium | Free trial | Full-stack with DB | 20 min |
| **Render** | Medium | Free tier | Simple deployment | 20 min |

---

## Option 1: Vercel Preview Deployment (Recommended ⭐)

**Best for:** Quick client review with professional URL

### Pros
- ✅ Free tier available
- ✅ Professional HTTPS URL (e.g., `pak-exporters-xyz.vercel.app`)
- ✅ Automatic deployments
- ✅ Fast global CDN
- ✅ Already configured (`vercel.json` exists)
- ✅ Preview URLs for each branch/PR

### Cons
- ⚠️ Preview URLs expire after inactivity (can be extended)
- ⚠️ Free tier has build time limits

### Quick Setup (5 minutes)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy Preview**:
   ```bash
   vercel
   ```
   - Follow prompts (use defaults)
   - You'll get a preview URL like: `https://pak-exporters-abc123.vercel.app`

4. **Set Environment Variables** (if needed):
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. **Share the URL** with your client!

### For Production Deployment

1. **Connect GitHub** (recommended):
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in dashboard
   - Auto-deploys on every push to `main`

2. **Or use CLI for production**:
   ```bash
   vercel --prod
   ```

---

## Option 2: ngrok / LocalTunnel (Fastest for Testing)

**Best for:** Testing with local database/data, immediate access

### Pros
- ✅ Instant setup (2 minutes)
- ✅ Works with local development server
- ✅ Free tier available
- ✅ No code changes needed

### Cons
- ⚠️ URL changes each time (unless paid plan)
- ⚠️ Requires your computer to be running
- ⚠️ Less professional appearance

### Setup with ngrok

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or via npm:
   npm i -g ngrok
   ```

2. **Start your dev server**:
   ```bash
   npm run dev
   ```

3. **Create tunnel**:
   ```bash
   ngrok http 3001
   ```

4. **Share the ngrok URL** (e.g., `https://abc123.ngrok.io`)

### Setup with LocalTunnel (Alternative)

1. **Install**:
   ```bash
   npm i -g localtunnel
   ```

2. **Start tunnel**:
   ```bash
   lt --port 3001
   ```

3. **Share the provided URL**

---

## Option 3: Netlify Deployment

**Best for:** Alternative to Vercel, similar features

### Pros
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Good Next.js support
- ✅ Preview deployments

### Cons
- ⚠️ Slightly slower than Vercel for Next.js
- ⚠️ Less optimized for Next.js edge features

### Setup

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy
   # For production:
   netlify deploy --prod
   ```

4. **Or connect via GitHub**:
   - Go to [netlify.com](https://netlify.com)
   - Import repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

---

## Option 4: Railway (Full-Stack with Database)

**Best for:** When you need database access, full-stack deployment

### Pros
- ✅ Includes PostgreSQL database
- ✅ Free trial ($5 credit)
- ✅ Simple deployment
- ✅ Good for production

### Cons
- ⚠️ Requires credit card (free trial)
- ⚠️ Costs after trial

### Setup

1. **Sign up** at [railway.app](https://railway.app)

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"

3. **Add PostgreSQL**:
   - Click "+ New"
   - Select "PostgreSQL"
   - Copy connection string

4. **Configure environment variables**:
   ```
   DATABASE_URL=<railway-postgres-url>
   JWT_SECRET=<your-secret>
   NEXT_PUBLIC_APP_URL=<railway-app-url>
   ```

5. **Deploy** - Railway auto-deploys on push

---

## Option 5: Render

**Best for:** Simple, straightforward deployment

### Pros
- ✅ Free tier available
- ✅ Simple setup
- ✅ PostgreSQL available
- ✅ Auto-deploy from GitHub

### Cons
- ⚠️ Free tier spins down after inactivity
- ⚠️ Slower cold starts on free tier

### Setup

1. **Sign up** at [render.com](https://render.com)

2. **Create Web Service**:
   - Connect GitHub repository
   - Build command: `npm run build`
   - Start command: `npm start`
   - Environment: `Node`

3. **Add PostgreSQL** (if needed):
   - Create new PostgreSQL database
   - Copy connection string

4. **Set environment variables** in dashboard

5. **Deploy** - Auto-deploys on push

---

## Option 6: Self-Hosted (VPS/Cloud)

**Best for:** Full control, custom domain, production-ready

### Options
- **DigitalOcean** ($6/month droplet)
- **AWS EC2** (pay-as-you-go)
- **Google Cloud Platform**
- **Azure**
- **Linode** / **Vultr**

### Quick Setup (DigitalOcean Example)

1. **Create Droplet** (Ubuntu 22.04)

2. **SSH into server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Clone repository**:
   ```bash
   git clone <your-repo-url>
   cd pak-exporters
   npm install
   ```

5. **Set up environment**:
   ```bash
   cp .env.example .env.production
   nano .env.production  # Edit with production values
   ```

6. **Build and start**:
   ```bash
   npm run build
   npm start
   ```

7. **Set up PM2** (process manager):
   ```bash
   npm i -g pm2
   pm2 start npm --name "pak-exporters" -- start
   pm2 save
   pm2 startup
   ```

8. **Set up Nginx** (reverse proxy):
   ```bash
   sudo apt install nginx
   # Configure nginx (see below)
   ```

9. **Set up SSL** (Let's Encrypt):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 📋 Pre-Deployment Checklist

Before deploying for client review:

- [ ] **Build succeeds locally**:
  ```bash
  npm run build
  ```

- [ ] **Environment variables ready**:
  - `NEXT_PUBLIC_APP_URL` - Your deployment URL
  - `DATABASE_URL` - Database connection (if using DB)
  - `JWT_SECRET` - Random secure string (32+ chars)

- [ ] **Test production build locally**:
  ```bash
  npm run build
  npm start
  # Visit http://localhost:3001
  ```

- [ ] **Check for errors**:
  ```bash
  npm run lint
  npm run type-check
  ```

---

## 🔧 Required Environment Variables

Create these in your deployment platform:

```env
# Required
NEXT_PUBLIC_APP_URL=https://your-deployment-url.com
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-very-secure-random-string-min-32-chars

# Optional
NODE_ENV=production
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🎯 Recommended Approach

### For Quick Client Review (Today)
1. **Use Vercel Preview** (`vercel` command)
   - Fastest professional option
   - 5-minute setup
   - Share preview URL immediately

### For Final Client Review
1. **Use Vercel Production** (connect GitHub)
   - Professional domain/subdomain
   - Auto-deploys on updates
   - Best performance for Next.js

### For Production Launch
1. **Use Vercel** (if budget allows)
   - OR **Railway** (if you need included database)
   - OR **Self-hosted** (if you need full control)

---

## 🚨 Important Notes

1. **Database**: If using SQLite locally, switch to PostgreSQL for production
2. **Environment Variables**: Never commit `.env` files
3. **Build Time**: First build may take 5-10 minutes
4. **Domain**: Free tiers provide subdomains; custom domains available on paid plans
5. **SSL**: All recommended platforms provide free SSL certificates

---

## 📞 Need Help?

If you encounter issues:
1. Check build logs in deployment platform
2. Verify environment variables are set
3. Test build locally first: `npm run build`
4. Check deployment platform documentation

---

**Last Updated:** 2025-01-XX

