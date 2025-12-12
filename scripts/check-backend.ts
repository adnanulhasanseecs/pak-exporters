/**
 * Backend Diagnostic Script
 * Checks if the backend is properly configured and running
 */

import { prisma } from "@/lib/prisma";
import { existsSync } from "fs";
import { join } from "path";

async function checkBackend() {
  console.log("🔍 Checking backend configuration...\n");

  // 1. Check .env file
  console.log("1. Environment Variables:");
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    console.log("   ✅ DATABASE_URL is set");
    console.log(`   📍 Value: ${dbUrl.replace(/file:.*\//, "file:.../")}`);
  } else {
    console.log("   ❌ DATABASE_URL is NOT set");
    console.log("   💡 Create a .env file with: DATABASE_URL=\"file:./prisma/dev.db\"");
  }

  // 2. Check database file (only for SQLite)
  console.log("\n2. Database File:");
  if (dbUrl?.startsWith("file:")) {
    // SQLite database
    const dbPath = dbUrl.replace("file:", "");
    if (existsSync(dbPath)) {
      console.log(`   ✅ Database file exists: ${dbPath}`);
    } else {
      console.log(`   ❌ Database file NOT found: ${dbPath}`);
      console.log("   💡 Run: npm run db:migrate");
    }
  } else if (dbUrl?.startsWith("postgresql://") || dbUrl?.startsWith("postgres://")) {
    // PostgreSQL database (connection string, not a file)
    console.log(`   ✅ PostgreSQL connection string configured`);
    console.log(`   📍 Using remote database (not a local file)`);
  } else {
    console.log(`   ⚠️  Unknown database type: ${dbUrl?.substring(0, 20)}...`);
  }

  // 3. Check Prisma client
  console.log("\n3. Prisma Client:");
  try {
    const prismaPath = join(process.cwd(), "node_modules", ".prisma", "client");
    if (existsSync(prismaPath)) {
      console.log("   ✅ Prisma client is generated");
    } else {
      console.log("   ❌ Prisma client NOT generated");
      console.log("   💡 Run: npm run db:generate");
    }
  } catch (error) {
    console.log("   ⚠️  Could not check Prisma client");
  }

  // 4. Test database connection
  console.log("\n4. Database Connection:");
  try {
    await prisma.$connect();
    console.log("   ✅ Database connection successful");
    
    // Test a simple query
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const companyCount = await prisma.company.count();
    
    console.log(`   📊 Products in database: ${productCount}`);
    console.log(`   📊 Categories in database: ${categoryCount}`);
    console.log(`   📊 Companies in database: ${companyCount}`);
    
    if (productCount === 0) {
      console.log("   ⚠️  Database is empty - run: npm run db:seed");
    }
    
    await prisma.$disconnect();
  } catch (error: any) {
    console.log("   ❌ Database connection FAILED");
    console.log(`   🔴 Error: ${error.message}`);
    
    if (error.message?.includes("no such file") || error.message?.includes("ENOENT")) {
      console.log("   💡 Database file doesn't exist. Run: npm run db:migrate");
    } else if (error.message?.includes("Can't reach database server")) {
      console.log("   💡 Database server is not running");
    } else {
      console.log("   💡 Check your DATABASE_URL in .env file");
    }
  }

  // 5. Check API routes
  console.log("\n5. API Routes:");
  const apiRoutes = [
    "app/api/products/route.ts",
    "app/api/categories/route.ts",
    "app/api/companies/route.ts",
  ];
  
  apiRoutes.forEach((route) => {
    if (existsSync(route)) {
      console.log(`   ✅ ${route}`);
    } else {
      console.log(`   ❌ ${route} - NOT FOUND`);
    }
  });

  console.log("\n✅ Backend diagnostic complete!\n");
}

checkBackend().catch(console.error);

