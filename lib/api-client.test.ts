/**
 * API Client Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { apiClient, ApiClientError, createApiClient } from "./api-client";

// Mock fetch
global.fetch = vi.fn();

describe("ApiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Authentication", () => {
    it("should add auth token to requests", async () => {
      localStorage.setItem("auth_token", "test-token");
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({ data: "success" }),
      });

      await apiClient.get("/test");

      const callArgs = (fetch as any).mock.calls[0];
      expect(callArgs[0]).toContain("/test");
      expect(callArgs[1].headers.get("Authorization")).toBe("Bearer test-token");
    });

    it("should skip auth when skipAuth is true", async () => {
      localStorage.setItem("auth_token", "test-token");
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "success" }),
      });

      await apiClient.get("/test", { skipAuth: true });

      const callArgs = (fetch as any).mock.calls[0][1];
      expect(callArgs.headers.get("Authorization")).toBeNull();
    });

    it("should clear token and trigger onAuthError on 401", async () => {
      localStorage.setItem("auth_token", "test-token");
      const onAuthError = vi.fn();
      const client = createApiClient({
        baseURL: "http://localhost:8001/api",
        onAuthError,
      });

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Unauthorized" }),
      });

      await expect(client.get("/test")).rejects.toThrow(ApiClientError);
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(onAuthError).toHaveBeenCalled();
    });
  });

  describe("Retry Logic", () => {
    it("should retry on network errors", async () => {
      (fetch as any)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: "success" }),
        });

      const result = await apiClient.get("/test", { retries: 3 });
      expect(result).toEqual({ data: "success" });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("should not retry on 4xx errors (except 429)", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad Request" }),
      });

      await expect(apiClient.get("/test")).rejects.toThrow(ApiClientError);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should retry on 5xx errors", async () => {
      (fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: "Internal Server Error" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: "success" }),
        });

      const result = await apiClient.get("/test", { retries: 2 });
      expect(result).toEqual({ data: "success" });
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Rate Limiting", () => {
    it("should handle 429 rate limit errors", async () => {
      const onRateLimit = vi.fn();
      const client = createApiClient({
        baseURL: "http://localhost:8001/api",
        onRateLimit,
      });

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: (key: string) => (key === "Retry-After" ? "60" : null),
        },
        json: async () => ({ message: "Rate limit exceeded" }),
      });

      await expect(client.get("/test")).rejects.toThrow(ApiClientError);
      expect(onRateLimit).toHaveBeenCalledWith(60);
    });
  });

  describe("Request Methods", () => {
    it("should make GET request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "get" }),
      });

      const result = await apiClient.get("/test");
      expect(result).toEqual({ data: "get" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should make POST request with data", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "post" }),
      });

      const result = await apiClient.post("/test", { key: "value" });
      expect(result).toEqual({ data: "post" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ key: "value" }),
        })
      );
    });

    it("should make PUT request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "put" }),
      });

      const result = await apiClient.put("/test", { key: "value" });
      expect(result).toEqual({ data: "put" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("should make DELETE request", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: "delete" }),
      });

      const result = await apiClient.delete("/test");
      expect(result).toEqual({ data: "delete" });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw ApiClientError on non-ok responses", async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        json: async () => ({ message: "Not Found" }),
      });

      try {
        await apiClient.get("/test");
        expect.fail("Should have thrown ApiClientError");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).message).toContain("Not Found");
      }
    });

    it("should handle timeout", async () => {
      // Mock AbortController properly
      const abortSpy = vi.fn();
      const originalAbortController = global.AbortController;
      
      global.AbortController = class {
        signal = { aborted: false };
        abort = abortSpy;
      } as any;

      (fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const error = new DOMException("Aborted", "AbortError");
            reject(error);
          }, 100);
        });
      });

      await expect(
        apiClient.get("/test", { timeout: 50 })
      ).rejects.toThrow(ApiClientError);
      
      // Restore original
      global.AbortController = originalAbortController;
    });
  });
});

