/**
 * Pre-Deployment Validation Script
 * Validates all requirements for Vercel deployment BEFORE committing/deploying
 * 
 * Usage:
 *   npm run validate:vercel
 *   Or run automatically in prebuild/precommit hooks
 */

import { existsSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local (Vercel) or .env (local)
const envLocalPath = join(process.cwd(), ".env.local");
const envPath = join(process.cwd(), ".env");

if (existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
  console.log("📁 Loaded .env.local (Vercel environment variables)\n");
} else if (existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
  console.log("📁 Loaded .env (local environment variables)\n");
}

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const results: ValidationResult = {
  passed: true,
  errors: [],
  warnings: [],
};

function addError(message: string) {
  results.passed = false;
  results.errors.push(message);
  console.error(`❌ ${message}`);
}

function addWarning(message: string) {
  results.warnings.push(message);
  console.warn(`⚠️  ${message}`);
}

function addSuccess(message: string) {
  console.log(`✅ ${message}`);
}

/**
 * Validate environment variables
 */
function validateEnvironmentVariables() {
  console.log("\n📋 Validating Environment Variables...\n");

  // Check if we're running locally or on Vercel
  const isVercel = !!process.env.VERCEL;
  const hasEnvLocal = existsSync(join(process.cwd(), ".env.local"));
  
  if (!isVercel && !hasEnvLocal) {
    console.log("⚠️  Running locally without .env.local");
    console.log("   Validation will check local .env file (if exists)");
    console.log("   For Vercel validation, run: vercel env pull .env.local first\n");
  }

  const requiredVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "NEXT_PUBLIC_APP_URL",
  ];
  
  const recommendedVars = [
    "DATABASE_PRISMA_DATABASE_URL", // Optional but recommended
  ];

  // Optional variables are checked individually below

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      // Only error if we're on Vercel or have .env.local (meaning we expect vars)
      if (isVercel || hasEnvLocal) {
        addError(`Required environment variable ${varName} is not set`);
      } else {
        addWarning(`${varName} is not set locally (will be checked on Vercel)`);
      }
    } else {
      addSuccess(`${varName} is set`);
      
      // Validate specific variables
      if (varName === "DATABASE_URL") {
        if (value.includes("localhost")) {
          addError(`DATABASE_URL points to localhost: ${value.substring(0, 50)}...`);
          addError("   This will NOT work on Vercel. Use Vercel Postgres or Prisma Accelerate.");
        } else if (value.includes("file:")) {
          addError(`DATABASE_URL points to a file (SQLite): ${value.substring(0, 50)}...`);
          addError("   SQLite is not supported on Vercel. Use PostgreSQL.");
        } else if (!value.includes("postgres://") && !value.includes("postgresql://")) {
          addWarning(`DATABASE_URL format may be incorrect: ${value.substring(0, 50)}...`);
        } else {
          addSuccess(`DATABASE_URL format looks correct (PostgreSQL)`);
        }
      }
      
      if (varName === "NEXT_PUBLIC_APP_URL") {
        if (value.includes("localhost")) {
          addError(`NEXT_PUBLIC_APP_URL points to localhost: ${value}`);
          addError("   This will cause ECONNREFUSED errors on Vercel.");
          addError("   Set it to your Vercel deployment URL (e.g., https://pak-exporters.vercel.app)");
        } else if (!value.startsWith("https://")) {
          addWarning(`NEXT_PUBLIC_APP_URL should use HTTPS: ${value}`);
        } else {
          addSuccess(`NEXT_PUBLIC_APP_URL format looks correct: ${value}`);
        }
      }
      
      if (varName === "JWT_SECRET") {
        if (value.length < 32) {
          addError(`JWT_SECRET is too short (${value.length} chars). Minimum 32 characters required.`);
        } else {
          addSuccess(`JWT_SECRET length is sufficient (${value.length} chars)`);
        }
      }
    }
  }

  // Check recommended variables
  for (const varName of recommendedVars) {
    const value = process.env[varName];
    if (!value) {
      if (isVercel || hasEnvLocal) {
        addWarning(`${varName} is not set (recommended for Vercel)`);
        if (varName === "DATABASE_PRISMA_DATABASE_URL") {
          addWarning("   Consider using Prisma Accelerate for better serverless performance");
        }
      }
    } else {
      if (varName === "DATABASE_PRISMA_DATABASE_URL") {
        addSuccess("DATABASE_PRISMA_DATABASE_URL is set (Prisma Accelerate)");
      }
    }
  }

  // Check VERCEL_URL (should be set automatically by Vercel)
  if (process.env.VERCEL_URL) {
    addSuccess(`VERCEL_URL is set: ${process.env.VERCEL_URL}`);
  } else {
    // Only warn if we're not on Vercel (local development)
    if (!process.env.VERCEL) {
      addWarning("VERCEL_URL is not set (expected in local development)");
    } else {
      addError("VERCEL_URL is not set but VERCEL=true (should be set automatically)");
    }
  }
}

/**
 * Validate Prisma configuration
 */
