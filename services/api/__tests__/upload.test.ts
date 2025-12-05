import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  validateImageFile,
  uploadImage,
  uploadImages,
  deleteImage,
  compressImage,
} from "../upload";

describe("Upload Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateImageFile", () => {
    it("should validate valid image file", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid file type", () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      const result = validateImageFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid file type");
    });

    it("should reject file larger than 5MB", () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const result = validateImageFile(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("5MB");
    });

    it("should accept valid file sizes", () => {
      const file = new File([new ArrayBuffer(2 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const result = validateImageFile(file);

      expect(result.valid).toBe(true);
    });

    it("should accept various image types", () => {
      const types = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      types.forEach((type) => {
        const file = new File(["content"], `test.${type.split("/")[1]}`, { type });
        const result = validateImageFile(file);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe("uploadImage", () => {
    it("should upload a valid image file", async () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const result = await uploadImage(file);

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("filename", "test.jpg");
      expect(result).toHaveProperty("size", file.size);
      expect(result).toHaveProperty("type", "image/jpeg");
    });

    it("should reject invalid file type", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      await expect(uploadImage(file)).rejects.toThrow(/invalid.*file/i);
    });

    it("should reject file larger than 5MB", async () => {
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await expect(uploadImage(largeFile)).rejects.toThrow("5MB");
    });

    it("should call progress callback", async () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      const onProgress = vi.fn();

      await uploadImage(file, onProgress);

      expect(onProgress).toHaveBeenCalled();
      const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
      expect(lastCall.percentage).toBe(100);
    });
  });

  describe("uploadImages", () => {
    it("should upload multiple images", async () => {
      const files = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      const results = await uploadImages(files);

      expect(results).toHaveLength(2);
      expect(results[0].filename).toBe("test1.jpg");
      expect(results[1].filename).toBe("test2.jpg");
    });

    it("should call progress callback for each file", async () => {
      const files = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];
      const onProgress = vi.fn();

      await uploadImages(files, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should stop on first error", async () => {
      const files = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.txt", { type: "text/plain" }),
      ];

      await expect(uploadImages(files)).rejects.toThrow();
    });
  });

  describe("deleteImage", () => {
    it("should delete an image", async () => {
      const url = "https://example.com/image.jpg";

      await expect(deleteImage(url)).resolves.not.toThrow();
    });
  });

  describe("compressImage", () => {
    it("should return original file (placeholder)", async () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const result = await compressImage(file);

      expect(result).toBe(file);
    });
  });
});

