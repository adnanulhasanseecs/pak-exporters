# Visual Regression Testing Guide

This guide explains how to use visual regression testing in the Pak-Exporters project.

## Overview

Visual regression testing captures screenshots of UI components and pages to detect unintended visual changes. This helps catch UI bugs before they reach production.

## Setup

Visual regression testing is configured using Playwright with a dedicated configuration file (`playwright-visual.config.ts`).

### Prerequisites

- Playwright installed (`npm install -D @playwright/test`)
- Application running on `http://localhost:3001` (or set `NEXT_PUBLIC_APP_URL`)

## Running Visual Tests

### Run All Visual Tests

```bash
npm run test:visual
```

### Update Snapshots

When you intentionally change the UI, update the baseline snapshots:

```bash
npm run test:visual:update
```

### Run with UI Mode

For interactive debugging:

```bash
npm run test:visual:ui
```

## Test Files

Visual regression tests are located in:
- `e2e/visual-regression.spec.ts` - Main visual regression test suite

## What Gets Tested

The visual regression tests capture screenshots of:

1. **Full Pages:**
   - Homepage
   - Product detail page
   - Search results page
   - Login page
   - Registration page
   - RFQ form
   - Dashboard (if authenticated)
   - Category listing
   - Company profile

2. **Components:**
   - Header
   - Footer
   - Product card
   - Company card

3. **Responsive Views:**
   - Mobile viewport (375x667)
   - Tablet viewport (768x1024)
   - Desktop viewport (1280x720)

## Configuration

### Threshold Settings

The visual comparison uses these thresholds (configured in `playwright-visual.config.ts`):

- **Threshold:** 0.2 (20% of pixels can differ)
- **Max Diff Pixels:** 100 pixels
- **Max Diff Pixel Ratio:** 0.01 (1%)

These can be adjusted based on your needs:
- Lower values = stricter comparison (catches more changes)
- Higher values = more lenient (allows minor differences)

### Viewport Consistency

All visual tests use consistent viewports to ensure reproducible screenshots:
- Desktop: 1280x720
- Tablet: 768x1024
- Mobile: 375x667

### Animation Handling

Animations are disabled during visual tests to ensure consistent screenshots:
- `reducedMotion: "reduce"` in test configuration
- `animations: "disabled"` in screenshot options

## Workflow

### 1. Initial Setup

When setting up visual regression testing for the first time:

```bash
# Run tests to generate baseline snapshots
npm run test:visual:update
```

This creates baseline screenshots in `test-results/visual/`.

### 2. Regular Testing

During development:

```bash
# Run visual tests to check for regressions
npm run test:visual
```

If tests fail, review the diff images to see what changed.

### 3. Updating Baselines

When you intentionally change the UI:

```bash
# Update snapshots to reflect new design
npm run test:visual:update
```

**Important:** Only update snapshots after reviewing and approving the visual changes.

### 4. CI/CD Integration

Visual regression tests can be integrated into CI/CD:

```yaml
# Example GitHub Actions step
- name: Run visual regression tests
  run: npm run test:visual
```

For CI environments, you may want to:
- Upload failed screenshots as artifacts
- Use a service like Percy or Chromatic for visual comparison
- Store baseline images in version control

## Best Practices

### 1. Stable Test Data

Use consistent, stable test data for visual tests to avoid false positives from dynamic content.

### 2. Wait for Content

Always wait for content to load before capturing screenshots:

```typescript
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1000); // Wait for animations
```

### 3. Exclude Dynamic Content

For elements with dynamic content (timestamps, random IDs), you may want to:
- Mask them in screenshots
- Use more lenient thresholds
- Test them separately

### 4. Review Failures Carefully

Not all visual differences are bugs:
- Intentional design changes
- Font rendering differences
- Browser-specific rendering
- Timing-related differences

### 5. Keep Snapshots in Version Control

Store baseline screenshots in version control so the team can review changes.

## Troubleshooting

### Tests Fail Due to Minor Differences

- Increase threshold values in `playwright-visual.config.ts`
- Check if differences are in dynamic content
- Ensure animations are fully disabled

### Screenshots Look Different Across Browsers

- This is expected - browser rendering can differ
- Consider testing only in Chromium for consistency
- Or use browser-specific baselines

### Flaky Tests

- Increase wait times
- Ensure network is idle before capturing
- Check for loading states

### Large Screenshot Files

- Use `fullPage: false` for component tests
- Compress images if needed
- Consider using image optimization

## Advanced Usage

### Component-Level Testing

For specific components:

```typescript
test("Button component variants", async ({ page }) => {
  await page.goto(`${BASE_URL}/components`);
  const button = page.locator('[data-testid="button-primary"]');
  await expect(button).toHaveScreenshot("button-primary.png");
});
```

### Responsive Testing

Test multiple viewports:

```typescript
const viewports = [
  { width: 375, height: 667, name: "mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1280, height: 720, name: "desktop" },
];

for (const viewport of viewports) {
  test(`Homepage - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`);
  });
}
```

### Masking Dynamic Content

Hide elements that change frequently:

```typescript
await expect(page).toHaveScreenshot("page.png", {
  mask: [
    page.locator('[data-testid="timestamp"]'),
    page.locator('[data-testid="user-id"]'),
  ],
});
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
- name: Run visual regression tests
  run: npm run test:visual
  continue-on-error: true

- name: Upload visual test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-test-results
    path: test-results/visual/
```

### Using Visual Testing Services

For better visual comparison and review:

- **Percy** - Visual testing platform
- **Chromatic** - Storybook visual testing
- **Applitools** - AI-powered visual testing

## Maintenance

### Regular Updates

- Review and update snapshots monthly
- Remove obsolete test cases
- Update thresholds as needed

### Performance

- Visual tests can be slow - run them in parallel
- Consider running only on critical paths in CI
- Use visual testing services for faster comparison

---

**Last Updated:** 2025-01-XX

