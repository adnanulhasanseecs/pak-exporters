# PostgreSQL Migration Guide

## Why PostgreSQL?

✅ **PostgreSQL is the correct choice** for this project because:
1. **Vector DB Compatibility**: Supports `pgvector` extension for AI/ML features
2. **Production Ready**: Better for production deployments
3. **Advanced Features**: Full-text search, JSON support, case-insensitive queries
4. **Scalability**: Better performance and scalability than SQLite
5. **Deployment**: Works seamlessly with Vercel Postgres, Supabase, Railway, etc.

## Migration Steps

### 1. Update Prisma Schema ✅

The schema has been updated to use PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Update DATABASE_URL in .env

**For Local Development:**
```env
# Option 1: Local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/pak_exporters?schema=public"

# Option 2: Docker PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pak_exporters?schema=public"
```

**For Production (Vercel):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"
```

### 3. Install PostgreSQL

#### Option A: Local Installation

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Option B: Docker (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name pak-exporters-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pak_exporters \
  -p 5432:5432 \
  -d postgres:15

# Or use docker-compose (create docker-compose.yml)
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pak_exporters
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then run:
```bash
docker-compose up -d
```

### 4. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pak_exporters;

# Create user (optional)
CREATE USER pak_exporters_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pak_exporters TO pak_exporters_user;

# Exit
\q
```

### 5. Update .env File

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pak_exporters?schema=public"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# JWT Secret
JWT_SECRET=0246b594d2a8abd72a2be46446998a8b029c53c57329beb26863c21ab9ebf79e
```

### 6. Generate Prisma Client

```bash
npm run db:generate
```

### 7. Run Migrations

```bash
# Create initial migration
npm run db:migrate

# This will:
# 1. Create migration files
# 2. Apply migrations to database
# 3. Generate Prisma client
```

### 8. Seed Database

```bash
npm run db:seed
```

### 9. Verify Connection

```bash
# Open Prisma Studio to verify
npm run db:studio
```

## Features Now Available

### ✅ Case-Insensitive Search
PostgreSQL supports `mode: "insensitive"` in Prisma queries:
```typescript
where.name = { contains: searchTerm, mode: "insensitive" }
```

### ✅ Full-Text Search
PostgreSQL has built-in full-text search capabilities.

### ✅ JSON Support
Better JSON field support for complex data structures.

### ✅ Vector Database (pgvector)
When ready, you can add the `pgvector` extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Production Deployment

### Vercel Postgres

1. **Add Postgres Database**
   - Go to Vercel Dashboard → Project → Storage
   - Click "Create Database" → Select "Postgres"
   - Choose region and create

2. **Get Connection String**
   - Copy `POSTGRES_PRISMA_URL` or `POSTGRES_URL_NON_POOLING`
   - Add to Vercel environment variables as `DATABASE_URL`

3. **Run Migrations**
   ```bash
   # In Vercel, migrations run automatically on deploy
   # Or manually:
   vercel env pull .env.production
   npm run db:migrate
   ```

### Supabase

1. Create project at https://supabase.com
2. Get connection string from Settings → Database
3. Update `DATABASE_URL` in environment variables
4. Run migrations

### Railway

1. Create PostgreSQL service in Railway
2. Get connection string from service settings
3. Update `DATABASE_URL` in environment variables
4. Run migrations

## Troubleshooting

### Connection Error
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# Linux/macOS:
sudo systemctl status postgresql
# or
brew services list
```

### Permission Error
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pak_exporters TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### Port Already in Use
```bash
# Check what's using port 5432
# Windows:
netstat -ano | findstr :5432

# Linux/macOS:
lsof -i :5432

# Change PostgreSQL port or stop conflicting service
```

## Next Steps

1. ✅ Update Prisma schema to PostgreSQL
2. ✅ Restore case-insensitive search in API routes
3. ⏳ Install PostgreSQL locally or use Docker
4. ⏳ Update `.env` with PostgreSQL connection string
5. ⏳ Run `npm run db:generate`
6. ⏳ Run `npm run db:migrate`
7. ⏳ Run `npm run db:seed`
8. ⏳ Test the application

## Future: Adding pgvector

When you're ready to add vector database capabilities:

1. **Install pgvector extension:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Add vector column to Product model:**
   ```prisma
   model Product {
     // ... existing fields
     embedding vector(1536)? // For OpenAI embeddings
   }
   ```

3. **Generate embeddings** for products using OpenAI API

4. **Query similar products** using vector similarity search

See `VECTOR_DATABASE_ANALYSIS.md` for more details.

