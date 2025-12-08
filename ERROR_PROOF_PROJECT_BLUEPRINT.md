# Error-Proof Project Blueprint
## A Comprehensive Guide to Building Robust TypeScript/Next.js Projects

**Purpose:** This blueprint provides a systematic approach to prevent common errors, type issues, and build failures from the start of a project.

---

## Table of Contents

1. [Initial Project Setup](#1-initial-project-setup)
2. [TypeScript Configuration](#2-typescript-configuration)
3. [Linting & Formatting](#3-linting--formatting)
4. [Pre-Commit Hooks](#4-pre-commit-hooks)
5. [Build Validation](#5-build-validation)
6. [Development Workflow](#6-development-workflow)
7. [Code Quality Standards](#7-code-quality-standards)
8. [Error Prevention Checklist](#8-error-prevention-checklist)
9. [CI/CD Integration](#9-cicd-integration)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)

---

## 1. Initial Project Setup

### 1.1 Project Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── .husky/                     # Git hooks
│   ├── pre-commit
│   └── commit-msg
├── app/                        # Next.js App Router
├── components/
├── lib/
├── types/
├── scripts/                    # Build/validation scripts
│   ├── validate-encoding.ts
│   ├── check-types.ts
│   └── lint-fix.ts
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── tsconfig.strict.json        # Strict type checking
└── package.json
```

### 1.2 Essential Dependencies

**Development Dependencies (Must-Have):**
```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8",
    "eslint-config-next": "^14",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.28.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 2. TypeScript Configuration

### 2.1 Strict TypeScript Config (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,              // ❌ Disable JavaScript files
    "checkJs": false,
    "strict": true,                // ✅ Enable all strict checks
    "noUnusedLocals": true,        // ✅ Error on unused variables
    "noUnusedParameters": true,    // ✅ Error on unused parameters
    "noImplicitReturns": true,     // ✅ Error on missing returns
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true, // ✅ Safer array/object access
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next", "dist"]
}
```

### 2.2 Build-Time Type Checking Script

**`scripts/check-types.ts`:**
```typescript
import { execSync } from "child_process";
import { existsSync } from "fs";

console.log("🔍 Running TypeScript type check...");

try {
  execSync("tsc --noEmit", { stdio: "inherit" });
  console.log("✅ Type check passed!");
  process.exit(0);
} catch (error) {
  console.error("❌ Type check failed!");
  process.exit(1);
}
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "type-check": "tsx scripts/check-types.ts",
    "prebuild": "npm run type-check && npm run validate:encoding"
  }
}
```

---

## 3. Linting & Formatting

### 3.1 ESLint Configuration (`.eslintrc.json`)

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks", "import"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  },
  "settings": {
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  }
}
```

### 3.2 Prettier Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 3.3 Format Check Script

**Add to `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

---

## 4. Pre-Commit Hooks

### 4.1 Husky Setup

**Install:**
```bash
npm install --save-dev husky lint-staged
npx husky init
```

### 4.2 Pre-Commit Hook (`.husky/pre-commit`)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run type-check

# Run encoding validation
npm run validate:encoding
```

### 4.3 Lint-Staged Configuration (`package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 5. Build Validation

### 5.1 Encoding Validation (Already Implemented)

**`scripts/validate-encoding.ts`** - Checks for UTF-8 BOM and invalid encodings.

### 5.2 Comprehensive Build Script

**`package.json`:**
```json
{
  "scripts": {
    "validate:encoding": "tsx scripts/validate-encoding.ts",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "prebuild": "npm run validate:encoding && npm run type-check && npm run lint && npm run format:check",
    "build": "next build",
    "build:ci": "npm run prebuild && npm run build"
  }
}
```

---

## 6. Development Workflow

### 6.1 Daily Development Checklist

**Before Starting Work:**
- [ ] Pull latest changes
- [ ] Run `npm install` if dependencies changed
- [ ] Run `npm run type-check` to ensure clean state

**During Development:**
- [ ] Run `npm run dev` with type checking enabled
- [ ] Fix linting errors immediately (don't accumulate)
- [ ] Test changes in browser
- [ ] Check console for errors/warnings

**Before Committing:**
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run `npm run format:check`
- [ ] Run `npm run build` locally
- [ ] Test affected pages manually

**Before Pushing:**
- [ ] All pre-commit hooks pass
- [ ] Build succeeds
- [ ] No console errors in browser

### 6.2 IDE Configuration

**VS Code Settings (`.vscode/settings.json`):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.encoding": "utf8",
  "files.eol": "\n"
}
```

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Error Lens (shows errors inline)
- Import Cost
- Path Intellisense

---

## 7. Code Quality Standards

### 7.1 Import Organization

**Always organize imports in this order:**
1. External dependencies (React, Next.js, etc.)
2. Internal absolute imports (`@/components`, `@/lib`)
3. Relative imports (`./Component`, `../utils`)
4. Type imports (`import type { ... }`)

**Example:**
```typescript
// ✅ Good
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "./utils";
import type { User } from "@/types/user";

// ❌ Bad - Mixed order
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDate } from "./utils";
```

### 7.2 Type Safety Rules

**Always:**
- ✅ Use explicit return types for functions
- ✅ Define interfaces/types for all data structures
- ✅ Use `type` for unions/intersections, `interface` for objects
- ✅ Avoid `any` - use `unknown` if type is truly unknown
- ✅ Use type guards for runtime type checking

**Example:**
```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: string) {
  // No return type, implicit any
}
```

### 7.3 Error Handling

**Always handle errors explicitly:**
```typescript
// ✅ Good
try {
  const data = await fetchData();
  return data;
} catch (error) {
  console.error("Failed to fetch data:", error);
  throw new Error("Data fetch failed");
}

// ❌ Bad
const data = await fetchData(); // Unhandled promise rejection
```

### 7.4 Component Patterns

**Server Components (Default):**
```typescript
// ✅ Good - Server Component
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Client Components (When Needed):**
```typescript
// ✅ Good - Client Component
"use client";

import { useState } from "react";

export default function ClientComponent() {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
}
```

---

## 8. Error Prevention Checklist

### 8.1 Project Initialization Checklist

- [ ] TypeScript strict mode enabled
- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured
- [ ] Pre-commit hooks set up
- [ ] Encoding validation script added
- [ ] Type checking in prebuild
- [ ] CI/CD pipeline configured
- [ ] IDE settings configured

### 8.2 File Creation Checklist

**Before creating a new file:**
- [ ] Determine if it's a Server or Client Component
- [ ] Add `"use client"` directive if needed
- [ ] Import types/interfaces first
- [ ] Organize imports correctly
- [ ] Add proper TypeScript types
- [ ] Add error handling for async operations

**After creating a file:**
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Verify file encoding is UTF-8 (no BOM)
- [ ] Test the file in isolation

### 8.3 Import Checklist

**Before importing:**
- [ ] Verify the module exists
- [ ] Check if it's a default or named export
- [ ] Verify types are exported if needed
- [ ] Check for circular dependencies

**After importing:**
- [ ] Verify import is used (or remove if unused)
- [ ] Check import order
- [ ] Verify types match

### 8.4 Function/Component Checklist

**Before writing:**
- [ ] Define input/output types
- [ ] Plan error handling
- [ ] Consider edge cases

**After writing:**
- [ ] Add explicit return types
- [ ] Handle all error cases
- [ ] Remove unused variables/parameters
- [ ] Test with different inputs

---

## 9. CI/CD Integration

### 9.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate encoding
        run: npm run validate:encoding
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Format check
        run: npm run format:check
      
      - name: Build
        run: npm run build
      
      - name: Test (if applicable)
        run: npm test
```

### 9.2 Pre-Push Validation

**Add to `package.json`:**
```json
{
  "scripts": {
    "prepush": "npm run type-check && npm run lint && npm run build"
  }
}
```

**Install `husky` pre-push hook:**
```bash
npx husky add .husky/pre-push "npm run prepush"
```

---

## 10. Monitoring & Maintenance

### 10.1 Regular Maintenance Tasks

**Weekly:**
- Review and fix linting warnings
- Update dependencies (carefully)
- Review type errors
- Check build times

**Monthly:**
- Audit unused dependencies
- Review error patterns
- Update TypeScript/ESLint rules
- Review and update CI/CD

### 10.2 Error Tracking

**Set up error tracking:**
- Use Sentry or similar for production errors
- Monitor build failures
- Track type error frequency
- Review common error patterns

### 10.3 Documentation

**Keep updated:**
- README.md with setup instructions
- Type definitions documentation
- Component usage examples
- Error handling patterns

---

## 11. Common Pitfalls & Solutions

### 11.1 Unused Variables/Imports

**Problem:** TypeScript errors for unused code.

**Solution:**
- Enable `noUnusedLocals` and `noUnusedParameters` in tsconfig
- Use ESLint rule `@typescript-eslint/no-unused-vars`
- Run `npm run lint` before committing

### 11.2 Missing Type Definitions

**Problem:** Implicit `any` types.

**Solution:**
- Enable `strict: true` in tsconfig
- Use `@typescript-eslint/no-explicit-any: error`
- Always define types for function parameters and returns

### 11.3 Encoding Issues

**Problem:** UTF-16 files breaking builds.

**Solution:**
- Use encoding validation script
- Configure IDE to save as UTF-8
- Add pre-build validation

### 11.4 Import Errors

**Problem:** Wrong import paths or missing exports.

**Solution:**
- Use path aliases consistently (`@/components`)
- Verify exports in source files
- Use TypeScript path mapping
- Enable `import/no-unresolved` ESLint rule

### 11.5 Async/Await Errors

**Problem:** Unhandled promise rejections.

**Solution:**
- Always use try-catch with async/await
- Enable `@typescript-eslint/no-floating-promises`
- Use error boundaries for React components

---

## 12. Quick Start Template

### 12.1 Project Initialization Script

**`scripts/init-project.sh`:**
```bash
#!/bin/bash

# Initialize new Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install essential dev dependencies
npm install -D \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  prettier \
  prettier-plugin-tailwindcss \
  husky \
  lint-staged \
  tsx

# Setup Husky
npx husky init

# Copy configuration files
# (tsconfig.json, .eslintrc.json, .prettierrc, etc.)

# Run initial setup
npm run type-check
npm run lint
npm run format
```

### 12.2 Configuration Files Template

All configuration files should be committed to version control and shared with the team.

---

## 13. Summary: The Golden Rules

1. **Strict TypeScript from Day 1** - No `any`, explicit types everywhere
2. **Lint Before Commit** - Fix errors immediately, don't accumulate
3. **Validate Before Build** - Encoding, types, linting all checked
4. **Automate Everything** - Pre-commit hooks, CI/CD, type checking
5. **Test Locally First** - Never push code that doesn't build locally
6. **Document Patterns** - Share knowledge, prevent repeated mistakes
7. **Review Regularly** - Weekly code quality reviews
8. **Fail Fast** - Catch errors early in development, not in production

---

## 14. Implementation Priority

**Phase 1 (Critical - Do First):**
1. Enable TypeScript strict mode
2. Set up ESLint with TypeScript rules
3. Add encoding validation
4. Configure pre-commit hooks
5. Add type checking to build process

**Phase 2 (Important - Do Soon):**
1. Set up CI/CD pipeline
2. Configure IDE settings
3. Add comprehensive linting rules
4. Set up error tracking

**Phase 3 (Nice to Have):**
1. Advanced type checking rules
2. Performance monitoring
3. Automated dependency updates
4. Code coverage requirements

---

**Remember:** It's easier to prevent errors than to fix them. Invest time in setup, save time in development.

---

*Last Updated: 2025-12-07*
*Based on lessons learned from Pak-Exporters project*

