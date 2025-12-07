/**
 * Security Enhanced Utilities Tests
 */

import { describe, it, expect } from "vitest";
import {
  sanitizeInputEnhanced,
  validatePasswordStrength,
  validateAndSanitizeEmail,
  validateAndSanitizeURL,
  containsDangerousContent,
  validateFileUpload,
  validateRequestBodySize,
  sanitizeObject,
  enhancedRateLimiter,
} from "../security-enhanced";

describe("Security Enhanced Utilities", () => {
  describe("sanitizeInputEnhanced", () => {
    it("should remove script tags", () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeInputEnhanced(input);
      expect(result).not.toContain("<script");
      expect(result).not.toContain("</script>");
    });

    it("should remove javascript: protocol", () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizeInputEnhanced(input);
      expect(result).not.toContain("javascript:");
    });

    it("should remove event handlers", () => {
      const input = '<div onclick="alert(\'xss\')">Click</div>';
      const result = sanitizeInputEnhanced(input);
      expect(result).not.toContain("onclick");
    });

    it("should preserve safe text", () => {
      const input = "Hello, World!";
      const result = sanitizeInputEnhanced(input);
      expect(result).toBe("Hello, World!");
    });
  });

  describe("validatePasswordStrength", () => {
    it("should reject passwords shorter than 8 characters", () => {
      const result = validatePasswordStrength("short");
      expect(result.isValid).toBe(false);
      expect(result.score).toBe(0);
    });

    it("should accept strong passwords", () => {
      const result = validatePasswordStrength("StrongP@ssw0rd123");
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it("should detect common patterns", () => {
      const result = validatePasswordStrength("password123");
      expect(result.feedback.some((f) => f.includes("common"))).toBe(true);
    });

    it("should provide feedback for missing requirements", () => {
      const result = validatePasswordStrength("lowercaseonly");
      expect(result.feedback.some((f) => f.includes("uppercase"))).toBe(true);
    });
  });

  describe("validateAndSanitizeEmail", () => {
    it("should validate correct email", () => {
      const result = validateAndSanitizeEmail("test@example.com");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("test@example.com");
    });

    it("should reject invalid email format", () => {
      const result = validateAndSanitizeEmail("invalid-email");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should sanitize email (lowercase, trim)", () => {
      const result = validateAndSanitizeEmail("  TEST@EXAMPLE.COM  ");
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe("test@example.com");
    });

    it("should reject emails with dangerous content", () => {
      const result = validateAndSanitizeEmail("test<script>@example.com");
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateAndSanitizeURL", () => {
    it("should validate correct URL", () => {
      const result = validateAndSanitizeURL("https://example.com");
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid URL", () => {
      const result = validateAndSanitizeURL("not-a-url");
      expect(result.isValid).toBe(false);
    });

    it("should reject javascript: protocol", () => {
      const result = validateAndSanitizeURL("javascript:alert('xss')");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("dangerous");
    });

    it("should only allow http and https", () => {
      const result = validateAndSanitizeURL("ftp://example.com");
      expect(result.isValid).toBe(false);
    });
  });

  describe("containsDangerousContent", () => {
    it("should detect script tags", () => {
      expect(containsDangerousContent('<script>alert("xss")</script>')).toBe(true);
    });

    it("should detect javascript: protocol", () => {
      expect(containsDangerousContent('javascript:alert("xss")')).toBe(true);
    });

    it("should detect event handlers", () => {
      expect(containsDangerousContent('<div onclick="alert()">')).toBe(true);
    });

    it("should not flag safe content", () => {
      expect(containsDangerousContent("Hello, World!")).toBe(false);
    });
  });

  describe("validateFileUpload", () => {
    it("should validate correct image file", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(true);
    });

    it("should reject files exceeding size limit", () => {
      const largeContent = "x".repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], "test.jpg", { type: "image/jpeg" });
      const result = validateFileUpload(file, { maxSize: 10 * 1024 * 1024 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("size");
    });

    it("should reject disallowed file types", () => {
      const file = new File(["content"], "test.exe", { type: "application/x-msdownload" });
      const result = validateFileUpload(file);
      expect(result.isValid).toBe(false);
    });
  });

  describe("validateRequestBodySize", () => {
    it("should validate small request body", () => {
      const body = { data: "test" };
      const result = validateRequestBodySize(body, 1024);
      expect(result.isValid).toBe(true);
    });

    it("should reject large request body", () => {
      const largeBody = { data: "x".repeat(2 * 1024 * 1024) }; // 2MB
      const result = validateRequestBodySize(largeBody, 1024 * 1024); // 1MB limit
      expect(result.isValid).toBe(false);
    });
  });

  describe("sanitizeObject", () => {
    it("should sanitize nested objects", () => {
      const obj = {
        name: '<script>alert("xss")</script>',
        nested: {
          value: "javascript:alert('xss')",
        },
        array: ["<script>test</script>", "safe"],
      };
      const result = sanitizeObject(obj);
      expect(result.name).not.toContain("<script");
      expect(result.nested.value).not.toContain("javascript:");
      expect(result.array[0]).not.toContain("<script");
      expect(result.array[1]).toBe("safe");
    });
  });

  describe("enhancedRateLimiter", () => {
    it("should allow requests within limit", () => {
      const result = enhancedRateLimiter.check("test-ip");
      expect(result.allowed).toBe(true);
    });

    it("should block requests exceeding limit", () => {
      // Make 101 requests
      for (let i = 0; i < 101; i++) {
        enhancedRateLimiter.check("test-ip-2");
      }
      const result = enhancedRateLimiter.check("test-ip-2");
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it("should reset rate limit", () => {
      enhancedRateLimiter.check("test-ip-3");
      enhancedRateLimiter.reset("test-ip-3");
      const result = enhancedRateLimiter.check("test-ip-3");
      expect(result.allowed).toBe(true);
    });
  });
});

