/**
 * Internationalization (i18n) Audit Script
 * 
 * Audits all pages and components for i18n implementation
 * Identifies hardcoded strings, missing translations, and i18n setup issues
 * 
 * Usage:
 *   tsx scripts/audit-i18n.ts
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";
import { glob } from "glob";

interface AuditResult {
  file: string;
  issues: Issue[];
  hardcodedStrings: string[];
  hasI18n: boolean;
  usesTranslations: boolean;
}

interface Issue {
  type: "hardcoded-string" | "missing-i18n" | "inconsistent-usage" | "missing-config";
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  line?: number;
  code?: string;
}

const I18N_PATTERNS = {
  useTranslations: /useTranslations\(/,
  getTranslations: /getTranslations\(/,
  tFunction: /\bt\(/,
  nextIntl: /next-intl|nextIntl/,
  locale: /useLocale|getLocale/,
};

const HARDCODED_STRING_PATTERNS = [
  // Common UI text patterns
  /(?:>|children:\s*["'])([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
  // Button text
  /(?:Button|button).*?["']([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
  // Heading text
  /(?:h[1-6]|Heading).*?["']([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
  // Label text
  /(?:Label|label).*?["']([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
  // Placeholder text
  /placeholder=["']([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
  // Title/description
  /(?:title|description):\s*["']([A-Z][a-z]+(?:\s+[a-z]+)+)["']/g,
];

const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /coverage/,
  /test-results/,
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /e2e/,
];

const EXCLUDED_STRINGS = [
  "className",
  "className=",
  "href=",
  "src=",
  "alt=",
  "id=",
  "data-",
  "aria-",
  "role=",
  "type=",
  "name=",
  "value=",
  "key=",
  "ref=",
  "onClick",
  "onChange",
  "onSubmit",
  "useState",
  "useEffect",
  "useCallback",
  "useMemo",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "CSS",
  "HTML",
  "API",
  "URL",
  "HTTP",
  "HTTPS",
  "JSON",
  "XML",
  "SVG",
  "PNG",
  "JPG",
  "GIF",
  "PDF",
  "USD",
  "PKR",
  "EUR",
  "GBP",
];

function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(path));
}

function isExcludedString(str: string): boolean {
  return EXCLUDED_STRINGS.some((excluded) => str.includes(excluded));
}

function extractHardcodedStrings(content: string, filePath: string): string[] {
  const strings: string[] = [];
  const lines = content.split("\n");

  // Common patterns for hardcoded UI text
  const patterns = [
    // JSX text content
    />\s*([A-Z][a-z]+(?:\s+[a-z]+){1,10})\s*</g,
    // String literals in JSX props
    /(?:title|label|placeholder|aria-label|alt|description|text|content|message|error|success|warning|info):\s*["']([A-Z][a-z]+(?:\s+[a-z]+){1,10})["']/gi,
    // Template literals with text
    /`([A-Z][a-z]+(?:\s+[a-z]+){1,10})`/g,
    // Children prop with strings
    /children:\s*["']([A-Z][a-z]+(?:\s+[a-z]+){1,10})["']/g,
  ];

  lines.forEach((line, lineNum) => {
    // Skip comments
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    patterns.forEach((pattern) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 3 && !isExcludedString(match[1])) {
          strings.push(match[1].trim());
        }
      }
    });
  });

  return [...new Set(strings)]; // Remove duplicates
}

function checkI18nUsage(content: string): { hasI18n: boolean; usesTranslations: boolean } {
  const hasI18n = Object.values(I18N_PATTERNS).some((pattern) => pattern.test(content));
  const usesTranslations = I18N_PATTERNS.useTranslations.test(content) || 
                          I18N_PATTERNS.getTranslations.test(content) ||
                          I18N_PATTERNS.tFunction.test(content);

  return { hasI18n, usesTranslations };
}

function auditFile(filePath: string): AuditResult {
  const content = readFileSync(filePath, "utf-8");
  const hardcodedStrings = extractHardcodedStrings(content, filePath);
  const { hasI18n, usesTranslations } = checkI18nUsage(content);
  
  const issues: Issue[] = [];

  // Check for hardcoded strings
  if (hardcodedStrings.length > 0 && !usesTranslations) {
    issues.push({
      type: "hardcoded-string",
      severity: "high",
      message: `Found ${hardcodedStrings.length} potential hardcoded strings`,
    });
  }

  // Check if file should use i18n but doesn't
  if (!hasI18n && hardcodedStrings.length > 0) {
    issues.push({
      type: "missing-i18n",
      severity: "high",
      message: "File contains hardcoded strings but doesn't use i18n",
    });
  }

  // Check for inconsistent usage
  if (hasI18n && hardcodedStrings.length > 0) {
    issues.push({
      type: "inconsistent-usage",
      severity: "medium",
      message: "File uses i18n but still contains hardcoded strings",
    });
  }

  return {
    file: filePath,
    issues,
    hardcodedStrings,
    hasI18n,
    usesTranslations,
  };
}

async function auditAllFiles(): Promise<AuditResult[]> {
  console.log("🔍 Starting i18n audit...\n");

  const results: AuditResult[] = [];

  // Find all TypeScript/TSX files in app directory
  const files = await glob("app/**/*.{ts,tsx}", {
    ignore: ["**/node_modules/**", "**/.next/**", "**/coverage/**", "**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
  });

  console.log(`Found ${files.length} files to audit\n`);

  for (const file of files) {
    if (isExcludedPath(file)) {
      continue;
    }

    try {
      const result = auditFile(file);
      if (result.issues.length > 0 || result.hardcodedStrings.length > 0) {
        results.push(result);
      }
    } catch (error: any) {
      console.error(`Error auditing ${file}: ${error.message}`);
    }
  }

  return results;
}

