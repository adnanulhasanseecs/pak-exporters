/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client is created per serverless container
 * 
 * Prisma Accelerate Configuration:
 * - schema.prisma uses DATABASE_PRISMA_DATABASE_URL (prisma+postgres:// protocol)
 * - DIRECT_DATABASE_URL is used for migrations (direct PostgreSQL connection)
 * - Prisma Client validates datasource URL at instantiation time
 * - No runtime env mutation needed - schema-level configuration is sufficient
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
