/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created per serverless container
 */

import { PrismaClient } from "@prisma/client";

// Use DATABASE_PRISMA_DATABASE_URL (Prisma Accelerate) if available, otherwise fall back to DATABASE_URL
// Prisma Accelerate requires prisma:// or prisma+postgres:// protocol
const databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;

// Validate database URL exists at module load
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or DATABASE_PRISMA_DATABASE_URL environment variable must be set. " +
    "If using Prisma Accelerate, set DATABASE_PRISMA_DATABASE_URL. " +
    "Otherwise, set DATABASE_URL."
  );
}

// Override DATABASE_URL at runtime if DATABASE_PRISMA_DATABASE_URL is set
// This ensures Prisma Client uses the correct connection string
if (process.env.DATABASE_PRISMA_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_PRISMA_DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client singleton
// In development, reuse the same instance across hot reloads
// In production (Vercel serverless), each function invocation gets a fresh instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Cache Prisma Client on globalThis in development only
// This prevents creating multiple instances during hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