function generateReport(results: AuditResult[]): string {
  const totalFiles = results.length;
  const filesWithIssues = results.filter((r) => r.issues.length > 0).length;
  const filesWithHardcodedStrings = results.filter((r) => r.hardcodedStrings.length > 0).length;
  const filesUsingI18n = results.filter((r) => r.usesTranslations).length;

  const criticalIssues = results.flatMap((r) => r.issues.filter((i) => i.severity === "critical"));
  const highIssues = results.flatMap((r) => r.issues.filter((i) => i.severity === "high"));
  const mediumIssues = results.flatMap((r) => r.issues.filter((i) => i.severity === "medium"));
  const lowIssues = results.flatMap((r) => r.issues.filter((i) => i.severity === "low"));

  const allHardcodedStrings = new Set<string>();
  results.forEach((r) => {
    r.hardcodedStrings.forEach((s) => allHardcodedStrings.add(s));
  });

  let report = `# Internationalization (i18n) Audit Report

**Generated:** ${new Date().toISOString()}

## Executive Summary

- **Total Files Audited:** ${totalFiles}
- **Files with Issues:** ${filesWithIssues}
- **Files with Hardcoded Strings:** ${filesWithHardcodedStrings}
- **Files Using i18n:** ${filesUsingI18n}
- **Unique Hardcoded Strings Found:** ${allHardcodedStrings.size}

## Issue Summary

| Severity | Count |
|----------|-------|
| Critical | ${criticalIssues.length} |
| High | ${highIssues.length} |
| Medium | ${mediumIssues.length} |
| Low | ${lowIssues.length} |
| **Total** | **${criticalIssues.length + highIssues.length + mediumIssues.length + lowIssues.length}** |

## i18n Configuration Status

`;

  // Check for i18n configuration
  const i18nConfigExists = existsSync(join(process.cwd(), "i18n"));
  const nextIntlInstalled = existsSync(join(process.cwd(), "node_modules", "next-intl"));

  report += `- **i18n Directory:** ${i18nConfigExists ? "✅ Exists" : "❌ Missing"}\n`;
  report += `- **next-intl Package:** ${nextIntlInstalled ? "✅ Installed" : "❌ Not Installed"}\n`;
  report += `- **Translation Files:** ${i18nConfigExists ? "Check i18n directory" : "N/A"}\n\n`;

  report += `## Detailed Findings\n\n`;

  // Group by issue type
  const byType = {
    "hardcoded-string": results.filter((r) => r.issues.some((i) => i.type === "hardcoded-string")),
    "missing-i18n": results.filter((r) => r.issues.some((i) => i.type === "missing-i18n")),
    "inconsistent-usage": results.filter((r) => r.issues.some((i) => i.type === "inconsistent-usage")),
  };

  report += `### Files with Hardcoded Strings (${byType["hardcoded-string"].length})\n\n`;
  byType["hardcoded-string"].slice(0, 20).forEach((result) => {
    report += `- **${result.file}**\n`;
    report += `  - Hardcoded strings: ${result.hardcodedStrings.length}\n`;
    if (result.hardcodedStrings.length > 0) {
      report += `  - Examples: ${result.hardcodedStrings.slice(0, 5).join(", ")}\n`;
    }
    report += `\n`;
  });

  report += `### Files Missing i18n (${byType["missing-i18n"].length})\n\n`;
  byType["missing-i18n"].slice(0, 20).forEach((result) => {
    report += `- **${result.file}**\n`;
    report += `  - Issues: ${result.issues.length}\n`;
    report += `\n`;
  });

  report += `## Recommendations\n\n`;

  if (!i18nConfigExists || !nextIntlInstalled) {
    report += `### 1. Set Up i18n Infrastructure\n`;
    report += `- Install next-intl: \`npm install next-intl\`\n`;
    report += `- Create i18n configuration directory\n`;
    report += `- Set up translation files (en.json, etc.)\n`;
    report += `- Configure Next.js for i18n\n\n`;
  }

  report += `### 2. Fix High-Priority Issues\n`;
  report += `- Replace hardcoded strings with translation keys\n`;
  report += `- Add useTranslations() hook to components\n`;
  report += `- Create translation files for all text\n\n`;

  report += `### 3. Standardize i18n Usage\n`;
  report += `- Use consistent translation key naming\n`;
  report += `- Group translations by feature/page\n`;
  report += `- Remove all hardcoded strings\n\n`;

  report += `## Next Steps\n\n`;
  report += `1. Review this audit report\n`;
  report += `2. Set up i18n infrastructure (if not done)\n`;
  report += `3. Create translation files\n`;
  report += `4. Fix issues file by file, starting with high-priority\n`;
  report += `5. Re-run audit to verify fixes\n\n`;

  report += `---\n*Run \`tsx scripts/audit-i18n.ts\` to regenerate this report.*\n`;

  return report;
}

async function main() {
  try {
    const results = await auditAllFiles();
    const report = generateReport(results);

    // Save report
    const reportPath = join(process.cwd(), "I18N_AUDIT_REPORT.md");
    const { writeFileSync } = await import("fs");
    writeFileSync(reportPath, report);

    console.log("✅ Audit complete!");
    console.log(`📄 Report saved to: ${reportPath}\n`);
    console.log(report);

  } catch (error: any) {
    console.error(`❌ Audit failed: ${error.message}`);
    process.exit(1);
  }
}

main();

