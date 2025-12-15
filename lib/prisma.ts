/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created per serverless container
 * 
 * Prisma Connection Configuration:
 * - Prefers DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate URL with prisma+postgres:// protocol)
 * - Falls back to DATABASE_URL if Accelerate URL is not available
 * - Uses datasources option to override schema-level URL at runtime for Vercel SSR compatibility
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Select database URL: prefer Accelerate URL, fallback to standard URL
const url = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL or DATABASE_PRISMA_DATABASE_URL environment variable is required. " +
    "Please configure your database connection string."
  );
}

// Create Prisma Client singleton with runtime URL override
// This allows Vercel SSR to use the correct connection string even if schema uses a different env var
// In development, reuse the same instance across hot reloads
// In production (Vercel serverless), each function invocation gets a fresh instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache Prisma Client on globalThis in development only
// This prevents creating multiple instances during hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
