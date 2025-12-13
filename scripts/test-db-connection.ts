// Use the singleton from lib/prisma.ts to ensure correct connection string
// This ensures we use the same connection logic as the app (no localhost on Vercel)
import { prisma } from "@/lib/prisma";

async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful!");
    
    const categoryCount = await prisma.category.count();
    console.log(`✅ Found ${categoryCount} categories in database`);
    
    const productCount = await prisma.product.count();
    console.log(`✅ Found ${productCount} products in database`);
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

