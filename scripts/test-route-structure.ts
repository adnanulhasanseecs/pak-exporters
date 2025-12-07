/**
 * Route Structure Test Script
 * Tests that all routes are properly set up in [locale] structure
 */

import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const APP_DIR = join(process.cwd(), "app");
const LOCALE_DIR = join(APP_DIR, "[locale]");

interface RouteTest {
  route: string;
  exists: boolean;
  hasPage: boolean;
  hasRedirect: boolean;
  status: "✅" | "❌" | "⚠️";
  message: string;
}

const routesToTest = [
  // Public pages
  { locale: "page.tsx", redirect: "page.tsx" },
  { locale: "about/page.tsx", redirect: "about/page.tsx" },
  { locale: "categories/page.tsx", redirect: "categories/page.tsx" },
  { locale: "products/page.tsx", redirect: "products/page.tsx" },
  { locale: "products/[id]/page.tsx", redirect: "products/[id]/page.tsx" },
  { locale: "companies/page.tsx", redirect: "companies/page.tsx" },
  { locale: "company/[id]/page.tsx", redirect: "company/[id]/page.tsx" },
  { locale: "category/[slug]/page.tsx", redirect: "category/[slug]/page.tsx" },
  { locale: "search/page.tsx", redirect: "search/page.tsx" },
  { locale: "contact/page.tsx", redirect: "contact/page.tsx" },
  { locale: "faq/page.tsx", redirect: "faq/page.tsx" },
  { locale: "terms/page.tsx", redirect: "terms/page.tsx" },
  { locale: "privacy/page.tsx", redirect: "privacy/page.tsx" },
  { locale: "pricing/page.tsx", redirect: "pricing/page.tsx" },
  { locale: "rfq/page.tsx", redirect: "rfq/page.tsx" },
  { locale: "blog/page.tsx", redirect: "blog/page.tsx" },
  { locale: "blog/[slug]/page.tsx", redirect: "blog/[slug]/page.tsx" },
  
  // Auth pages
  { locale: "login/page.tsx", redirect: "login/page.tsx" },
  { locale: "register/page.tsx", redirect: "register/page.tsx" },
  { locale: "forgot-password/page.tsx", redirect: "forgot-password/page.tsx" },
  { locale: "reset-password/page.tsx", redirect: "reset-password/page.tsx" },
  { locale: "verify-email/page.tsx", redirect: "verify-email/page.tsx" },
  
  // Dashboard pages
  { locale: "dashboard/page.tsx", redirect: null },
  { locale: "dashboard/products/page.tsx", redirect: null },
  { locale: "dashboard/products/new/page.tsx", redirect: null },
  { locale: "dashboard/products/[id]/edit/page.tsx", redirect: null },
  { locale: "dashboard/companies/page.tsx", redirect: null },
  { locale: "dashboard/rfq/page.tsx", redirect: null },
  { locale: "dashboard/settings/page.tsx", redirect: null },
  
  // Other pages
  { locale: "admin/page.tsx", redirect: "admin/page.tsx" },
  { locale: "membership/page.tsx", redirect: "membership/page.tsx" },
  { locale: "membership/apply/page.tsx", redirect: "membership/apply/page.tsx" },
  { locale: "profile/settings/page.tsx", redirect: "profile/settings/page.tsx" },
];

function testRoute(route: { locale: string; redirect: string | null }): RouteTest {
  const localePath = join(LOCALE_DIR, route.locale);
  const redirectPath = route.redirect ? join(APP_DIR, route.redirect) : null;
  
  const exists = existsSync(localePath);
  const hasPage = exists && statSync(localePath).isFile();
  const hasRedirect = redirectPath ? existsSync(redirectPath) : true; // Dashboard doesn't need redirects
  
  let status: "✅" | "❌" | "⚠️" = "✅";
  let message = "OK";
  
  if (!hasPage) {
    status = "❌";
    message = "Missing page file";
  } else if (route.redirect && !hasRedirect) {
    status = "⚠️";
    message = "Missing redirect (optional)";
  }
  
  return {
    route: route.locale,
    exists,
    hasPage,
    hasRedirect: hasRedirect || !route.redirect,
    status,
    message,
  };
}

function checkImports(filePath: string): { usesI18nRouting: boolean; issues: string[] } {
  try {
    const content = require("fs").readFileSync(filePath, "utf-8");
    const issues: string[] = [];
    let usesI18nRouting = false;
    
    // Check for next/link
    if (content.includes('from "next/link"') || content.includes("from 'next/link'")) {
      issues.push("Uses next/link instead of @/i18n/routing");
    }
    
    // Check for next/navigation useRouter
    if (content.includes('useRouter') && content.includes('from "next/navigation"')) {
      issues.push("Uses next/navigation useRouter instead of @/i18n/routing");
    }
    
    // Check for @/i18n/routing
    if (content.includes("@/i18n/routing")) {
      usesI18nRouting = true;
    }
    
    return { usesI18nRouting, issues };
  } catch {
    return { usesI18nRouting: false, issues: ["Could not read file"] };
  }
}

console.log("🧪 Testing Route Structure...\n");

const results = routesToTest.map(testRoute);

console.log("Route Structure Test Results:\n");
console.log("Route".padEnd(40) + "Status".padEnd(10) + "Message");
console.log("-".repeat(70));

let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach((result) => {
  console.log(
    result.route.padEnd(40) + 
    result.status.padEnd(10) + 
    result.message
  );
  
  if (result.status === "✅") passCount++;
  else if (result.status === "❌") failCount++;
  else warnCount++;
});

console.log("\n" + "-".repeat(70));
console.log(`\nSummary:`);
console.log(`✅ Passed: ${passCount}`);
console.log(`⚠️  Warnings: ${warnCount}`);
console.log(`❌ Failed: ${failCount}`);

if (failCount > 0) {
  console.log("\n❌ Some routes are missing. Please check the files above.");
  process.exit(1);
} else {
  console.log("\n✅ All routes are properly structured!");
}

