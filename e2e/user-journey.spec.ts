import { test, expect } from "@playwright/test";

test.describe("User Registration → Login → Dashboard Journey", () => {
  test("should complete full user registration and login flow", async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.goto("/register");

    // Verify registration page is loaded
    await expect(page.getByText("Create Account")).toBeVisible();

    // Step 2: Fill registration form
    await page.getByLabel(/Full Name/i).fill("Test User");
    await page.getByLabel(/Email/i).fill("testuser@example.com");
    await page.getByLabel(/Password/i).first().fill("password123");
    await page.getByLabel(/Confirm Password/i).fill("password123");
    
    // Select buyer role (default)
    await expect(page.getByLabel(/Buyer/i)).toBeChecked();

    // Step 3: Submit registration
    await page.getByRole("button", { name: /Create Account/i }).click();

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Welcome|Dashboard/i)).toBeVisible();
  });

  test("should handle login flow for existing user", async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto("/login");

    // Verify login page is loaded
    await expect(page.getByText("Sign In")).toBeVisible();

    // Step 2: Fill login form
    await page.getByLabel(/Email/i).fill("buyer@test.com");
    await page.getByLabel(/Password/i).fill("password123");

    // Step 3: Submit login
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should redirect supplier to membership application after registration", async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.goto("/register");

    // Step 2: Fill registration form as supplier
    await page.getByLabel(/Full Name/i).fill("Test Supplier");
    await page.getByLabel(/Email/i).fill("supplier@example.com");
    await page.getByLabel(/Password/i).first().fill("password123");
    await page.getByLabel(/Confirm Password/i).fill("password123");
    
    // Select supplier role
    await page.getByLabel(/Supplier/i).click();

    // Step 3: Submit registration
    await page.getByRole("button", { name: /Create Account/i }).click();

    // Step 4: Verify redirect to membership application
    await expect(page).toHaveURL(/\/membership\/apply/);
  });

  test("should handle admin login and redirect to admin dashboard", async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto("/login");

    // Step 2: Fill admin credentials
    await page.getByLabel(/Email/i).fill("admin@admin.com");
    await page.getByLabel(/Password/i).fill("12345678");

    // Step 3: Submit login
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Step 4: Verify redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText(/Admin|Membership Applications/i)).toBeVisible();
  });
});

