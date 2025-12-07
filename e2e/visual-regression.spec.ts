/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots of key pages and components
 * to detect visual regressions in the UI.
 */

import { test, expect } from "@playwright/test";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

test.describe("Visual Regression Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to be fully loaded
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("Homepage - Full page screenshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("homepage-full.png", {
      fullPage: true,
    });
  });

  test("Homepage - Viewport screenshot", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("homepage-viewport.png");
  });

  test("Header component", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    
    const header = page.locator("header").first();
    await expect(header).toHaveScreenshot("header.png");
  });

  test("Footer component", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    
    // Scroll to footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    
    const footer = page.locator("footer").first();
    await expect(footer).toHaveScreenshot("footer.png");
  });

  test("Product card", async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState("networkidle");
    
    // Wait for products to load
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    
    await expect(productCard).toHaveScreenshot("product-card.png");
  });

  test("Company card", async ({ page }) => {
    await page.goto(`${BASE_URL}/companies`);
    await page.waitForLoadState("networkidle");
    
    const companyCard = page.locator('[data-testid="company-card"]').first();
    await companyCard.waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    
    await expect(companyCard).toHaveScreenshot("company-card.png");
  });

  test("Product detail page", async ({ page }) => {
    // Navigate to a product page
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState("networkidle");
    
    // Click first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("product-detail.png", {
      fullPage: true,
    });
  });

  test("Search page", async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=textile`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("search-results.png", {
      fullPage: true,
    });
  });

  test("Login page", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
    });
  });

  test("Registration page", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot("register-page.png", {
      fullPage: true,
    });
  });

  test("RFQ form", async ({ page }) => {
    await page.goto(`${BASE_URL}/rfq`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot("rfq-form.png", {
      fullPage: true,
    });
  });

  test("Dashboard page", async ({ page }) => {
    // Note: This requires authentication
    // For visual testing, you may want to mock auth or use a test account
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    // Only capture if not redirected to login
    if (page.url().includes("/dashboard")) {
      await expect(page).toHaveScreenshot("dashboard.png", {
        fullPage: true,
      });
    }
  });

  test("Category listing page", async ({ page }) => {
    await page.goto(`${BASE_URL}/categories`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("categories-listing.png", {
      fullPage: true,
    });
  });

  test("Company profile page", async ({ page }) => {
    await page.goto(`${BASE_URL}/companies`);
    await page.waitForLoadState("networkidle");
    
    const firstCompany = page.locator('[data-testid="company-card"]').first();
    await firstCompany.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("company-profile.png", {
      fullPage: true,
    });
  });

  test("Mobile viewport - Homepage", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("homepage-mobile.png", {
      fullPage: true,
    });
  });

  test("Tablet viewport - Homepage", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot("homepage-tablet.png", {
      fullPage: true,
    });
  });
});

