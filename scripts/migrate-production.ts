/**
 * Production Database Migration Script
 * Runs Prisma migrations in production environment
 * 
 * Usage:
 *   NODE_ENV=production tsx scripts/migrate-production.ts
 * 
 * This script:
 * 1. Validates environment variables
 * 2. Runs Prisma migrations
 * 3. Verifies migration success
 */

import { execSync } from "child_process";

async function migrateProduction() {
  console.log("🔄 Starting production database migration...\n");

  // Validate environment
  if (process.env.NODE_ENV !== "production") {
    console.warn("⚠️  Warning: NODE_ENV is not set to 'production'");
    console.warn("   This script is intended for production use.\n");
  }

  // Check required environment variables
  const requiredVars = ["DATABASE_URL", "JWT_SECRET"];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("❌ Error: Missing required environment variables:");
    missingVars.forEach((varName) => console.error(`   - ${varName}`));
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error("❌ Error: JWT_SECRET must be at least 32 characters long");
    process.exit(1);
  }

  try {
    console.log("📦 Generating Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });
    console.log("✅ Prisma Client generated\n");

    console.log("🔄 Running database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Migrations completed\n");

    console.log("🔍 Verifying database connection...");
    const { prisma } = await import("../lib/prisma");
    
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connection verified\n");

    // Get table counts
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const companyCount = await prisma.company.count();
    const categoryCount = await prisma.category.count();

    console.log("📊 Database Status:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Companies: ${companyCount}`);
    console.log(`   Categories: ${categoryCount}\n`);

    await prisma.$disconnect();
    console.log("✅ Production migration completed successfully!");

  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Verify DATABASE_URL is correct");
    console.error("   2. Check database connection");
    console.error("   3. Ensure database user has proper permissions");
    console.error("   4. Review migration files for errors");
    process.exit(1);
  }
}

migrateProduction();

