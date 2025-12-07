/**
 * Test Coverage Analysis Script
 * 
 * Analyzes test coverage and generates a report
 * 
 * Usage:
 *   tsx scripts/test-coverage.ts
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface CoverageSummary {
  lines: { total: number; covered: number; pct: number };
  statements: { total: number; covered: number; pct: number };
  functions: { total: number; covered: number; pct: number };
  branches: { total: number; covered: number; pct: number };
}

const COVERAGE_GOALS = {
  utilities: 80,
  services: 80,
  components: 80,
  pages: 70,
  overall: 80,
};

async function analyzeCoverage() {
  console.log("📊 Analyzing test coverage...\n");

  try {
    // Run tests with coverage
    console.log("Running tests with coverage...");
    execSync("npm test -- --coverage", { stdio: "inherit" });

    // Read coverage summary
    const coveragePath = join(process.cwd(), "coverage", "coverage-summary.json");
    
    if (!existsSync(coveragePath)) {
      console.error("❌ Coverage summary not found. Run tests with --coverage first.");
      process.exit(1);
    }

    const coverageData = JSON.parse(readFileSync(coveragePath, "utf-8"));
    const summary: CoverageSummary = coverageData.total;

    // Calculate coverage by category
    const categories = {
      utilities: calculateCategoryCoverage(coverageData, ["lib/utils", "lib/constants", "lib/cn"]),
      services: calculateCategoryCoverage(coverageData, ["services/api"]),
      components: calculateCategoryCoverage(coverageData, ["components"]),
      pages: calculateCategoryCoverage(coverageData, ["app"]),
    };

    // Display results
    console.log("\n" + "=".repeat(60));
    console.log("📈 Test Coverage Report");
    console.log("=".repeat(60) + "\n");

    // Overall coverage
    console.log("Overall Coverage:");
    console.log(`  Lines:      ${summary.lines.pct.toFixed(2)}% (${summary.lines.covered}/${summary.lines.total})`);
    console.log(`  Statements: ${summary.statements.pct.toFixed(2)}% (${summary.statements.covered}/${summary.statements.total})`);
    console.log(`  Functions:  ${summary.functions.pct.toFixed(2)}% (${summary.functions.covered}/${summary.functions.total})`);
    console.log(`  Branches:   ${summary.branches.pct.toFixed(2)}% (${summary.branches.covered}/${summary.branches.total})`);

    // Category coverage
    console.log("\nCategory Coverage:");
    for (const [category, coverage] of Object.entries(categories)) {
      const goal = COVERAGE_GOALS[category as keyof typeof COVERAGE_GOALS];
      const status = coverage >= goal ? "✅" : "⚠️ ";
      console.log(`  ${status} ${category.padEnd(12)}: ${coverage.toFixed(2)}% (goal: ${goal}%)`);
    }

    // Overall goal
    const overallCoverage = summary.lines.pct;
    const overallStatus = overallCoverage >= COVERAGE_GOALS.overall ? "✅" : "⚠️ ";
    console.log(`\n  ${overallStatus} Overall:      ${overallCoverage.toFixed(2)}% (goal: ${COVERAGE_GOALS.overall}%)`);

    // Recommendations
    console.log("\n" + "=".repeat(60));
    console.log("💡 Recommendations:");
    console.log("=".repeat(60));

    const recommendations: string[] = [];

    if (categories.utilities < COVERAGE_GOALS.utilities) {
      recommendations.push(`- Add tests for utilities (current: ${categories.utilities.toFixed(2)}%, goal: ${COVERAGE_GOALS.utilities}%)`);
    }

    if (categories.services < COVERAGE_GOALS.services) {
      recommendations.push(`- Add tests for services (current: ${categories.services.toFixed(2)}%, goal: ${COVERAGE_GOALS.services}%)`);
    }

    if (categories.components < COVERAGE_GOALS.components) {
      recommendations.push(`- Add tests for components (current: ${categories.components.toFixed(2)}%, goal: ${COVERAGE_GOALS.components}%)`);
    }

    if (categories.pages < COVERAGE_GOALS.pages) {
      recommendations.push(`- Add tests for pages (current: ${categories.pages.toFixed(2)}%, goal: ${COVERAGE_GOALS.pages}%)`);
    }

    if (overallCoverage < COVERAGE_GOALS.overall) {
      recommendations.push(`- Improve overall coverage (current: ${overallCoverage.toFixed(2)}%, goal: ${COVERAGE_GOALS.overall}%)`);
    }

    if (recommendations.length === 0) {
      console.log("✅ All coverage goals met!");
    } else {
      recommendations.forEach((rec) => console.log(rec));
    }

    // Generate report file
    const reportPath = join(process.cwd(), "coverage-report.md");
    const report = generateMarkdownReport(summary, categories);
    writeFileSync(reportPath, report);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  } catch (error: any) {
    console.error(`❌ Error analyzing coverage: ${error.message}`);
    process.exit(1);
  }
}

function calculateCategoryCoverage(
  coverageData: any,
  paths: string[]
): number {
  let totalLines = 0;
  let coveredLines = 0;

  for (const [filePath, data] of Object.entries(coverageData)) {
    if (typeof data === "object" && data !== null && "lines" in data) {
      const file = filePath as string;
      if (paths.some((path) => file.includes(path))) {
        totalLines += (data as any).lines.total;
        coveredLines += (data as any).lines.covered;
      }
    }
  }

  return totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
}

function generateMarkdownReport(
  summary: CoverageSummary,
  categories: Record<string, number>
): string {
  const date = new Date().toISOString().split("T")[0];
  
  return `# Test Coverage Report

**Generated:** ${date}

## Overall Coverage

| Metric | Coverage | Covered | Total |
|--------|----------|---------|-------|
| Lines | ${summary.lines.pct.toFixed(2)}% | ${summary.lines.covered} | ${summary.lines.total} |
| Statements | ${summary.statements.pct.toFixed(2)}% | ${summary.statements.covered} | ${summary.statements.total} |
| Functions | ${summary.functions.pct.toFixed(2)}% | ${summary.functions.covered} | ${summary.functions.total} |
| Branches | ${summary.branches.pct.toFixed(2)}% | ${summary.branches.covered} | ${summary.branches.total} |

## Category Coverage

| Category | Coverage | Goal | Status |
|----------|----------|------|--------|
| Utilities | ${categories.utilities.toFixed(2)}% | ${COVERAGE_GOALS.utilities}% | ${categories.utilities >= COVERAGE_GOALS.utilities ? "✅" : "⚠️"} |
| Services | ${categories.services.toFixed(2)}% | ${COVERAGE_GOALS.services}% | ${categories.services >= COVERAGE_GOALS.services ? "✅" : "⚠️"} |
| Components | ${categories.components.toFixed(2)}% | ${COVERAGE_GOALS.components}% | ${categories.components >= COVERAGE_GOALS.components ? "✅" : "⚠️"} |
| Pages | ${categories.pages.toFixed(2)}% | ${COVERAGE_GOALS.pages}% | ${categories.pages >= COVERAGE_GOALS.pages ? "✅" : "⚠️"} |
| **Overall** | **${summary.lines.pct.toFixed(2)}%** | **${COVERAGE_GOALS.overall}%** | **${summary.lines.pct >= COVERAGE_GOALS.overall ? "✅" : "⚠️"}** |

## Coverage Goals

- ✅ Utilities: ${COVERAGE_GOALS.utilities}%+
- ✅ Services: ${COVERAGE_GOALS.services}%+
- ✅ Components: ${COVERAGE_GOALS.components}%+
- ✅ Pages: ${COVERAGE_GOALS.pages}%+
- ✅ Overall: ${COVERAGE_GOALS.overall}%+

## Next Steps

${generateRecommendations(categories, summary.lines.pct)}

---
*Run \`npm run test:coverage\` to regenerate this report.*
`;
}

function generateRecommendations(
  categories: Record<string, number>,
  overall: number
): string {
  const recommendations: string[] = [];

  if (categories.utilities < COVERAGE_GOALS.utilities) {
    recommendations.push(`- Focus on utilities: Add tests for \`lib/utils.ts\`, \`lib/constants.ts\`, and other utility functions`);
  }

  if (categories.services < COVERAGE_GOALS.services) {
    recommendations.push(`- Focus on services: Add tests for API service functions in \`services/api/\``);
  }

  if (categories.components < COVERAGE_GOALS.components) {
    recommendations.push(`- Focus on components: Add tests for React components in \`components/\``);
  }

  if (categories.pages < COVERAGE_GOALS.pages) {
    recommendations.push(`- Focus on pages: Add tests for page components in \`app/\``);
  }

  if (overall < COVERAGE_GOALS.overall) {
    recommendations.push(`- Improve overall coverage by adding tests across all categories`);
  }

  if (recommendations.length === 0) {
    return "✅ All coverage goals have been met!";
  }

  return recommendations.join("\n");
}

analyzeCoverage();

