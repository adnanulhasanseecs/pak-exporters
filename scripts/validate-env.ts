/**
 * Environment Variable Validation Script
 * Validates all required environment variables are set
 * 
 * Usage:
 *   tsx scripts/validate-env.ts [production|development]
 */

const environment = process.argv[2] || process.env.NODE_ENV || "development";

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => { valid: boolean; error?: string };
}

const requiredVars: EnvVar[] = [
  {
    name: "DATABASE_URL",
    required: true,
    description: "Database connection string",
    validator: (value) => {
      if (!value) {
        return { valid: false, error: "DATABASE_URL is required" };
      }
      if (environment === "production" && value.startsWith("file:")) {
        return { valid: false, error: "SQLite not allowed in production. Use PostgreSQL." };
      }
      return { valid: true };
    },
  },
  {
    name: "JWT_SECRET",
    required: true,
    description: "JWT token secret",
    validator: (value) => {
      if (!value) {
        return { valid: false, error: "JWT_SECRET is required" };
      }
      if (value.length < 32) {
        return { valid: false, error: "JWT_SECRET must be at least 32 characters" };
      }
      if (value === "your-secret-key-change-in-production" || value.includes("change-in-production")) {
        return { valid: false, error: "JWT_SECRET must be changed from default value" };
      }
      return { valid: true };
    },
  },
  {
    name: "NODE_ENV",
    required: true,
    description: "Node environment",
    validator: (value) => {
      const valid = ["development", "production", "test"].includes(value || "");
      return { valid, error: valid ? undefined : "NODE_ENV must be development, production, or test" };
    },
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: true,
    description: "Public application URL",
  },
];

const optionalVars: EnvVar[] = [
  {
    name: "JWT_EXPIRES_IN",
    required: false,
    description: "JWT token expiration (default: 7d)",
  },
  {
    name: "NEXT_PUBLIC_API_URL",
    required: false,
    description: "Backend API URL (optional)",
  },
  {
    name: "NEXT_PUBLIC_GA_ID",
    required: false,
    description: "Google Analytics ID (optional)",
  },
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    description: "Sentry DSN for error tracking (optional)",
  },
];

function validateEnvironment() {
  console.log(`🔍 Validating environment variables for: ${environment}\n`);

  let hasErrors = false;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredVars) {
    const value = process.env[envVar.name];
    
    if (!value && envVar.required) {
      errors.push(`❌ ${envVar.name}: Required but not set - ${envVar.description}`);
      hasErrors = true;
      continue;
    }

    if (value && envVar.validator) {
      const result = envVar.validator(value);
      if (!result.valid) {
        errors.push(`❌ ${envVar.name}: ${result.error}`);
        hasErrors = true;
      }
    }

    if (value) {
      console.log(`✅ ${envVar.name}: Set`);
    }
  }

  // Check optional variables
  console.log("\n📋 Optional variables:");
  for (const envVar of optionalVars) {
    const value = process.env[envVar.name];
    if (value) {
      console.log(`✅ ${envVar.name}: Set`);
    } else {
      console.log(`⚪ ${envVar.name}: Not set (optional)`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    console.log("\n❌ Validation FAILED\n");
    errors.forEach((error) => console.log(error));
    console.log("\n💡 Fix the errors above before deploying to production.");
    process.exit(1);
  } else {
    console.log("\n✅ All required environment variables are valid!");
    if (warnings.length > 0) {
      console.log("\n⚠️  Warnings:");
      warnings.forEach((warning) => console.log(warning));
    }
  }
}

validateEnvironment();

