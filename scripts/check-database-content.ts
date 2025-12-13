/**
 * Check Database Content Script
 * Verifies if database has products, categories, and blog posts
 */

import { prisma } from "@/lib/prisma";

async function checkDatabaseContent() {
  console.log("🔍 Checking Database Content");
  console.log("=".repeat(60));

  try {
    // Check connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful\n");

    // Check products
    const productCount = await prisma.product.count();
    console.log(`📦 Products: ${productCount}`);
    if (productCount > 0) {
      const sampleProduct = await prisma.product.findFirst({
        select: { id: true, name: true, status: true },
      });
      console.log(`   Sample: ${sampleProduct?.name} (${sampleProduct?.status})`);
    } else {
      console.log("   ⚠️  No products in database");
    }

    // Check categories
    const categoryCount = await prisma.category.count();
    console.log(`\n📁 Categories: ${categoryCount}`);
    if (categoryCount > 0) {
      const sampleCategory = await prisma.category.findFirst({
        select: { id: true, name: true, slug: true },
      });
      console.log(`   Sample: ${sampleCategory?.name} (${sampleCategory?.slug})`);
    } else {
      console.log("   ⚠️  No categories in database");
    }

    // Check blog posts
    const blogCount = await prisma.blogPost.count();
    console.log(`\n📝 Blog Posts: ${blogCount}`);
    if (blogCount > 0) {
      const samplePost = await prisma.blogPost.findFirst({
        select: { id: true, title: true, published: true },
      });
      console.log(`   Sample: ${samplePost?.title} (published: ${samplePost?.published})`);
    } else {
      console.log("   ⚠️  No blog posts in database");
    }

    // Check companies
    const companyCount = await prisma.company.count();
    console.log(`\n🏢 Companies: ${companyCount}`);
    if (companyCount > 0) {
      const sampleCompany = await prisma.company.findFirst({
        select: { id: true, name: true, verified: true },
      });
      console.log(`   Sample: ${sampleCompany?.name} (verified: ${sampleCompany?.verified})`);
    } else {
      console.log("   ⚠️  No companies in database");
    }

    console.log("\n" + "=".repeat(60));
    
    if (productCount === 0 && categoryCount === 0 && blogCount === 0) {
      console.log("❌ Database is EMPTY!");
      console.log("   Solution: Run migrations and seed the database:");
      console.log("   npm run db:migrate");
      console.log("   npm run db:seed");
    } else {
      console.log("✅ Database has content");
    }

    await prisma.$disconnect();
  } catch (error: any) {
    console.error("❌ Error checking database:", error.message);
    console.error("   Code:", error.code);
    process.exit(1);
  }
}

checkDatabaseContent();

