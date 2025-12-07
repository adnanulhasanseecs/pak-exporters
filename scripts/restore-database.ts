/**
 * Database Restore Script
 * Restores database from a backup file
 * 
 * Usage:
 *   tsx scripts/restore-database.ts <backup-file>
 * 
 * WARNING: This will overwrite the current database!
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { prisma } from "../lib/prisma";

const DATABASE_URL = process.env.DATABASE_URL;

async function restoreDatabase(backupPath: string) {
  console.log("🔄 Starting database restore...\n");

  if (!backupPath) {
    console.error("❌ Error: Backup file path is required");
    console.log("Usage: tsx scripts/restore-database.ts <backup-file>");
    process.exit(1);
  }

  if (!existsSync(backupPath)) {
    console.error(`❌ Error: Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  try {
    // Confirm restore
    console.log("⚠️  WARNING: This will overwrite the current database!");
    console.log(`   Backup file: ${backupPath}`);
    console.log(`   Database: ${DATABASE_URL}\n`);

    if (DATABASE_URL?.startsWith("file:")) {
      // SQLite restore
      const dbPath = DATABASE_URL.replace("file:", "");
      const dbFile = join(process.cwd(), dbPath);

      // Copy backup file to database location
      const { copyFileSync } = await import("fs");
      copyFileSync(backupPath, dbFile);
      console.log(`✅ SQLite database restored from: ${backupPath}`);

    } else if (DATABASE_URL?.startsWith("postgresql://") || DATABASE_URL?.startsWith("postgres://")) {
      // PostgreSQL restore using psql
      try {
        execSync("psql --version", { stdio: "ignore" });
      } catch {
        throw new Error(
          "psql not found. Please install PostgreSQL client tools.\n" +
          "For Ubuntu/Debian: sudo apt-get install postgresql-client\n" +
          "For macOS: brew install postgresql"
        );
      }

      // Drop and recreate database (or use --clean --if-exists with pg_restore)
      // For safety, we'll use psql to restore SQL dump
      const restoreCommand = `psql "${DATABASE_URL}" < "${backupPath}"`;
      execSync(restoreCommand, { stdio: "inherit" });
      console.log(`✅ PostgreSQL database restored from: ${backupPath}`);

    } else {
      throw new Error(`Unsupported database URL format: ${DATABASE_URL}`);
    }

    console.log("\n✅ Database restore completed successfully!");
    console.log("   Please verify the data and run migrations if needed.");

  } catch (error: any) {
    console.error(`❌ Restore failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get backup file from command line arguments
const backupFile = process.argv[2];
restoreDatabase(backupFile);

