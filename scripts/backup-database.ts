/**
 * Database Backup Script
 * Creates a backup of the database (SQLite or PostgreSQL)
 * 
 * Usage:
 *   tsx scripts/backup-database.ts [output-file]
 * 
 * For SQLite: Creates a copy of the database file
 * For PostgreSQL: Uses pg_dump to create SQL dump
 */

import { execSync } from "child_process";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { prisma } from "../lib/prisma";

const DATABASE_URL = process.env.DATABASE_URL;
const BACKUP_DIR = join(process.cwd(), "backups");
const RETENTION_DAYS = 30;

async function backupDatabase() {
  console.log("🔄 Starting database backup...\n");

  try {
    // Create backups directory if it doesn't exist
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    let backupPath: string;

    if (DATABASE_URL?.startsWith("file:")) {
      // SQLite backup
      const dbPath = DATABASE_URL.replace("file:", "");
      const dbFile = join(process.cwd(), dbPath);
      
      if (!existsSync(dbFile)) {
        throw new Error(`Database file not found: ${dbFile}`);
      }

      backupPath = join(BACKUP_DIR, `backup-${timestamp}.db`);
      copyFileSync(dbFile, backupPath);
      console.log(`✅ SQLite backup created: ${backupPath}`);

    } else if (DATABASE_URL?.startsWith("postgresql://") || DATABASE_URL?.startsWith("postgres://")) {
      // PostgreSQL backup using pg_dump
      backupPath = join(BACKUP_DIR, `backup-${timestamp}.sql`);
      
      // Check if pg_dump is available
      try {
        execSync("pg_dump --version", { stdio: "ignore" });
      } catch {
        throw new Error(
          "pg_dump not found. Please install PostgreSQL client tools.\n" +
          "For Ubuntu/Debian: sudo apt-get install postgresql-client\n" +
          "For macOS: brew install postgresql"
        );
      }

      // Create backup using pg_dump
      const dumpCommand = `pg_dump "${DATABASE_URL}" > "${backupPath}"`;
      execSync(dumpCommand, { stdio: "inherit" });
      console.log(`✅ PostgreSQL backup created: ${backupPath}`);

    } else {
      throw new Error(`Unsupported database URL format: ${DATABASE_URL}`);
    }

    // Clean up old backups (keep only last 30 days)
    await cleanupOldBackups();

    // Get backup file size
    const { statSync } = await import("fs");
    const stats = statSync(backupPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`   File: ${backupPath}`);
    console.log(`   Size: ${sizeMB} MB`);
    console.log(`   Timestamp: ${timestamp}`);

    return backupPath;
  } catch (error: any) {
    console.error(`❌ Backup failed: ${error.message}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupOldBackups() {
  const { readdirSync, statSync, unlinkSync } = await import("fs");
  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  try {
    const files = readdirSync(BACKUP_DIR);
    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith("backup-")) {
        const filePath = join(BACKUP_DIR, file);
        const stats = statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > retentionMs) {
          unlinkSync(filePath);
          deletedCount++;
          console.log(`🗑️  Deleted old backup: ${file}`);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`\n🧹 Cleaned up ${deletedCount} old backup(s)`);
    }
  } catch (error: any) {
    console.warn(`⚠️  Failed to cleanup old backups: ${error.message}`);
  }
}

// Run backup
backupDatabase();

