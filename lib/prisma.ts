/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 * 
 * CRITICAL: This file MUST set DATABASE_URL before importing PrismaClient
 * because Prisma Client reads the connection string from process.env.DATABASE_URL
 * during initialization, even if we specify datasources.url in the constructor.
 */

// CRITICAL: Set DATABASE_URL BEFORE importing PrismaClient
// Prisma Client reads process.env.DATABASE_URL during initialization, so we MUST override it first

// Priority order:
// 1. DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate - best for serverless)
// 2. DATABASE_URL (but reject if it's localhost - NEVER allow localhost on Vercel)
// 3. Error if neither is available

// Helper function to check if URL is localhost
function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    // If URL parsing fails, check if string contains localhost
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}

// Helper function to check if we're in a Vercel-like environment
function isVercelEnvironment(): boolean {
  return !!(
    process.env.VERCEL ||
    process.env.VERCEL_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    (process.env.NODE_ENV === 'production' && !process.env.DEV)
  );
}

let databaseUrl: string | undefined;

// First, try Prisma Accelerate (best for Vercel)
if (process.env.DATABASE_PRISMA_DATABASE_URL) {
  databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL;
  console.log(`[Prisma Init] Using DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate)`);
  
  // CRITICAL: Even Prisma Accelerate URL should not point to localhost
  if (isLocalhost(databaseUrl)) {
    console.error("❌ [Prisma Init] CRITICAL: DATABASE_PRISMA_DATABASE_URL points to localhost!");
    console.error(`   This will NOT work on Vercel.`);
    console.error("   Fix DATABASE_PRISMA_DATABASE_URL in Vercel environment variables.");
    throw new Error("DATABASE_PRISMA_DATABASE_URL cannot point to localhost. Fix it in Vercel environment variables.");
  }
} else if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  
  // CRITICAL: NEVER allow localhost in Vercel environment or production
  // Only allow localhost in explicit development mode (NODE_ENV=development and not on Vercel)
  const isDev = process.env.NODE_ENV === 'development' && !isVercelEnvironment();
  
  if (isLocalhost(dbUrl) && !isDev) {
    console.error("❌ [Prisma Init] CRITICAL: DATABASE_URL points to localhost!");
    console.error(`   Current value: ${dbUrl.substring(0, 80)}...`);
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.error(`   VERCEL: ${process.env.VERCEL || 'not set'}`);
    console.error("   This will NOT work on Vercel.");
    console.error("   Solution: Set DATABASE_PRISMA_DATABASE_URL or fix DATABASE_URL in Vercel environment variables.");
    throw new Error("DATABASE_URL cannot point to localhost. Set DATABASE_PRISMA_DATABASE_URL or fix DATABASE_URL in Vercel.");
  }
  
  databaseUrl = dbUrl;
  console.log(`[Prisma Init] Using DATABASE_URL`);
} else {
  console.error("❌ [Prisma Init] No database URL available!");
  console.error("   DATABASE_PRISMA_DATABASE_URL:", process.env.DATABASE_PRISMA_DATABASE_URL ? "Set" : "NOT set");
  console.error("   DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "NOT set");
  throw new Error("DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set");
}

// CRITICAL: Override process.env.DATABASE_URL IMMEDIATELY
// This ensures Prisma Client uses the correct connection string
process.env.DATABASE_URL = databaseUrl;

// Log the override for debugging
if (databaseUrl.includes('accelerate')) {
  console.log(`[Prisma Init] ✅ Overrode process.env.DATABASE_URL with Prisma Accelerate connection`);
} else {
  console.log(`[Prisma Init] ✅ Overrode process.env.DATABASE_URL with Vercel Postgres connection`);
}

// NOW import PrismaClient - it will read from the overridden process.env.DATABASE_URL
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log connection info (without exposing credentials)
console.log("[Prisma Init] Environment check:", {
  DATABASE_PRISMA_DATABASE_URL: process.env.DATABASE_PRISMA_DATABASE_URL ? "✅ Set" : "❌ NOT set",
  DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ NOT set",
  NODE_ENV: process.env.NODE_ENV || "not set",
});

if (databaseUrl) {
  try {
    const urlObj = new URL(databaseUrl);
    const hostInfo = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port || 'default'}`;
    console.log(`🔌 [Prisma Init] Will connect to: ${hostInfo}`);
    
    // FINAL CHECK: Verify we're not connecting to localhost (should have been caught above, but double-check)
    if (isLocalhost(databaseUrl) && !isVercelEnvironment() && process.env.NODE_ENV !== 'development') {
      console.error("❌ [Prisma Init] CRITICAL: Final database URL still points to localhost!");
      console.error(`   Host: ${urlObj.hostname}, Port: ${urlObj.port || 'default'}`);
      console.error(`   This will NOT work on Vercel.`);
      throw new Error("Database connection string points to localhost. This is not allowed. Fix environment variables.");
    }
    
    // Log success
    if (urlObj.hostname.includes('accelerate') || urlObj.hostname.includes('prisma-data.net')) {
      console.log(`✅ [Prisma Init] Using Prisma Accelerate connection`);
    } else if (urlObj.hostname.includes('prisma.io') || urlObj.hostname.includes('vercel')) {
      console.log(`✅ [Prisma Init] Using Vercel Postgres connection`);
    } else {
      console.log(`✅ [Prisma Init] Using database connection`);
    }
  } catch (e: any) {
    if (e.message && e.message.includes('localhost')) {
      throw e; // Re-throw localhost errors
    }
    console.error("❌ [Prisma Init] Invalid database URL format:", e);
    throw new Error(`Invalid database URL format: ${e.message}`);
  }
} else {
  console.error("❌ [Prisma Init] DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set");
  console.error("   Available env vars:", Object.keys(process.env).filter(k => k.includes("DATABASE")).join(", ") || "none");
  throw new Error("No database URL available");
}

// Create Prisma Client with explicit connection string override
// This ensures we use the correct database URL even if schema was generated with wrong one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || process.env.DATABASE_URL || "",
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Verify the connection string is being used correctly
if (databaseUrl) {
  console.log(`✅ [Prisma Init] PrismaClient created with connection override`);
  try {
    const urlObj = new URL(databaseUrl);
    console.log(`   Override URL host: ${urlObj.hostname}:${urlObj.port || 'default'}`);
  } catch (e) {
    // Ignore URL parsing errors
  }
} else {
  console.error("❌ [Prisma Init] No database URL available for PrismaClient override!");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

