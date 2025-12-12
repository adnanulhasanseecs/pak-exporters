/**
 * Vercel Build Check Script
 * 
 * This script ensures local builds catch the same errors as Vercel.
 * It runs a clean build with strict TypeScript checking.
 */

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { join } from "path";

console.log("🔍 Running Vercel-compatible build check...\n");

// Step 1: Clean build cache
console.log("1️⃣  Cleaning build cache...");
const nextDir = join(process.cwd(), ".next");
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("   ✅ Cleared .next directory\n");
} else {
  console.log("   ✅ No .next directory to clean\n");
}

// Step 2: Run TypeScript check with strict settings
console.log("2️⃣  Running strict TypeScript check...");
try {
  execSync("npx tsc --noEmit --strict", { 
    stdio: "inherit",
    cwd: process.cwd()
  });
  console.log("   ✅ TypeScript check passed\n");
} catch (error) {
  console.error("   ❌ TypeScript check failed!");
  process.exit(1);
}

// Step 3: Run Next.js build (this is what Vercel runs)
console.log("3️⃣  Running Next.js build (same as Vercel)...");
try {
  execSync("npm run build", { 
    stdio: "inherit",
    cwd: process.cwd(),
    env: {
      ...process.env,
      // Ensure production-like environment
      NODE_ENV: "production",
      // Disable caching to catch all errors
      NEXT_TELEMETRY_DISABLED: "1",
    }
  });
  console.log("\n   ✅ Build check passed! Ready for Vercel deployment.");
  process.exit(0);
} catch (error) {
  console.error("\n   ❌ Build check failed! Fix errors before committing.");
  process.exit(1);
}

