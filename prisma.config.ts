// Prisma configuration file
// NOTE: We do NOT import dotenv/config here to avoid loading local .env files
// during Vercel builds. Environment variables are provided by Vercel directly.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use DATABASE_URL - runtime override in lib/prisma.ts will use DATABASE_PRISMA_DATABASE_URL if available
    // Environment variables are provided by the platform (Vercel) or .env files loaded by Next.js
    url: env("DATABASE_URL"),
  },
});
