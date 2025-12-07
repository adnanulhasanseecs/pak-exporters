import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver
type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver
) => void;

class MockResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: ResizeObserverCallback) {
    // Mock implementation - callback intentionally unused
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback) {
    // Mock implementation - callback intentionally unused
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

// Mock PointerEvent for Radix UI components
if (typeof PointerEvent === "undefined") {
  globalThis.PointerEvent = class PointerEvent extends Event {
    pointerId = 0;
    pointerType = "mouse";
    bubbles = true;
    cancelable = true;
    constructor(type: string, init?: PointerEventInit) {
      super(type, init);
    }
  } as unknown as typeof PointerEvent;
}

// Mock hasPointerCapture for Radix UI
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
  Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {});
  Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {});
}

// Note: fetch should be mocked in individual test files that need it
// We don't set a default mock here to avoid conflicts

