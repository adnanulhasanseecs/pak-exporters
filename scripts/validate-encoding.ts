/**
 * File Encoding Validation Script
 * Validates that all TypeScript/TSX files are properly UTF-8 encoded without BOM
 * 
 * This script prevents build failures caused by encoding issues
 * Run before build: npm run validate:encoding
 */

import * as fs from "fs";
import * as path from "path";

const UTF8_BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const UTF16_LE_BOM = Buffer.from([0xff, 0xfe]);
const UTF16_BE_BOM = Buffer.from([0xfe, 0xff]);
const VALID_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const IGNORE_PATTERNS = [
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  ".git",
];

interface ValidationResult {
  file: string;
  error: string;
}

const errors: ValidationResult[] = [];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function validateFile(filePath: string): void {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // Check for UTF-16 BOM (most common issue)
    if (buffer.length >= 2 && buffer.subarray(0, 2).equals(UTF16_LE_BOM)) {
      errors.push({
        file: filePath,
        error: "File is UTF-16 LE encoded (should be UTF-8). Convert to UTF-8 without BOM.",
      });
      return;
    }
    
    if (buffer.length >= 2 && buffer.subarray(0, 2).equals(UTF16_BE_BOM)) {
      errors.push({
        file: filePath,
        error: "File is UTF-16 BE encoded (should be UTF-8). Convert to UTF-8 without BOM.",
      });
      return;
    }
    
    // Check for UTF-8 BOM
    if (buffer.length >= 3 && buffer.subarray(0, 3).equals(UTF8_BOM)) {
      errors.push({
        file: filePath,
        error: "File contains UTF-8 BOM (Byte Order Mark). Remove BOM.",
      });
      return;
    }

    // Try to decode as UTF-8
    try {
      buffer.toString("utf8");
    } catch (decodeError) {
      errors.push({
        file: filePath,
        error: `Invalid UTF-8 encoding: ${decodeError instanceof Error ? decodeError.message : "Unknown error"}`,
      });
    }
  } catch (readError) {
    errors.push({
      file: filePath,
      error: `Failed to read file: ${readError instanceof Error ? readError.message : "Unknown error"}`,
    });
  }
}

function walkDirectory(dir: string): void {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (shouldIgnore(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (VALID_EXTENSIONS.includes(ext)) {
          validateFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
}

function main() {
  const startTime = Date.now();
  const appDir = path.join(process.cwd(), "app");
  const componentsDir = path.join(process.cwd(), "components");
  const libDir = path.join(process.cwd(), "lib");
  const servicesDir = path.join(process.cwd(), "services");

  console.log("🔍 Validating file encoding...");
  console.log("Checking directories: app/, components/, lib/, services/");

  // Validate key directories
  if (fs.existsSync(appDir)) {
    walkDirectory(appDir);
  }
  if (fs.existsSync(componentsDir)) {
    walkDirectory(componentsDir);
  }
  if (fs.existsSync(libDir)) {
    walkDirectory(libDir);
  }
  if (fs.existsSync(servicesDir)) {
    walkDirectory(servicesDir);
  }

  const duration = Date.now() - startTime;

  if (errors.length > 0) {
    console.error("\n❌ Encoding validation failed!");
    console.error(`Found ${errors.length} file(s) with encoding issues:\n`);
    
    errors.forEach(({ file, error }) => {
      const relativePath = path.relative(process.cwd(), file);
      console.error(`  ${relativePath}`);
      console.error(`    Error: ${error}\n`);
    });

    console.error("💡 Fix encoding issues before building:");
    console.error("   1. Open the file in your editor");
    console.error("   2. Save as UTF-8 without BOM");
    console.error("   3. Or use: npm run fix:encoding");
    
    process.exit(1);
  }

  console.log(`✅ All files validated successfully (${duration}ms)`);
  process.exit(0);
}

main();

