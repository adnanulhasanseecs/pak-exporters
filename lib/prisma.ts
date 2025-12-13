/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created per serverless container
 */

import { PrismaClient } from "@prisma/client";

// Validate DATABASE_URL exists at module load
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
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
