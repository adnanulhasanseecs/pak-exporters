/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate) if available, otherwise DATABASE_URL
// Prisma Accelerate is better for serverless environments like Vercel
const databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;

// CRITICAL: Override DATABASE_URL in process.env to ensure Prisma uses the correct connection
// This is necessary because Prisma Client reads from process.env.DATABASE_URL at runtime
// even if we specify datasources.url in the constructor
if (databaseUrl && databaseUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = databaseUrl;
  console.log(`[Prisma Init] Overrode process.env.DATABASE_URL with ${databaseUrl.includes('accelerate') ? 'Prisma Accelerate' : 'Vercel Postgres'} URL`);
}

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

