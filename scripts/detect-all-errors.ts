/**
 * Fast Error Detection Script
 * Detects all TypeScript, ESLint, and common errors without running full build
 * 
 * Usage: npm run detect-errors
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

interface ErrorReport {
  type: "typescript" | "eslint" | "unused-import" | "missing-import" | "encoding";
  file: string;
  line?: number;
  message: string;
}

const errors: ErrorReport[] = [];

console.log("🔍 Fast Error Detection Starting...\n");

// 1. TypeScript Type Checking (fast - no emit)
console.log("1️⃣  Running TypeScript type check...");
try {
  const output = execSync("tsc --noEmit 2>&1", { 
    stdio: "pipe",
    encoding: "utf-8"
  }).toString();
  
  if (output.trim()) {
    const lines = output.split("\n");
    lines.forEach((line: string) => {
      // Match TypeScript error format: file(line,col): error TS####: message
      // Also handle multi-line errors and continuation lines
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS\d+:\s+(.+)$/);
      if (match) {
        const [, file, lineNum, , message] = match;
        errors.push({
          type: "typescript",
          file: file.trim(),
          line: parseInt(lineNum),
          message: message.trim(),
        });
      }
    });
    const tsErrors = errors.filter(e => e.type === "typescript").length;
    console.log(`   ❌ TypeScript: Found ${tsErrors} errors\n`);
  } else {
    console.log("   ✅ TypeScript: No errors\n");
  }
} catch (error: any) {
  // TypeScript compiler exits with non-zero code when errors are found
  // So we need to capture both stdout and stderr
  const output = error.stdout?.toString() || error.stderr?.toString() || error.toString() || "";
  const lines = output.split("\n");
  
  lines.forEach((line: string) => {
    // Match TypeScript error format: file(line,col): error TS####: message
    // Handle both Windows and Unix paths
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+TS\d+:\s+(.+)$/);
    if (match) {
      const [, file, lineNum, , message] = match;
      // Normalize file paths (handle both / and \ separators)
      const normalizedFile = file.trim().replace(/\\/g, "/");
      errors.push({
        type: "typescript",
        file: normalizedFile,
        line: parseInt(lineNum),
        message: message.trim(),
      });
    }
  });
  
  const tsErrors = errors.filter(e => e.type === "typescript").length;
  console.log(`   ❌ TypeScript: Found ${tsErrors} errors\n`);
}

// 2. ESLint Check (fast - no fix)
console.log("2️⃣  Running ESLint...");
try {
  execSync("eslint . --ext .ts,.tsx --max-warnings 0 --format compact", {
    stdio: "pipe",
    encoding: "utf-8",
  });
  console.log("   ✅ ESLint: No errors\n");
} catch (error: any) {
  const output = error.stdout?.toString() || error.stderr?.toString() || "";
  const lines = output.split("\n").filter((line: string) => line.trim());
  
  lines.forEach((line: string) => {
    // ESLint compact format: file:line:col: severity message (rule)
    const match = line.match(/^(.+?):(\d+):(\d+):\s+(.+?)\s+\((.+?)\)$/);
    if (match) {
      const [, file, lineNum, , message, rule] = match;
      errors.push({
        type: "eslint",
        file: file.trim(),
        line: parseInt(lineNum),
        message: `${message.trim()} (${rule.trim()})`,
      });
    }
  });
  
  console.log(`   ❌ ESLint: Found ${errors.filter(e => e.type === "eslint").length} errors\n`);
}

// Helper function to recursively find TS/TSX files
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

// 3. Check for common unused import patterns
console.log("3️⃣  Checking for unused imports...");
const tsxFiles = findTsxFiles("app");

tsxFiles.forEach((file) => {
  try {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    
    // Check for common unused patterns
    lines.forEach((line, index) => {
      // Unused useTranslations
      if (line.includes("useTranslations") && !content.includes(`t(`) && !content.includes(`tCommon(`) && !content.includes(`tNav(`)) {
        const importMatch = line.match(/const\s+(\w+)\s*=\s*useTranslations/);
        if (importMatch && !importMatch[1].startsWith("_")) {
          errors.push({
            type: "unused-import",
            file,
            line: index + 1,
            message: `Unused translation hook: ${importMatch[1]}`,
          });
        }
      }
      
      // Unused useState variables
      const useStateMatch = line.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/);
      if (useStateMatch) {
        const varName = useStateMatch[1];
        const regex = new RegExp(`\\b${varName}\\b`, "g");
        const matches = content.match(regex) || [];
        if (matches.length <= 2) { // Only declaration and setter
          errors.push({
            type: "unused-import",
            file,
            line: index + 1,
            message: `Unused state variable: ${varName}`,
          });
        }
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
});

if (errors.filter(e => e.type === "unused-import").length > 0) {
  console.log(`   ⚠️  Found ${errors.filter(e => e.type === "unused-import").length} potential unused variables\n`);
} else {
  console.log("   ✅ No obvious unused variables\n");
}

// 4. Check for missing imports (common patterns)
console.log("4️⃣  Checking for missing imports...");

tsxFiles.forEach((file) => {
  try {
    const content = readFileSync(file, "utf-8");
    const lines = content.split("\n");
    const imports = content.match(/^import\s+.*from\s+["'](.+?)["']/gm) || [];
    const importSources = imports.map(imp => {
      const match = imp.match(/from\s+["'](.+?)["']/);
      return match ? match[1] : "";
    });
    
    lines.forEach((line, index) => {
      // Check for useTranslations usage without import
      if (line.includes("useTranslations(") && !importSources.some(src => src.includes("next-intl"))) {
        errors.push({
          type: "missing-import",
          file,
          line: index + 1,
          message: "Missing import: useTranslations from 'next-intl'",
        });
      }
      
      // Check for useRouter from wrong source
      if (line.includes("useRouter()") && !importSources.some(src => src.includes("i18n/routing") || src.includes("next/navigation"))) {
        errors.push({
          type: "missing-import",
          file,
          line: index + 1,
          message: "Missing import: useRouter",
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
});

if (errors.filter(e => e.type === "missing-import").length > 0) {
  console.log(`   ⚠️  Found ${errors.filter(e => e.type === "missing-import").length} potential missing imports\n`);
} else {
  console.log("   ✅ No obvious missing imports\n");
}

// 5. Encoding validation
console.log("5️⃣  Validating file encoding...");
try {
  execSync("npm run validate:encoding", { stdio: "pipe" });
  console.log("   ✅ Encoding: All files valid\n");
} catch (error: any) {
  const output = error.stdout?.toString() || error.stderr?.toString() || "";
  const encodingErrors = output.split("\n").filter((line: string) => 
    line.includes("Encoding error") || line.includes("UTF-16") || line.includes("BOM")
  );
  
  encodingErrors.forEach((line: string) => {
    const match = line.match(/Encoding error in (.+?):/);
    if (match) {
      errors.push({
        type: "encoding",
        file: match[1],
        message: line,
      });
    }
  });
  
  console.log(`   ❌ Encoding: Found ${errors.filter(e => e.type === "encoding").length} errors\n`);
}

// Generate reports
const reportDir = "error-reports";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const jsonReportPath = `${reportDir}/errors-${timestamp}.json`;
const mdReportPath = `${reportDir}/errors-${timestamp}.md`;
const latestJsonPath = `${reportDir}/errors-latest.json`;
const latestMdPath = `${reportDir}/errors-latest.md`;

// Ensure report directory exists
try {
  mkdirSync(reportDir, { recursive: true });
} catch (e) {
  // Directory might already exist
}

// Group errors by type and file
const byType = errors.reduce((acc, error) => {
  acc[error.type] = (acc[error.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const byFile = errors.reduce((acc, error) => {
  if (!acc[error.file]) acc[error.file] = [];
  acc[error.file].push(error);
  return acc;
}, {} as Record<string, ErrorReport[]>);

// Generate JSON report
const jsonReport = {
  timestamp: new Date().toISOString(),
  totalErrors: errors.length,
  summary: byType,
  errorsByFile: byFile,
  errors: errors,
};

// Generate Markdown report
let mdReport = `# Error Detection Report\n\n`;
mdReport += `**Generated:** ${new Date().toISOString()}\n`;
mdReport += `**Total Errors:** ${errors.length}\n\n`;

mdReport += `## Summary by Type\n\n`;
Object.entries(byType).forEach(([type, count]) => {
  mdReport += `- **${type}**: ${count}\n`;
});

mdReport += `\n## Errors by File\n\n`;
Object.entries(byFile).forEach(([file, fileErrors]) => {
  mdReport += `### ${file}\n\n`;
  fileErrors.forEach((error) => {
    const lineInfo = error.line ? `:${error.line}` : "";
    mdReport += `- **${error.type.toUpperCase()}**${lineInfo}: ${error.message}\n`;
  });
  mdReport += `\n`;
});

mdReport += `\n## Quick Fix Commands\n\n`;
mdReport += `\`\`\`bash\n`;
mdReport += `# Auto-fix some common errors\n`;
mdReport += `npm run fix-errors\n\n`;
mdReport += `# Run type check only\n`;
mdReport += `npx tsc --noEmit\n\n`;
mdReport += `# Run ESLint with auto-fix\n`;
mdReport += `npm run lint:fix\n`;
mdReport += `\`\`\`\n`;

// Save reports
writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2), "utf-8");
writeFileSync(mdReportPath, mdReport, "utf-8");
writeFileSync(latestJsonPath, JSON.stringify(jsonReport, null, 2), "utf-8");
writeFileSync(latestMdPath, mdReport, "utf-8");

// Console summary
console.log("=".repeat(60));
console.log("📊 ERROR SUMMARY");
console.log("=".repeat(60));

if (errors.length === 0) {
  console.log("✅ No errors detected! Build should succeed.\n");
  process.exit(0);
} else {
  console.log(`\n❌ Total Errors: ${errors.length}\n`);
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("📁 ERROR REPORTS SAVED");
  console.log("=".repeat(60));
  console.log(`\n📄 JSON Report: ${jsonReportPath}`);
  console.log(`📄 Markdown Report: ${mdReportPath}`);
  console.log(`📄 Latest JSON: ${latestJsonPath}`);
  console.log(`📄 Latest Markdown: ${latestMdPath}`);
  console.log("\n💡 Open the Markdown file for easy reading and fixing!");
  console.log("=".repeat(60) + "\n");
  
  process.exit(1);
}

