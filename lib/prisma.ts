/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created per serverless container
 * 
 * Prisma reads DATABASE_URL and DIRECT_DATABASE_URL from environment variables
 * as configured in prisma/schema.prisma. No manual env reading needed.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma Client singleton
// In development, reuse the same instance across hot reloads
// In production (Vercel serverless), each function invocation gets a fresh instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Cache Prisma Client on globalThis in development only
// This prevents creating multiple instances during hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
