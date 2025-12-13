# Vercel CLI Quick Reference

## ✅ Vercel CLI is Already Installed

Your system has Vercel CLI version 50.0.0 installed.

## Basic Commands

### 1. Login to Vercel
```bash
vercel login
```
- Opens browser to authenticate
- Only needed once

### 2. Check Login Status
```bash
vercel whoami
```
- Shows your current Vercel account

### 3. Link to Existing Project
```bash
cd C:\Users\office\.cursor\pak-exporters
vercel link
```
- Links your local project to Vercel project
- Prompts for project selection

## Environment Variables via CLI

### View All Environment Variables
```bash
vercel env ls
```
- Lists all environment variables for your project

### Add Environment Variable
```bash
# Interactive mode (recommended)
vercel env add DATABASE_URL

# Non-interactive mode
echo "your-value" | vercel env add DATABASE_URL production
```

**For each variable, you'll be prompted:**
1. **Value**: Enter the actual value
2. **Environment**: Select `Production`, `Preview`, or `Development`
   - Type `p` for Production
   - Type `r` for Preview  
   - Type `d` for Development
   - Type `a` for All

### Remove Environment Variable
```bash
vercel env rm DATABASE_URL
```
- Prompts which environment to remove from

### Pull Environment Variables (Local Development)
```bash
vercel env pull .env.local
```
- Downloads environment variables to `.env.local`
- Useful for local development

## Deployment Commands

### Deploy Preview
```bash
vercel
```
- Creates a preview deployment
- Asks for confirmation

### Deploy Production
```bash
vercel --prod
```
- Deploys to production
- Requires confirmation

### Force Fresh Deployment (Clear Cache)
```bash
vercel --force
# Or for production
vercel --prod --force
```
- Forces rebuild without cache
- **Use this to clear build cache!**

### List Deployments
```bash
vercel ls
```
- Shows all deployments

### View Deployment Logs
```bash
vercel logs [deployment-url]
```
- Shows logs for a specific deployment

### View Real-time Logs
```bash
vercel logs --follow
```
- Streams logs in real-time

## Quick Fix: Clear Cache and Redeploy

```bash
# 1. Navigate to project
cd C:\Users\office\.cursor\pak-exporters

# 2. Force fresh deployment (clears cache)
vercel --prod --force

# Or for preview
vercel --force
```

## Quick Fix: Update Environment Variables

```bash
# 1. Remove old DATABASE_URL (if it has localhost)
vercel env rm DATABASE_URL
# Select which environment(s) to remove from

# 2. Add correct DATABASE_URL
vercel env add DATABASE_URL
# When prompted:
# - Value: postgres://c60be7b693fa64fbb4f9ec6082fe71e7b6384b23fc9775c9594a181585ae58fc:sk_C5nusuBSNkYg9tPy5yjr4@db.prisma.io:5432/postgres?sslmode=require
# - Environment: Type 'a' for All (Production, Preview, Development)

# 3. Add DATABASE_PRISMA_DATABASE_URL
vercel env add DATABASE_PRISMA_DATABASE_URL
# Value: prisma+postgres://accelerate.prisma-data.net/?api_key=...
# Environment: Type 'a' for All

# 4. Redeploy with cleared cache
vercel --prod --force
```

## Useful Commands for Your Issue

### Check Current Environment Variables
```bash
vercel env ls
```
- See all variables and their environments

### Verify Project Link
```bash
vercel link
```
- Ensures project is linked correctly

### Get Project Info
```bash
vercel inspect
```
- Shows project details and settings

## Common Issues

### "Not authenticated"
```bash
vercel login
```

### "Project not found"
```bash
vercel link
# Select your project: pak-exporters
```

### "Command not found"
- Vercel CLI is installed, but if you get this error:
```bash
npm i -g vercel
```

## Full Help
```bash
vercel --help
# Or for specific command
vercel env --help
vercel deploy --help
```

