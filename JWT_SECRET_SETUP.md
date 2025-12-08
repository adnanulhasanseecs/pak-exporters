# JWT_SECRET Setup Guide

## Quick Fix

The `JWT_SECRET` environment variable is required for authentication features. Here's how to add it:

### Option 1: Use the Setup Script (Recommended)

Run the automated setup script:

```bash
npm run setup:env
```

This will:
- Create a `.env` file if it doesn't exist
- Generate a secure JWT_SECRET automatically
- Add all required environment variables

### Option 2: Manual Setup

1. **Create or edit `.env` file** in the project root

2. **Add the following line:**

```env
JWT_SECRET=your-secret-key-here-min-32-chars-for-production
```

3. **Generate a secure secret** using one of these methods:

**Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Using PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Using OpenSSL:**
```bash
openssl rand -hex 32
```

4. **Copy the generated secret** and paste it in your `.env` file:

```env
JWT_SECRET=b4598a3bab3415cfffe93ce83d61d554c9d879671430e323ae367a37f6dca444
```

### Complete .env File Example

```env
# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# JWT Secret (Required for authentication)
JWT_SECRET=b4598a3bab3415cfffe93ce83d61d554c9d879671430e323ae367a37f6dca444

# JWT Token Expiration (Optional, defaults to 7d)
JWT_EXPIRES_IN=7d
```

## Important Notes

1. **Never commit `.env` to version control** - it's already in `.gitignore`
2. **Use different secrets** for development and production
3. **Minimum 32 characters** required for production
4. **Keep secrets secure** - don't share them publicly

## Verification

After adding `JWT_SECRET` to your `.env` file:

1. **Restart your dev server** if it's running:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

2. **The error should be resolved** - authentication features will now work

## Troubleshooting

### Error: "JWT_SECRET is not configured"
- Make sure `.env` file exists in the project root
- Check that `JWT_SECRET=` line is present (no quotes needed)
- Restart the dev server after adding the variable

### Error: "JWT_SECRET must be at least 32 characters"
- Generate a new secret using one of the methods above
- Make sure the secret is at least 32 characters long

### Still having issues?
- Check that `.env` file is in the project root (same directory as `package.json`)
- Verify the file doesn't have syntax errors
- Make sure there are no extra spaces around the `=` sign

