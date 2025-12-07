import { test, expect } from "@playwright/test";

/**
 * E2E test for homepage navigation
 * Tests navigation flows from the homepage
 */
test.describe("Homepage Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to products page from homepage", async ({ page }) => {
    // Click on products link in navigation
    await page.click('a[href="/products"]');
    await expect(page).toHaveURL(/.*\/products/);
  });

  test("should navigate to categories page from homepage", async ({ page }) => {
    // Click on categories link
    await page.click('a[href="/categories"]');
    await expect(page).toHaveURL(/.*\/categories/);
  });

  test("should navigate to companies page from homepage", async ({ page }) => {
    // Click on companies/suppliers link
    await page.click('a[href="/companies"]');
    await expect(page).toHaveURL(/.*\/companies/);
  });

  test("should navigate to search page from homepage", async ({ page }) => {
    // Click on search or use search functionality
    await page.click('a[href="/search"]');
    await expect(page).toHaveURL(/.*\/search/);
  });

  test("should navigate to about page from footer", async ({ page }) => {
    // Scroll to footer and click about link
    await page.click('footer a[href="/about"]');
    await expect(page).toHaveURL(/.*\/about/);
  });

  test("should navigate to contact page from footer", async ({ page }) => {
    // Click contact link in footer
    await page.click('footer a[href="/contact"]');
    await expect(page).toHaveURL(/.*\/contact/);
  });
});

