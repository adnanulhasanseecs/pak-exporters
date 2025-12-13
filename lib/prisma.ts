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

if (!databaseUrl) {
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

