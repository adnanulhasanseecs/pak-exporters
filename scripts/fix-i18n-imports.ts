/**
 * Script to fix i18n imports in [locale] routes
 * Replaces next/navigation and next/link with @/i18n/routing
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const LOCALE_DIR = join(process.cwd(), "app", "[locale]");

function fixImportsInFile(filePath: string): boolean {
  try {
    let content = readFileSync(filePath, "utf-8");
    let modified = false;

    // Replace useRouter from next/navigation
    if (content.includes('useRouter') && content.includes('from "next/navigation"')) {
      content = content.replace(
        /import\s*{\s*useRouter[^}]*}\s*from\s*["']next\/navigation["']/g,
        'import { useRouter } from "@/i18n/routing"'
      );
      modified = true;
    }

    // Replace usePathname from next/navigation
    if (content.includes('usePathname') && content.includes('from "next/navigation"')) {
      content = content.replace(
        /import\s*{\s*usePathname[^}]*}\s*from\s*["']next\/navigation["']/g,
        'import { usePathname } from "@/i18n/routing"'
      );
      modified = true;
    }

    // Replace useSearchParams from next/navigation (keep this one from next/navigation as it's not in i18n routing)
    // Actually, useSearchParams should stay from next/navigation

    // Replace Link from next/link
    if (content.includes('Link') && content.includes('from "next/link"')) {
      // Check if it's a default import
      if (content.includes('import Link from "next/link"')) {
        content = content.replace(
          /import\s+Link\s+from\s*["']next\/link["']/g,
          'import { Link } from "@/i18n/routing"'
        );
        modified = true;
      }
      // Check if it's a named import
      if (content.includes('import { Link }') && content.includes('from "next/link"')) {
        content = content.replace(
          /import\s*{\s*Link\s*}\s*from\s*["']next\/link["']/g,
          'import { Link } from "@/i18n/routing"'
        );
        modified = true;
      }
    }

    // Replace redirect from next/navigation (keep redirect from next/navigation for server components)
    // Actually, redirect should stay from next/navigation for server components

    if (modified) {
      writeFileSync(filePath, content, "utf-8");
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

function processDirectory(dir: string): number {
  let fixedCount = 0;
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      fixedCount += processDirectory(fullPath);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      if (fixImportsInFile(fullPath)) {
        console.log(`Fixed: ${fullPath}`);
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

console.log("Fixing i18n imports in [locale] routes...");
const count = processDirectory(LOCALE_DIR);
console.log(`\nFixed ${count} files.`);

