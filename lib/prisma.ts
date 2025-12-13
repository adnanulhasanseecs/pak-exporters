/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 * 
 * CRITICAL: This file MUST set DATABASE_URL before importing PrismaClient
 * because Prisma Client reads the connection string from process.env.DATABASE_URL
 * during initialization, even if we specify datasources.url in the constructor.
 */

// CRITICAL: Set DATABASE_URL BEFORE importing PrismaClient
// Use DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate) if available, otherwise DATABASE_URL
// Prisma Accelerate is better for serverless environments like Vercel
const databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;

// Override process.env.DATABASE_URL IMMEDIATELY to ensure Prisma uses correct connection
if (databaseUrl) {
  // Remove any localhost references - this is critical for Vercel
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
    console.warn(`[Prisma Init] WARNING: Found localhost in DATABASE_URL, overriding with: ${databaseUrl.includes('accelerate') ? 'Prisma Accelerate' : 'Vercel Postgres'}`);
  }
  process.env.DATABASE_URL = databaseUrl;
  console.log(`[Prisma Init] Set process.env.DATABASE_URL to ${databaseUrl.includes('accelerate') ? 'Prisma Accelerate' : 'Vercel Postgres'} connection`);
} else {
  console.error("❌ [Prisma Init] No database URL available!");
  console.error("   DATABASE_PRISMA_DATABASE_URL:", process.env.DATABASE_PRISMA_DATABASE_URL ? "Set" : "NOT set");
  console.error("   DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "NOT set");
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
    
    // Warn if connecting to localhost in production
    if (urlObj.hostname === "localhost") {
      console.error("❌ [Prisma Init] WARNING: Connection string points to localhost!");
      console.error(`   Host: ${urlObj.hostname}, Port: ${urlObj.port || 'default'}`);
      console.error(`   This will NOT work on Vercel. Check environment variables.`);
    }
  } catch (e) {
    console.error("❌ [Prisma Init] Invalid database URL format:", e);
  }
} else {
  console.error("❌ [Prisma Init] DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set");
  console.error("   Available env vars:", Object.keys(process.env).filter(k => k.includes("DATABASE")).join(", ") || "none");
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

