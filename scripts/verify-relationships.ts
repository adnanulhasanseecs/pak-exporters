/**
 * Verify Database Relationships
 * Checks that all foreign key relationships are valid
 */

import { prisma } from "@/lib/prisma";

async function verifyRelationships() {
  console.log("🔍 Verifying database relationships...\n");

  try {
    // 1. Check Products
    console.log("📦 Checking products...");
    const products = await prisma.product.findMany({
      include: {
        category: true,
        company: true,
      },
    });

    let brokenProducts = 0;
    for (const product of products) {
      if (!product.category) {
        console.error(`  ❌ Product "${product.name}" (ID: ${product.id}) has no category`);
        brokenProducts++;
      }
      if (!product.company) {
        console.error(`  ❌ Product "${product.name}" (ID: ${product.id}) has no company`);
        brokenProducts++;
      }
    }

    if (brokenProducts === 0) {
      console.log(`  ✅ All ${products.length} products have valid category and company relationships`);
    } else {
      console.log(`  ⚠️  Found ${brokenProducts} products with broken relationships`);
    }
    console.log();

    // 2. Check Company-Category relationships
    console.log("🏢 Checking company-category relationships...");
    const companies = await prisma.company.findMany({
      include: {
        companyCategories: {
          include: {
            category: true,
          },
        },
        products: true,
      },
    });

    let companiesWithoutCategories = 0;
    for (const company of companies) {
      if (company.companyCategories.length === 0 && company.products.length > 0) {
        console.warn(`  ⚠️  Company "${company.name}" has products but no categories assigned`);
        companiesWithoutCategories++;
      }
    }

    if (companiesWithoutCategories === 0) {
      console.log(`  ✅ All ${companies.length} companies have proper category relationships`);
    } else {
      console.log(`  ⚠️  Found ${companiesWithoutCategories} companies without categories`);
    }
    console.log();

    // 3. Check Category product counts
    console.log("📁 Checking category product counts...");
    const categories = await prisma.category.findMany({
      include: {
        products: true,
      },
    });

    let incorrectCounts = 0;
    for (const category of categories) {
      const actualCount = category.products.length;
      if (category.productCount !== actualCount) {
        console.warn(
          `  ⚠️  Category "${category.name}" has count ${category.productCount} but actually has ${actualCount} products`
        );
        // Update the count
        await prisma.category.update({
          where: { id: category.id },
          data: { productCount: actualCount },
        });
        incorrectCounts++;
      }
    }

    if (incorrectCounts === 0) {
      console.log(`  ✅ All ${categories.length} categories have correct product counts`);
    } else {
      console.log(`  🔧 Fixed ${incorrectCounts} category product counts`);
    }
    console.log();

    // 4. Check Company product counts
    console.log("🏢 Checking company product counts...");
    let incorrectCompanyCounts = 0;
    for (const company of companies) {
      const actualCount = company.products.length;
      if (company.productCount !== actualCount) {
        console.warn(
          `  ⚠️  Company "${company.name}" has count ${company.productCount} but actually has ${actualCount} products`
        );
        // Update the count
        await prisma.company.update({
          where: { id: company.id },
          data: { productCount: actualCount },
        });
        incorrectCompanyCounts++;
      }
    }

    if (incorrectCompanyCounts === 0) {
      console.log(`  ✅ All ${companies.length} companies have correct product counts`);
    } else {
      console.log(`  🔧 Fixed ${incorrectCompanyCounts} company product counts`);
    }
    console.log();

    // 5. Check for orphaned CompanyCategory entries
    console.log("🔗 Checking company-category links...");
    const companyCategories = await prisma.companyCategory.findMany({
      include: {
        company: true,
        category: true,
      },
    });

    let orphanedLinks = 0;
    for (const link of companyCategories) {
      if (!link.company || !link.category) {
        console.error(`  ❌ Orphaned company-category link (ID: ${link.id})`);
        orphanedLinks++;
        // Clean up orphaned link
        await prisma.companyCategory.delete({
          where: { id: link.id },
        });
      }
    }

    if (orphanedLinks === 0) {
      console.log(`  ✅ All ${companyCategories.length} company-category links are valid`);
    } else {
      console.log(`  🧹 Cleaned up ${orphanedLinks} orphaned links`);
    }
    console.log();

    console.log("✅ Relationship verification completed!\n");
    console.log("Summary:");
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Companies: ${companies.length}`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Company-Category Links: ${companyCategories.length}`);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
if (require.main === module) {
  verifyRelationships()
    .then(() => {
      console.log("\n✅ Verification script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Verification script failed:", error);
      process.exit(1);
    });
}

export { verifyRelationships };

