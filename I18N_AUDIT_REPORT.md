# Internationalization (i18n) Audit Report

**Generated:** 2025-12-06T08:26:04.843Z

## Executive Summary

- **Total Files Audited:** 54
- **Files with Issues:** 54
- **Files with Hardcoded Strings:** 54
- **Files Using i18n:** 1
- **Unique Hardcoded Strings Found:** 115

## Issue Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 106 |
| Medium | 1 |
| Low | 0 |
| **Total** | **107** |

## i18n Configuration Status

- **i18n Directory:** ✅ Exists
- **next-intl Package:** ✅ Installed
- **Translation Files:** Check i18n directory

## Detailed Findings

### Files with Hardcoded Strings (53)

- **app\[locale]\products\page.tsx**
  - Hardcoded strings: 1
  - Examples: All Products

- **app\[locale]\pricing\page.tsx**
  - Hardcoded strings: 1
  - Examples: Redirecting to membership tiers

- **app\[locale]\membership\page.tsx**
  - Hardcoded strings: 5
  - Examples: Supplier Membership Tiers, Perfect for new businesses starting their export journey, Our highest tier for the most trusted and established suppliers, Verified suppliers with excellent track records and quality products, Reliable suppliers building their reputation in the marketplace

- **app\[locale]\faq\page.tsx**
  - Hardcoded strings: 4
  - Examples: Getting Started, For Suppliers, For Buyers, Technical Support

- **app\[locale]\contact\page.tsx**
  - Hardcoded strings: 1
  - Examples: Fill out the form below

- **app\[locale]\companies\page.tsx**
  - Hardcoded strings: 2
  - Examples: Find Suppliers, Browse verified Pakistani exporters and suppliers

- **app\[locale]\categories\page.tsx**
  - Hardcoded strings: 1
  - Examples: Browse Categories

- **app\[locale]\admin\page.tsx**
  - Hardcoded strings: 2
  - Examples: All time, Awaiting review

- **app\[locale]\about\page.tsx**
  - Hardcoded strings: 4
  - Examples: Verified suppliers and exporters, Wide range of product categories, Global reach with local expertise, Premium supplier network

- **app\dashboard\settings\page.tsx**
  - Hardcoded strings: 4
  - Examples: Your account details, Manage your notification preferences, Customize your experience, Manage your account security

- **app\dashboard\products\page.tsx**
  - Hardcoded strings: 2
  - Examples: Manage Products, No products yet

- **app\dashboard\orders\page.tsx**
  - Hardcoded strings: 1
  - Examples: No orders found

- **app\dashboard\companies\page.tsx**
  - Hardcoded strings: 1
  - Examples: Manage Companies

- **app\dashboard\notifications\page.tsx**
  - Hardcoded strings: 2
  - Examples: New Order Received, RFQ Response

- **app\dashboard\analytics\page.tsx**
  - Hardcoded strings: 3
  - Examples: Most viewed and ordered products, Latest updates and events, Visual representation of your analytics data

- **app\api\rfq\route.ts**
  - Hardcoded strings: 4
  - Examples: Failed to fetch RFQs, Category not found, User not found, Failed to create RFQ

- **app\api\membership\route.ts**
  - Hardcoded strings: 3
  - Examples: Failed to fetch membership applications, You already have a membership application, Failed to create membership application

- **app\api\products\route.ts**
  - Hardcoded strings: 7
  - Examples: Database connection not available, Database file not found, Prisma client not generated, Database connection failed, Category not found

- **app\api\companies\route.ts**
  - Hardcoded strings: 3
  - Examples: Failed to fetch companies, Company with this email already exists, Failed to create company

- **app\api\categories\route.ts**
  - Hardcoded strings: 1
  - Examples: Failed to fetch categories

### Files Missing i18n (53)

- **app\[locale]\products\page.tsx**
  - Issues: 2

- **app\[locale]\pricing\page.tsx**
  - Issues: 2

- **app\[locale]\membership\page.tsx**
  - Issues: 2

- **app\[locale]\faq\page.tsx**
  - Issues: 2

- **app\[locale]\contact\page.tsx**
  - Issues: 2

- **app\[locale]\companies\page.tsx**
  - Issues: 2

- **app\[locale]\categories\page.tsx**
  - Issues: 2

- **app\[locale]\admin\page.tsx**
  - Issues: 2

- **app\[locale]\about\page.tsx**
  - Issues: 2

- **app\dashboard\settings\page.tsx**
  - Issues: 2

- **app\dashboard\products\page.tsx**
  - Issues: 2

- **app\dashboard\orders\page.tsx**
  - Issues: 2

- **app\dashboard\companies\page.tsx**
  - Issues: 2

- **app\dashboard\notifications\page.tsx**
  - Issues: 2

- **app\dashboard\analytics\page.tsx**
  - Issues: 2

- **app\api\rfq\route.ts**
  - Issues: 2

- **app\api\membership\route.ts**
  - Issues: 2

- **app\api\products\route.ts**
  - Issues: 2

- **app\api\companies\route.ts**
  - Issues: 2

- **app\api\categories\route.ts**
  - Issues: 2

## Recommendations

### 2. Fix High-Priority Issues
- Replace hardcoded strings with translation keys
- Add useTranslations() hook to components
- Create translation files for all text

### 3. Standardize i18n Usage
- Use consistent translation key naming
- Group translations by feature/page
- Remove all hardcoded strings

## Next Steps

1. Review this audit report
2. Set up i18n infrastructure (if not done)
3. Create translation files
4. Fix issues file by file, starting with high-priority
5. Re-run audit to verify fixes

---
*Run `tsx scripts/audit-i18n.ts` to regenerate this report.*
