import { test, expect } from "@playwright/test";

test.describe("RFQ Submission → Response → Acceptance Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer before each test
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("buyer@test.com");
    await page.getByLabel(/Password/i).fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should submit RFQ as buyer", async ({ page }) => {
    // Step 1: Navigate to RFQ submission page
    await page.goto("/rfq");

    // Verify RFQ page is loaded
    await expect(page.getByText("Submit Request for Quotation")).toBeVisible();

    // Step 2: Fill RFQ form
    await page.getByLabel(/Title/i).fill("Need 1000 cotton t-shirts");
    await page.getByLabel(/Description/i).fill("Looking for high quality cotton t-shirts in bulk");
    
    // Select category (using the select trigger)
    const categorySelect = page.locator('button[role="combobox"]').first();
    await categorySelect.click();
    await page.getByText(/Textiles|Apparel/i).first().click();

    // Fill optional fields
    await page.getByLabel(/Quantity/i).fill("1000");
    await page.getByLabel(/Budget/i).fill("10000");

    // Step 3: Submit RFQ
    await page.getByRole("button", { name: /Submit RFQ/i }).click();

    // Step 4: Verify redirect to RFQ dashboard
    await expect(page).toHaveURL(/\/dashboard\/rfq/);
    await expect(page.getByText(/RFQ|Requests/i)).toBeVisible();
  });

  test("should view RFQ details", async ({ page }) => {
    // Step 1: Navigate to RFQ dashboard
    await page.goto("/dashboard/rfq");

    // Step 2: Click on an RFQ to view details
    const rfqLink = page.locator('a[href*="/dashboard/rfq/"]').first();
    if (await rfqLink.count() > 0) {
      await rfqLink.click();

      // Step 3: Verify RFQ detail page
      await expect(page).toHaveURL(/\/dashboard\/rfq\/\w+/);
      await expect(page.getByText(/RFQ|Details|Responses/i)).toBeVisible();
    }
  });

  test("should handle RFQ form validation", async ({ page }) => {
    // Step 1: Navigate to RFQ submission page
    await page.goto("/rfq");

    // Step 2: Try to submit empty form
    await page.getByRole("button", { name: /Submit RFQ/i }).click();

    // Step 3: Verify validation errors appear
    await expect(page.getByText(/required|Title is required/i)).toBeVisible();
  });
});

test.describe("RFQ Response Flow (Supplier)", () => {
  test.beforeEach(async ({ page }) => {
    // Login as supplier before each test
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("supplier@test.com");
    await page.getByLabel(/Password/i).fill("password123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should view and respond to RFQ", async ({ page }) => {
    // Step 1: Navigate to RFQ detail page (assuming RFQ exists)
    await page.goto("/dashboard/rfq/rfq-1");

    // Step 2: Check if respond button exists
    const respondButton = page.getByRole("button", { name: /Respond|Submit Response/i });
    if (await respondButton.count() > 0) {
      await respondButton.click();

      // Step 3: Fill response form
      await page.getByLabel(/Price|Amount/i).fill("9500");
      await page.getByLabel(/Message/i).fill("We can provide high quality cotton t-shirts");

      // Step 4: Submit response
      await page.getByRole("button", { name: /Submit|Send/i }).click();

      // Step 5: Verify success message or redirect
      await expect(page.getByText(/success|submitted/i)).toBeVisible();
    }
  });
});

