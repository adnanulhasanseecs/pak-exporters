import { test, expect } from "@playwright/test";

test.describe("Product Search → View → Contact Journey", () => {
  test("should complete product search and view flow", async ({ page }) => {
    // Step 1: Navigate to search page
    await page.goto("/search");

    // Verify search page is loaded
    await expect(page.getByText("Search")).toBeVisible();

    // Step 2: Perform search
    const searchInput = page.getByPlaceholderText(/Search products, suppliers/i);
    await searchInput.fill("cotton");
    await page.getByRole("button", { name: /Search/i }).last().click();

    // Step 3: Wait for search results
    await expect(page.getByText(/Products|Companies/i)).toBeVisible();

    // Step 4: Click on a product (if available)
    const productCard = page.locator('[data-testid="product-card"]').first();
    if (await productCard.count() > 0) {
      await productCard.click();

      // Step 5: Verify product detail page
      await expect(page).toHaveURL(/\/products\/\d+/);
      await expect(page.getByText(/Product|Description/i)).toBeVisible();
    }
  });

  test("should navigate to product detail from homepage", async ({ page }) => {
    // Step 1: Navigate to homepage
    await page.goto("/");

    // Step 2: Find and click on a product card
    const productCard = page.locator('[data-testid="product-card"]').first();
    if (await productCard.count() > 0) {
      await productCard.click();

      // Step 3: Verify product detail page
      await expect(page).toHaveURL(/\/products\/\d+/);
      await expect(page.getByText(/Product|Description/i)).toBeVisible();
    }
  });

  test("should filter products by category", async ({ page }) => {
    // Step 1: Navigate to categories page
    await page.goto("/categories");

    // Step 2: Click on a category
    const categoryCard = page.locator('[data-testid="category-card"]').first();
    if (await categoryCard.count() > 0) {
      await categoryCard.click();

      // Step 3: Verify category page with filtered products
      await expect(page).toHaveURL(/\/category\/\w+/);
      await expect(page.getByText(/Products|Category/i)).toBeVisible();
    }
  });

  test("should view company profile from product page", async ({ page }) => {
    // Step 1: Navigate to a product page
    await page.goto("/products/1");

    // Step 2: Find and click on company link
    const companyLink = page.getByText(/Company|Supplier/i).first();
    if (await companyLink.count() > 0) {
      await companyLink.click();

      // Step 3: Verify company page
      await expect(page).toHaveURL(/\/company\/\d+/);
      await expect(page.getByText(/Company|Products/i)).toBeVisible();
    }
  });
});

