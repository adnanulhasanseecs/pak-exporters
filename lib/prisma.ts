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

// Log connection info (without exposing credentials)
if (databaseUrl) {
  const urlObj = new URL(databaseUrl);
  const hostInfo = `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port || 'default'}`;
  console.log(`🔌 Prisma connecting to: ${hostInfo}`);
  
  // Warn if connecting to localhost in production
  if (process.env.NODE_ENV === "production" && urlObj.hostname === "localhost") {
    console.error("❌ WARNING: Attempting to connect to localhost in production!");
    console.error(`   DATABASE_PRISMA_DATABASE_URL: ${process.env.DATABASE_PRISMA_DATABASE_URL ? "set" : "NOT set"}`);
    console.error(`   DATABASE_URL: ${process.env.DATABASE_URL ? "set" : "NOT set"}`);
  }
} else {
  console.error("❌ DATABASE_URL or DATABASE_PRISMA_DATABASE_URL must be set");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

