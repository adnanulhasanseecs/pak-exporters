/**
 * Data Migration Script
 * Imports JSON data from services/mocks/*.json into the database
 */

import { prisma } from "@/lib/prisma";
import productsData from "@/services/mocks/products.json";
import companiesData from "@/services/mocks/companies.json";
import categoriesData from "@/services/mocks/categories.json";
import blogData from "@/services/mocks/blog.json";
import membershipApplicationsData from "@/services/mocks/membership-applications.json";

async function migrateData() {
  console.log("🔄 Starting data migration...\n");

  try {
    // 1. Migrate Categories
    console.log("📁 Migrating categories...");
    const categoryMap = new Map<string, string>(); // oldId -> newId

    for (const category of categoriesData as any[]) {
      const created = await prisma.category.upsert({
        where: { slug: category.slug },
        update: {
          name: category.name,
          description: category.description || null,
          image: category.image || null,
          icon: category.icon || null,
          parentId: category.parentId ? categoryMap.get(category.parentId) || null : null,
          level: category.level || 0,
          order: category.order || 0,
        },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          image: category.image || null,
          icon: category.icon || null,
          parentId: category.parentId ? categoryMap.get(category.parentId) || null : null,
          level: category.level || 0,
          order: category.order || 0,
          productCount: 0, // Will be updated after products migration
        },
      });
      categoryMap.set(category.id, created.id);
    }
    console.log(`✅ Migrated ${categoryMap.size} categories\n`);

    // 2. Migrate Companies
    console.log("🏢 Migrating companies...");
    const companyMap = new Map<string, string>(); // oldId -> newId

    for (const company of companiesData as any[]) {
      const created = await prisma.company.upsert({
        where: { email: company.contact?.email || company.email || `company-${company.id}@example.com` },
        update: {
          name: company.name,
          description: company.description,
          logo: company.logo || null,
          coverImage: company.coverImage || null,
          verified: company.verified || false,
          goldSupplier: company.goldSupplier || false,
          membershipTier: company.membershipTier || null,
          trustScore: company.trustScore || null,
          city: company.location?.city || company.city || "",
          province: company.location?.province || company.province || "",
          country: company.location?.country || company.country || "Pakistan",
          email: company.contact?.email || company.email || `company-${company.id}@example.com`,
          phone: company.contact?.phone || company.phone || null,
          website: company.contact?.website || company.website || null,
          yearEstablished: company.yearEstablished || null,
          employeeCount: company.employeeCount || null,
          certifications: company.certifications ? JSON.stringify(company.certifications) : null,
          mainProducts: company.mainProducts ? JSON.stringify(company.mainProducts) : null,
          productCount: 0, // Will be updated after products migration
        },
        create: {
          name: company.name,
          description: company.description,
          logo: company.logo || null,
          coverImage: company.coverImage || null,
          verified: company.verified || false,
          goldSupplier: company.goldSupplier || false,
          membershipTier: company.membershipTier || null,
          trustScore: company.trustScore || null,
          city: company.location?.city || company.city || "",
          province: company.location?.province || company.province || "",
          country: company.location?.country || company.country || "Pakistan",
          email: company.contact?.email || company.email || `company-${company.id}@example.com`,
          phone: company.contact?.phone || company.phone || null,
          website: company.contact?.website || company.website || null,
          yearEstablished: company.yearEstablished || null,
          employeeCount: company.employeeCount || null,
          certifications: company.certifications ? JSON.stringify(company.certifications) : null,
          mainProducts: company.mainProducts ? JSON.stringify(company.mainProducts) : null,
          productCount: 0,
        },
      });
      companyMap.set(company.id, created.id);

      // Link company to categories
      if (company.categories && Array.isArray(company.categories)) {
        for (const cat of company.categories) {
          const categoryId = categoryMap.get(cat.id);
          if (categoryId) {
            await prisma.companyCategory.upsert({
              where: {
                companyId_categoryId: {
                  companyId: created.id,
                  categoryId: categoryId,
                },
              },
              update: {},
              create: {
                companyId: created.id,
                categoryId: categoryId,
              },
            });
          }
        }
      }
    }
    console.log(`✅ Migrated ${companyMap.size} companies\n`);

    // 3. Migrate Products
    console.log("📦 Migrating products...");
    let productCount = 0;
    let skippedCount = 0;

    for (const product of productsData as any[]) {
      // Try to find category by ID first, then by slug
      let categoryId = categoryMap.get(product.category?.id || product.categoryId);
      if (!categoryId && product.category?.slug) {
        const category = await prisma.category.findUnique({
          where: { slug: product.category.slug },
        });
        if (category && product.category?.id) {
          categoryId = category.id;
          // TypeScript strict mode: store in const to properly narrow type
          const categoryKey = product.category.id;
          if (typeof categoryKey === 'string') {
            categoryMap.set(categoryKey, categoryId); // Cache for future use
          }
        }
      }

      // Try to find company by ID first, then create if missing
      let companyId = companyMap.get(product.company?.id || product.companyId);
      if (!companyId && product.company) {
        // Company doesn't exist in companies.json, create it from product data
        const companyEmail = product.company.email || `company-${product.company.id}@example.com`;
        try {
          const existingCompany = await prisma.company.findUnique({
            where: { email: companyEmail },
          });
          if (existingCompany && product.company?.id) {
            companyId = existingCompany.id;
            // TypeScript strict mode: store in const to properly narrow type
            const companyKey = product.company.id;
            if (typeof companyKey === 'string') {
              companyMap.set(companyKey, companyId);
            }
          } else {
            // Create missing company from product data
            const newCompany = await prisma.company.create({
              data: {
                name: product.company.name || `Company ${product.company.id}`,
                description: `Company extracted from product data`,
                email: companyEmail,
                city: "Unknown",
                province: "Unknown",
                country: "Pakistan",
                verified: product.company.verified || false,
                goldSupplier: product.company.goldSupplier || false,
                logo: product.company.logo || null,
                productCount: 0,
              },
            });
            companyId = newCompany.id;
            // TypeScript strict mode: store in const to properly narrow type
            const companyKey = product.company?.id;
            if (companyKey && typeof companyKey === 'string') {
              companyMap.set(companyKey, companyId);
            }
            console.log(`  ➕ Created missing company: ${product.company.name} (ID: ${product.company?.id || 'N/A'})`);
          }
        } catch (error: any) {
          console.warn(`  ⚠️  Could not create company for product ${product.id}: ${error.message}`);
        }
      }

      if (!categoryId || !companyId) {
        skippedCount++;
        console.warn(`⚠️  Skipping product ${product.id} (${product.name}): missing category (${!categoryId ? 'yes' : 'no'}) or company (${!companyId ? 'yes' : 'no'})`);
        continue;
      }

      await prisma.product.upsert({
        where: { id: product.id },
        update: {
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || null,
          priceAmount: product.price?.amount || 0,
          priceCurrency: product.price?.currency || "USD",
          minOrderQuantity: product.price?.minOrderQuantity || null,
          images: JSON.stringify(product.images || []),
          categoryId: categoryId,
          companyId: companyId,
          specifications: product.specifications ? JSON.stringify(product.specifications) : null,
          tags: product.tags ? JSON.stringify(product.tags) : null,
          status: product.status || "active",
          salesData: product.salesData ? JSON.stringify(product.salesData) : null,
        },
        create: {
          id: product.id, // Keep original IDs
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || null,
          priceAmount: product.price?.amount || 0,
          priceCurrency: product.price?.currency || "USD",
          minOrderQuantity: product.price?.minOrderQuantity || null,
          images: JSON.stringify(product.images || []),
          categoryId: categoryId,
          companyId: companyId,
          specifications: product.specifications ? JSON.stringify(product.specifications) : null,
          tags: product.tags ? JSON.stringify(product.tags) : null,
          status: product.status || "active",
          salesData: product.salesData ? JSON.stringify(product.salesData) : null,
        },
      });

      productCount++;
    }

    // Update product counts
    const categoryProductCounts = new Map<string, number>();
    const companyProductCounts = new Map<string, number>();

    for (const product of productsData as any[]) {
      const categoryId = categoryMap.get(product.category?.id || product.categoryId);
      const companyId = companyMap.get(product.company?.id || product.companyId);

      if (categoryId) {
        categoryProductCounts.set(categoryId, (categoryProductCounts.get(categoryId) || 0) + 1);
      }
      if (companyId) {
        companyProductCounts.set(companyId, (companyProductCounts.get(companyId) || 0) + 1);
      }
    }

    // Update category product counts
    for (const [categoryId, count] of categoryProductCounts.entries()) {
      await prisma.category.update({
        where: { id: categoryId },
        data: { productCount: count },
      });
    }

    // Update company product counts
    for (const [companyId, count] of companyProductCounts.entries()) {
      await prisma.company.update({
        where: { id: companyId },
        data: { productCount: count },
      });
    }

    // Assign categories to companies based on their products
    console.log("🔗 Assigning categories to companies based on products...");
    const allCompanies = await prisma.company.findMany({
      include: {
        products: {
          include: {
            category: true,
          },
        },
        companyCategories: true,
      },
    });

    let categoriesAssigned = 0;
    for (const company of allCompanies) {
      // Get unique categories from company's products
      const productCategories = new Map<string, string>(); // categoryId -> categoryId
      for (const product of company.products) {
        if (product.category?.id) {
          const categoryId: string = product.category.id;
          productCategories.set(categoryId, categoryId);
        }
      }

      // Assign categories that aren't already linked
      for (const categoryId of productCategories.values()) {
        const existingLink = company.companyCategories.find(
          (link: any) => link.categoryId === categoryId
        );
        if (!existingLink) {
          await prisma.companyCategory.create({
            data: {
              companyId: company.id,
              categoryId: categoryId,
            },
          });
          categoriesAssigned++;
        }
      }
    }

    if (categoriesAssigned > 0) {
      console.log(`  ✅ Assigned ${categoriesAssigned} category relationships to companies`);
    }

    console.log(`✅ Migrated ${productCount} products`);
    if (skippedCount > 0) {
      console.log(`⚠️  Skipped ${skippedCount} products due to missing references\n`);
    } else {
      console.log();
    }

    // 4. Migrate Blog Posts
    console.log("📝 Migrating blog posts...");
    let blogCount = 0;

    for (const post of blogData as any[]) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || null,
          author: post.author || null,
          image: post.image || null,
          published: post.published !== false,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        },
        create: {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || null,
          author: post.author || null,
          image: post.image || null,
          published: post.published !== false,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        },
      });
      blogCount++;
    }
    console.log(`✅ Migrated ${blogCount} blog posts\n`);

    // 5. Migrate RFQs (if any users exist)
    console.log("📋 Migrating RFQs...");
    // Note: RFQs require users, so we'll skip for now or create mock users
    console.log("⚠️  RFQs migration skipped (requires users - will be handled separately)\n");

    // 6. Migrate Membership Applications
    console.log("📄 Migrating membership applications...");
    let appCount = 0;

    for (const app of membershipApplicationsData as any[]) {
      await prisma.membershipApplication.create({
        data: {
          userId: app.userId || `user-${app.id}`,
          companyName: app.companyName || app.company?.name || "",
          companyDescription: app.companyDescription || app.company?.description || "",
          requestedTier: app.requestedTier || app.tier || "starter",
          status: app.status || "pending",
          adminNotes: app.adminNotes || null,
          reviewedAt: app.reviewedAt ? new Date(app.reviewedAt) : null,
          reviewedBy: app.reviewedBy || null,
        },
      });
      appCount++;
    }
    console.log(`✅ Migrated ${appCount} membership applications\n`);

    console.log("✅ Data migration completed successfully!\n");
    console.log("Summary:");
    console.log(`  - Categories: ${categoryMap.size}`);
    console.log(`  - Companies: ${companyMap.size}`);
    console.log(`  - Products: ${productCount}`);
    console.log(`  - Blog Posts: ${blogCount}`);
    console.log(`  - Membership Applications: ${appCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log("\n✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateData };

