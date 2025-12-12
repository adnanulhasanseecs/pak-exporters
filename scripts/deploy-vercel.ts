/**
 * Vercel Deployment Script
 * 
 * Comprehensive pre-deployment checks and deployment automation.
 * Combines all layers from FINAL_SOLUTION_SUMMARY.md and deployment guides.
 * 
 * Usage:
 *   npm run deploy:vercel          # Preview deployment
 *   npm run deploy:vercel -- --prod # Production deployment
 */

import { execSync } from "child_process";
import { existsSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: number, message: string) {
  log(`\n${step}️⃣  ${message}`, "cyan");
}

function logSuccess(message: string) {
  log(`   ✅ ${message}`, "green");
}

function logError(message: string) {
  log(`   ❌ ${message}`, "red");
}

function logWarning(message: string) {
  log(`   ⚠️  ${message}`, "yellow");
}

function logInfo(message: string) {
  log(`   ℹ️  ${message}`, "blue");
}

// Check if command exists
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync(`where ${command}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}

// Run command and return output
function runCommand(
  command: string,
  options: { silent?: boolean; capture?: boolean; cwd?: string } = {}
): string {
  try {
    // If capture is true, we capture stdout while still showing stderr
    // If silent is true, we capture everything without showing
    // Otherwise, we show everything but don't capture (returns empty string)
    const stdioOption: "pipe" | "inherit" | ["inherit", "pipe", "inherit"] = options.capture
      ? ["inherit", "pipe", "inherit"] // stdin: inherit, stdout: pipe, stderr: inherit
      : options.silent
      ? "pipe"
      : "inherit";

    const output = execSync(command, {
      stdio: stdioOption,
      cwd: options.cwd || process.cwd(),
      encoding: "utf-8",
    });

    // When using pipe for stdout, output is a string
    // When using inherit, output is empty string or Buffer
    if (options.capture && typeof output === "string") {
      // Log the captured output so user can see it
      console.log(output);
      return output.trim();
    }

    return typeof output === "string" ? output.trim() : "";
  } catch (error: any) {
    // Always throw errors unless explicitly silenced
    if (!options.silent) {
      throw error;
    }
    return "";
  }
}

// Main deployment function
async function deploy() {
  const args = process.argv.slice(2);
  const isProduction = args.includes("--prod") || args.includes("--production");
  const skipChecks = args.includes("--skip-checks");

  log("\n" + "=".repeat(60), "bright");
  log("🚀 Vercel Deployment Script", "bright");
  log("=".repeat(60) + "\n", "bright");

  if (isProduction) {
    logWarning("PRODUCTION DEPLOYMENT MODE");
    logInfo("This will deploy to production. Make sure you're ready!\n");
  } else {
    logInfo("Preview deployment mode (use --prod for production)\n");
  }

  // ============================================================
  // LAYER 1: Pre-Deployment Checks (from FINAL_SOLUTION_SUMMARY.md)
  // ============================================================
  
  if (!skipChecks) {
    logStep(1, "Pre-Deployment Checks");

    // 1.1: Check Git status (only tracked files)
    logInfo("Checking Git status...");
    try {
      // Check for modified tracked files (staged or unstaged)
      const modifiedFiles = runCommand("git diff --name-only", { silent: true });
      const stagedFiles = runCommand("git diff --cached --name-only", { silent: true });
      
      if (modifiedFiles || stagedFiles) {
        logWarning("You have uncommitted changes to tracked files:");
        if (modifiedFiles) {
          console.log(modifiedFiles.split("\n").map((f: string) => `  M ${f}`).join("\n"));
        }
        if (stagedFiles) {
          console.log(stagedFiles.split("\n").map((f: string) => `  A ${f}`).join("\n"));
        }
        logError("Please commit or stash your changes before deploying.");
        process.exit(1);
      }
      logSuccess("No uncommitted changes to tracked files");
    } catch (error) {
      logWarning("Not a Git repository or Git not available");
    }

    // 1.2: Check Node.js version
    logInfo("Checking Node.js version...");
    try {
      const nodeVersion = runCommand("node --version", { silent: true });
      const majorVersion = parseInt(nodeVersion.replace("v", "").split(".")[0]);
      if (majorVersion < 18) {
        logError(`Node.js ${nodeVersion} detected. Node.js 18+ is required.`);
        process.exit(1);
      }
      logSuccess(`Node.js ${nodeVersion} (required: 18+)`);
    } catch (error) {
      logError("Could not check Node.js version");
      process.exit(1);
    }

    // 1.3: Clean build cache (matches Vercel's clean build)
    logInfo("Cleaning build cache...");
    const nextDir = join(process.cwd(), ".next");
    if (existsSync(nextDir)) {
      rmSync(nextDir, { recursive: true, force: true });
      logSuccess("Cleared .next directory");
    } else {
      logSuccess("No .next directory to clean");
    }

    // 1.4: Validate file encoding
    logInfo("Validating file encoding...");
    try {
      runCommand("npm run validate:encoding");
      logSuccess("File encoding validation passed");
    } catch (error) {
      logError("File encoding validation failed!");
      process.exit(1);
    }

    // 1.5: TypeScript strict check (from FINAL_SOLUTION_SUMMARY.md)
    logInfo("Running strict TypeScript check...");
    try {
      runCommand("npm run type-check:strict");
      logSuccess("TypeScript strict check passed");
    } catch (error) {
      logError("TypeScript strict check failed!");
      logInfo("Fix TypeScript errors before deploying.");
      process.exit(1);
    }

    // 1.6: Full build check (matches Vercel's build process)
    logInfo("Running Vercel-compatible build check...");
    try {
      runCommand("npm run build:check");
      logSuccess("Build check passed - ready for Vercel!");
    } catch (error) {
      logError("Build check failed!");
      logInfo("This is the same check Vercel runs. Fix errors before deploying.");
      process.exit(1);
    }
  } else {
    logWarning("Skipping pre-deployment checks (--skip-checks flag)");
  }

  // ============================================================
  // LAYER 2: Vercel Authentication Check
  // ============================================================
  
  logStep(2, "Vercel Authentication");

  // 2.1: Check if Vercel CLI is installed
  logInfo("Checking Vercel CLI...");
  if (!commandExists("vercel")) {
    logError("Vercel CLI not found!");
    logInfo("Install it with: npm i -g vercel");
    process.exit(1);
  }
  logSuccess("Vercel CLI installed");

  // 2.2: Check authentication
  logInfo("Checking Vercel authentication...");
  try {
    const whoami = runCommand("vercel whoami", { silent: true });
    logSuccess(`Authenticated as: ${whoami}`);
  } catch (error) {
    logError("Not authenticated with Vercel!");
    logInfo("Run: vercel login");
    process.exit(1);
  }

  // ============================================================
  // LAYER 3: Environment Variables Check
  // ============================================================
  
  logStep(3, "Environment Variables Check");

  const requiredEnvVars = [
    "JWT_SECRET",
    "NEXT_PUBLIC_APP_URL",
  ];

  const optionalEnvVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_GA_ID",
  ];

  logInfo("Checking required environment variables in Vercel...");
  try {
    const envList = runCommand("vercel env ls", { silent: true });
    
    let missingRequired: string[] = [];
    for (const envVar of requiredEnvVars) {
      if (!envList.includes(envVar)) {
        missingRequired.push(envVar);
      }
    }

    if (missingRequired.length > 0) {
      logWarning("Missing required environment variables:");
      missingRequired.forEach((envVar) => {
        logWarning(`  - ${envVar}`);
      });
      logInfo("Set them with: vercel env add <VARIABLE_NAME>");
      logInfo("Or set them in Vercel Dashboard → Settings → Environment Variables");
      
      if (isProduction) {
        logError("Cannot deploy to production without required environment variables!");
        process.exit(1);
      } else {
        logWarning("Continuing with preview deployment (some features may not work)");
      }
    } else {
      logSuccess("All required environment variables are set");
    }

    // Check optional variables
    const missingOptional: string[] = [];
    for (const envVar of optionalEnvVars) {
      if (!envList.includes(envVar)) {
        missingOptional.push(envVar);
      }
    }

    if (missingOptional.length > 0) {
      logInfo("Optional environment variables not set (non-blocking):");
      missingOptional.forEach((envVar) => {
        logInfo(`  - ${envVar}`);
      });
    }
  } catch (error) {
    logWarning("Could not check environment variables (non-blocking)");
  }

  // ============================================================
  // LAYER 4: Deployment
  // ============================================================
  
  logStep(4, "Deploying to Vercel");

  const deployCommand = isProduction ? "vercel --prod --yes" : "vercel --yes";
  
  logInfo(`Deployment mode: ${isProduction ? "PRODUCTION" : "PREVIEW"}`);
  logInfo("Starting deployment...\n");

  try {
    // Use capture: true to capture output while still showing it
    const deploymentOutput = runCommand(deployCommand, { capture: true });
    
    // Extract deployment URL from output
    const urlMatch = deploymentOutput.match(/https:\/\/[^\s]+\.vercel\.app/g);
    if (urlMatch && urlMatch.length > 0) {
      const deploymentUrl = urlMatch[0];
      logSuccess(`Deployment successful!`);
      log(`\n   🌐 URL: ${deploymentUrl}`, "bright");
      
      // Save deployment URL to a file for reference
      writeFileSync(
        join(process.cwd(), ".vercel-deployment-url.txt"),
        deploymentUrl
      );
    } else {
      logSuccess("Deployment completed");
      logInfo("Check Vercel Dashboard for deployment URL");
      logInfo("Could not extract URL from output - check Vercel Dashboard");
    }
  } catch (error: any) {
    logError("Deployment failed!");
    logInfo("Check the error messages above for details.");
    logInfo("Common issues:");
    logInfo("  - Build errors (should be caught by pre-deployment checks)");
    logInfo("  - Environment variables missing");
    logInfo("  - Network issues");
    process.exit(1);
  }

  // ============================================================
  // LAYER 5: Post-Deployment Verification
  // ============================================================
  
  logStep(5, "Post-Deployment Verification");

  logInfo("Checking deployment status...");
  try {
    const deployments = runCommand("vercel ls --limit 1", { silent: true });
    
    // Check if latest deployment is successful
    if (deployments.includes("Ready") || deployments.includes("●")) {
      logSuccess("Latest deployment is ready");
    } else if (deployments.includes("Error")) {
      logError("Latest deployment has errors!");
      logInfo("Check Vercel Dashboard for details: https://vercel.com/dashboard");
    } else {
      logWarning("Could not determine deployment status");
      logInfo("Check Vercel Dashboard: https://vercel.com/dashboard");
    }
  } catch (error) {
    logWarning("Could not check deployment status (non-blocking)");
  }

  // ============================================================
  // Summary
  // ============================================================
  
  log("\n" + "=".repeat(60), "bright");
  log("✅ Deployment Process Complete!", "green");
  log("=".repeat(60) + "\n", "bright");

  logInfo("Next steps:");
  logInfo("1. Visit your deployment URL to verify it's working");
  logInfo("2. Test key pages (homepage, products, categories)");
  logInfo("3. Check Vercel Dashboard for detailed logs");
  logInfo("4. Monitor for any runtime errors\n");

  if (isProduction) {
    logWarning("PRODUCTION DEPLOYMENT - Monitor closely for the first few hours!");
  }

  log("🎉 All done!\n", "green");
}

// Run the deployment
deploy().catch((error) => {
  logError("Deployment script failed!");
  console.error(error);
  process.exit(1);
});

