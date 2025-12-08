/**
 * Auto-fix Common Errors Script
 * Automatically fixes common, safe-to-fix errors
 * 
 * Usage: npm run fix-errors
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function findTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules" && file !== ".next") {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

console.log("🔧 Auto-fixing common errors...\n");

const fixes: string[] = [];
let filesFixed = 0;

const tsxFiles = findTsxFiles("app").filter(
  (file) => !file.includes(".test.") && !file.includes(".spec.")
);

tsxFiles.forEach((file) => {
  try {
    let content = readFileSync(file, "utf-8");
    let modified = false;
    const lines = content.split("\n");
    const newLines: string[] = [];
    
    lines.forEach((line, index) => {
      let newLine = line;
      
      // Fix: Remove unused useTranslations
      const unusedTNav = /const\s+tNav\s*=\s*useTranslations\(["']nav["']\);/;
      if (unusedTNav.test(line) && !content.includes("tNav(")) {
        newLine = "";
        modified = true;
        fixes.push(`${file}:${index + 1} - Removed unused tNav`);
      }
      
      // Fix: Remove unused useState variables (if only setter is used)
      const unusedState = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/;
      const match = line.match(unusedState);
      if (match) {
        const varName = match[1];
        const regex = new RegExp(`\\b${varName}\\b`, "g");
        const matches = content.match(regex) || [];
        // If only appears in declaration and setter call, it's unused
        if (matches.length <= 2 && !varName.startsWith("_")) {
          // Check if setter is used
          const setterName = `set${varName.charAt(0).toUpperCase() + varName.slice(1)}`;
          const setterUsed = content.includes(`${setterName}(`);
          if (!setterUsed) {
            newLine = "";
            modified = true;
            fixes.push(`${file}:${index + 1} - Removed unused state: ${varName}`);
          }
        }
      }
      
      // Fix: Add missing useTranslations import
      if (line.includes("useTranslations(") && !content.includes("from \"next-intl\"")) {
        // Find import section and add it
        const importIndex = content.indexOf("import");
        if (importIndex !== -1) {
          const afterImports = content.substring(importIndex);
          if (!afterImports.includes("useTranslations")) {
            // This is complex, skip for now
          }
        }
      }
      
      newLines.push(newLine);
    });
    
    if (modified) {
      const newContent = newLines.filter(line => line !== "").join("\n");
      writeFileSync(file, newContent, "utf-8");
      filesFixed++;
    }
  } catch (error) {
    // Skip files that can't be read
  }
});

console.log(`✅ Fixed ${fixes.length} issues in ${filesFixed} files\n`);

if (fixes.length > 0) {
  console.log("Fixed issues:");
  fixes.forEach(fix => console.log(`  - ${fix}`));
}