function validatePrisma() {
  console.log("\n📋 Validating Prisma Configuration...\n");

  // Check if schema file exists
  const schemaPath = join(process.cwd(), "prisma", "schema.prisma");
  if (!existsSync(schemaPath)) {
    addError("Prisma schema file not found: prisma/schema.prisma");
    return;
  }
  addSuccess("Prisma schema file exists");

  // Check if Prisma Client is generated
  const prismaClientPath = join(process.cwd(), "node_modules", ".prisma", "client");
  if (!existsSync(prismaClientPath)) {
    addWarning("Prisma Client not generated. Run: npm run db:generate");
  } else {
    addSuccess("Prisma Client is generated");
  }

  // Check schema for correct provider
  try {
    const schemaContent = require("fs").readFileSync(schemaPath, "utf-8");
    if (!schemaContent.includes('provider = "postgresql"')) {
      addError('Prisma schema does not use PostgreSQL provider');
      addError("   SQLite is not supported on Vercel. Update schema.prisma to use PostgreSQL.");
    } else {
      addSuccess("Prisma schema uses PostgreSQL provider");
    }
  } catch (error) {
    addWarning("Could not read Prisma schema file");
  }
}

/**
 * Validate API URL construction
 */
function validateApiUrlConstruction() {
  console.log("\n📋 Validating API URL Construction...\n");

  // Simulate what getBaseUrl() would do
  const isServer = typeof window === "undefined";
  
  if (!isServer) {
    addWarning("Running in browser context (expected in Node.js)");
    return;
  }

  let baseUrl: string | null = null;

  // Check VERCEL_URL
  if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`;
    addSuccess(`API base URL would be: ${baseUrl} (from VERCEL_URL)`);
  } else if (process.env.NEXT_PUBLIC_APP_URL) {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (baseUrl.includes("localhost")) {
      addError(`API base URL would be localhost: ${baseUrl}`);
      addError("   This will cause ECONNREFUSED errors on Vercel");
    } else {
      addSuccess(`API base URL would be: ${baseUrl} (from NEXT_PUBLIC_APP_URL)`);
    }
  } else {
    addError("Neither VERCEL_URL nor NEXT_PUBLIC_APP_URL is set");
    addError("   API calls will fail on Vercel");
  }
}

/**
 * Validate database connection string
 */
async function validateDatabaseConnection() {
  console.log("\n📋 Validating Database Connection...\n");

  const dbUrl = process.env.DATABASE_PRISMA_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    addError("No database URL available (DATABASE_URL or DATABASE_PRISMA_DATABASE_URL)");
    return;
  }

  // Parse URL to check format
  try {
    const url = new URL(dbUrl);
    
    // Check for localhost
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      addError(`Database connection points to localhost: ${url.hostname}:${url.port || "default"}`);
      addError("   This will NOT work on Vercel");
    } else {
      addSuccess(`Database host: ${url.hostname}:${url.port || "default"}`);
    }

    // Check protocol
    if (url.protocol === "prisma+postgres:") {
      addSuccess("Using Prisma Accelerate (recommended for Vercel)");
    } else if (url.protocol === "postgres:" || url.protocol === "postgresql:") {
      addSuccess("Using PostgreSQL connection");
    } else if (url.protocol === "file:") {
      addError("Using SQLite (file: protocol) - NOT supported on Vercel");
    } else {
      addWarning(`Unknown database protocol: ${url.protocol}`);
    }
  } catch (error) {
    addError(`Invalid database URL format: ${error}`);
  }
}

/**
 * Validate build configuration
 */
function validateBuildConfiguration() {
  console.log("\n📋 Validating Build Configuration...\n");

  // Check package.json scripts
  const packageJsonPath = join(process.cwd(), "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = require(packageJsonPath);
      const scripts = packageJson.scripts || {};

      if (!scripts.build) {
        addError("No 'build' script in package.json");
      } else {
        addSuccess("Build script exists");
      }

      if (scripts.prebuild && scripts.prebuild.includes("db:generate:prod")) {
        addSuccess("prebuild script includes db:generate:prod");
      } else {
        addWarning("prebuild script may not generate Prisma Client for production");
      }
    } catch (error) {
      addWarning("Could not read package.json");
    }
  }
}

/**
 * Main validation function
 */
async function validateVercelDeployment() {
  console.log("🔍 Pre-Deployment Validation for Vercel");
  console.log("=" .repeat(50));

  // Run all validations
  validateEnvironmentVariables();
  validatePrisma();
  validateApiUrlConstruction();
  await validateDatabaseConnection();
  validateBuildConfiguration();

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Validation Summary");
  console.log("=".repeat(50));

  if (results.errors.length > 0) {
    console.error(`\n❌ Found ${results.errors.length} error(s):`);
    results.errors.forEach((error, index) => {
      console.error(`   ${index + 1}. ${error}`);
    });
  }

  if (results.warnings.length > 0) {
    console.warn(`\n⚠️  Found ${results.warnings.length} warning(s):`);
    results.warnings.forEach((warning, index) => {
      console.warn(`   ${index + 1}. ${warning}`);
    });
  }

  if (results.passed) {
    console.log("\n✅ All critical validations passed!");
    if (results.warnings.length > 0) {
      console.log("   (Some warnings were found, but deployment should work)");
    }
    process.exit(0);
  } else {
    console.error("\n❌ Validation failed! Fix the errors above before deploying.");
    console.error("\n💡 Quick fixes:");
    console.error("   1. Set all required environment variables in Vercel Dashboard");
    console.error("   2. Ensure DATABASE_URL points to Vercel Postgres (not localhost)");
    console.error("   3. Ensure NEXT_PUBLIC_APP_URL points to your Vercel URL (not localhost)");
    process.exit(1);
  }
}

// Run validation
validateVercelDeployment().catch((error) => {
  console.error("❌ Validation script error:", error);
  process.exit(1);
});

