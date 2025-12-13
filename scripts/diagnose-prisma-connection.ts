/**
 * Prisma Connection Diagnostic Script
 * Tests what Prisma Client actually sees and uses for connection
 */

import { PrismaClient } from "@prisma/client";

async function diagnose() {
console.log("🔍 Prisma Connection Diagnostic");
console.log("=".repeat(60));

// Check environment variables BEFORE any overrides
console.log("\n1. Environment Variables (BEFORE any code changes):");
console.log("   DATABASE_PRISMA_DATABASE_URL:", process.env.DATABASE_PRISMA_DATABASE_URL ? "✅ Set" : "❌ NOT set");
if (process.env.DATABASE_PRISMA_DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_PRISMA_DATABASE_URL);
    console.log(`   Host: ${url.hostname}:${url.port || 'default'}`);
  } catch (e) {
    console.log(`   Value: ${process.env.DATABASE_PRISMA_DATABASE_URL.substring(0, 50)}...`);
  }
}

console.log("   DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ NOT set");
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   Host: ${url.hostname}:${url.port || 'default'}`);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      console.error(`   ❌ PROBLEM: DATABASE_URL points to localhost!`);
    }
  } catch (e) {
    console.log(`   Value: ${process.env.DATABASE_URL.substring(0, 50)}...`);
  }
}

// Simulate what lib/prisma.ts does
console.log("\n2. Simulating lib/prisma.ts logic:");
const databaseUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;
if (databaseUrl) {
  console.log(`   Selected URL: ${databaseUrl.includes('accelerate') ? 'Prisma Accelerate' : 'Vercel Postgres'}`);
  try {
    const url = new URL(databaseUrl);
    console.log(`   Host: ${url.hostname}:${url.port || 'default'}`);
  } catch (e) {
    console.log(`   Value: ${databaseUrl.substring(0, 50)}...`);
  }
  
  // Override like lib/prisma.ts does
  const originalDatabaseUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = databaseUrl;
  console.log(`   ✅ Overrode process.env.DATABASE_URL`);
  console.log(`   Original: ${originalDatabaseUrl ? originalDatabaseUrl.substring(0, 30) + '...' : 'not set'}`);
  console.log(`   New: ${process.env.DATABASE_URL.substring(0, 30)}...`);
} else {
  console.error("   ❌ No database URL available!");
}

// Now create Prisma Client and see what it uses
console.log("\n3. Creating Prisma Client:");
try {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl || process.env.DATABASE_URL || "",
      },
    },
    log: ["error"],
  });

  console.log("   ✅ Prisma Client created");

  // Try to connect and see what happens
  console.log("\n4. Testing Connection:");
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("   ✅ Connection successful!");
    
    // Get the actual connection info if possible
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    if (result && result[0]) {
      console.log(`   Database version: ${result[0].version.substring(0, 50)}...`);
    }
  } catch (connectError: any) {
    console.error("   ❌ Connection failed!");
    console.error(`   Error: ${connectError.message}`);
    console.error(`   Code: ${connectError.code || 'N/A'}`);
    
    // Check if error mentions localhost
    if (connectError.message.includes("localhost")) {
      console.error("\n   🔴 ROOT CAUSE FOUND:");
      console.error("   Prisma is trying to connect to localhost!");
      console.error("   This means DATABASE_URL is still pointing to localhost");
      console.error("   Check:");
      console.error("   1. Vercel environment variables");
      console.error("   2. If DATABASE_URL is set to localhost in Vercel");
      console.error("   3. If there's a .env file being loaded");
    }
  }

  await prisma.$disconnect();
} catch (error: any) {
  console.error("   ❌ Failed to create Prisma Client:");
  console.error(`   ${error.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("Diagnostic complete");
}

diagnose().catch(console.error);

