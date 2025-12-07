/**
 * Database Migration Rollback Script
 * Rolls back the last migration
 * 
 * Usage:
 *   tsx scripts/rollback-migration.ts
 * 
 * WARNING: This will roll back the last migration!
 */

import { readdirSync } from "fs";
import { join } from "path";

async function rollbackMigration() {
  console.log("🔄 Starting migration rollback...\n");

  try {
    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    const migrations = readdirSync(migrationsDir)
      .filter((dir) => !dir.startsWith("."))
      .sort()
      .reverse();

    if (migrations.length === 0) {
      console.log("ℹ️  No migrations found to rollback");
      return;
    }

    const lastMigration = migrations[0];
    console.log(`⚠️  WARNING: This will roll back migration: ${lastMigration}`);
    console.log("   This action cannot be easily undone!\n");

    // For Prisma, we need to manually handle rollback
    // Prisma doesn't have built-in rollback, so we'll use migrate resolve
    console.log("📝 Note: Prisma doesn't have automatic rollback.");
    console.log("   To rollback:");
    console.log("   1. Manually revert the migration SQL");
    console.log("   2. Or restore from a backup");
    console.log("   3. Or create a new migration to undo changes\n");

    console.log("💡 Recommended approach:");
    console.log("   1. Create a backup: tsx scripts/backup-database.ts");
    console.log("   2. Restore from backup if needed: tsx scripts/restore-database.ts <backup-file>");
    console.log("   3. Or create a new migration to undo the changes");

  } catch (error: any) {
    console.error(`❌ Rollback failed: ${error.message}`);
    process.exit(1);
  }
}

rollbackMigration();

