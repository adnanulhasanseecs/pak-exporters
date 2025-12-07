import { describe, it, expect } from "vitest";
import { APP_CONFIG, ROUTES, API_ENDPOINTS, PAGINATION, IMAGE_PLACEHOLDER } from "../constants";

describe("Constants", () => {
  describe("APP_CONFIG", () => {
    it("should have correct app name", () => {
      expect(APP_CONFIG.name).toBe("Pak-Exporters");
    });

    it("should have description", () => {
      expect(APP_CONFIG.description).toContain("Pakistan");
    });

    it("should have contact information", () => {
      expect(APP_CONFIG.contact).toHaveProperty("phone");
      expect(APP_CONFIG.contact).toHaveProperty("email");
      expect(APP_CONFIG.contact).toHaveProperty("address");
      expect(APP_CONFIG.contact).toHaveProperty("workingHours");
    });

    it("should have established year", () => {
      expect(APP_CONFIG.established).toBe(2019);
    });
  });

  describe("ROUTES", () => {
    it("should have home route", () => {
      expect(ROUTES.home).toBe("/");
    });

    it("should generate category route correctly", () => {
      expect(ROUTES.category("textiles-garments")).toBe("/category/textiles-garments");
    });

    it("should generate product route correctly", () => {
      expect(ROUTES.product("123")).toBe("/products/123");
    });

    it("should generate company route correctly", () => {
      expect(ROUTES.company("456")).toBe("/company/456");
    });

    it("should have all main routes", () => {
      expect(ROUTES.categories).toBe("/categories");
      expect(ROUTES.products).toBe("/products");
      expect(ROUTES.companies).toBe("/companies");
      expect(ROUTES.search).toBe("/search");
      expect(ROUTES.about).toBe("/about");
      expect(ROUTES.contact).toBe("/contact");
      expect(ROUTES.login).toBe("/login");
      expect(ROUTES.register).toBe("/register");
    });

    it("should generate dashboard routes correctly", () => {
      expect(ROUTES.dashboard).toBe("/dashboard");
      expect(ROUTES.dashboardProducts).toBe("/dashboard/products");
      expect(ROUTES.dashboardProductEdit("123")).toBe("/dashboard/products/123/edit");
      expect(ROUTES.dashboardRfqDetail("456")).toBe("/dashboard/rfq/456");
      expect(ROUTES.dashboardOrderDetail("789")).toBe("/dashboard/orders/789");
    });
  });

  describe("API_ENDPOINTS", () => {
    it("should have all API endpoints", () => {
      expect(API_ENDPOINTS.products).toBe("/api/products");
      expect(API_ENDPOINTS.companies).toBe("/api/companies");
      expect(API_ENDPOINTS.categories).toBe("/api/categories");
      expect(API_ENDPOINTS.rfq).toBe("/api/rfq");
    });

    it("should have auth endpoints", () => {
      expect(API_ENDPOINTS.auth.login).toBe("/api/auth/login");
      expect(API_ENDPOINTS.auth.register).toBe("/api/auth/register");
      expect(API_ENDPOINTS.auth.logout).toBe("/api/auth/logout");
      expect(API_ENDPOINTS.auth.me).toBe("/api/auth/me");
    });
  });

  describe("PAGINATION", () => {
    it("should have default page size", () => {
      expect(PAGINATION.defaultPageSize).toBe(20);
    });

    it("should have page size options", () => {
      expect(PAGINATION.pageSizeOptions).toEqual([10, 20, 50, 100]);
    });
  });

  describe("IMAGE_PLACEHOLDER", () => {
    it("should have placeholder URLs", () => {
      expect(IMAGE_PLACEHOLDER.product).toContain("placeholder");
      expect(IMAGE_PLACEHOLDER.company).toContain("placeholder");
      expect(IMAGE_PLACEHOLDER.category).toContain("placeholder");
    });
  });
});

