/**
 * Playwright Visual Regression Testing Configuration
 * 
 * This configuration extends the base Playwright config to enable
 * visual regression testing with screenshot comparison.
 */

import { defineConfig, devices } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
  ...baseConfig,
  
  // Visual comparison settings
  expect: {
    // Threshold for pixel comparison (0-1)
    // 0.2 means 20% of pixels can differ before test fails
    toHaveScreenshot: {
      threshold: 0.2,
      // Maximum number of pixels that can differ
      maxDiffPixels: 100,
      // Maximum percentage of pixels that can differ
      maxDiffPixelRatio: 0.01,
      // Animation timeout - wait for animations to complete
      animations: "disabled",
    },
    // Snapshot comparison settings
    toMatchSnapshot: {
      threshold: 0.2,
      maxDiffPixels: 100,
    },
  },

  // Test timeout for visual tests (longer for screenshots)
  timeout: 30 * 1000,

  // Retry failed visual tests once
  retries: 1,

  // Use all projects from base config
  projects: [
    {
      name: "chromium-visual",
      use: {
        ...devices["Desktop Chrome"],
        // Consistent viewport for visual tests
        viewport: { width: 1280, height: 720 },
        // Disable animations for consistent screenshots
        reducedMotion: "reduce",
        // Consistent color scheme
        colorScheme: "light",
      },
    },
    {
      name: "firefox-visual",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        reducedMotion: "reduce",
        colorScheme: "light",
      },
    },
    {
      name: "webkit-visual",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
        reducedMotion: "reduce",
        colorScheme: "light",
      },
    },
    // Mobile visual tests
    {
      name: "mobile-chrome-visual",
      use: {
        ...devices["Pixel 5"],
        reducedMotion: "reduce",
        colorScheme: "light",
      },
    },
    {
      name: "mobile-safari-visual",
      use: {
        ...devices["iPhone 12"],
      },
    },
  ],

  // Output directory for visual test artifacts
  outputDir: "test-results/visual/",
});

