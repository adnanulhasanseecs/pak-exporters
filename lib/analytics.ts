/**
 * Analytics utilities
 * Supports Google Analytics and other analytics providers
 */

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Initialize Google Analytics
 */
export function initGoogleAnalytics(measurementId: string): void {
  if (typeof window === "undefined") return;

  // Prevent duplicate initialization
  if (window.gtag) return;

  // Create data layer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(
    command: string,
    targetId: string | Date,
    config?: Record<string, unknown>
  ): void {
    window.dataLayer?.push({
      command,
      targetId,
      ...config,
    });
  }

  window.gtag = gtag;

  // Load Google Analytics script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize
  gtag("js", new Date());
  gtag("config", measurementId, {
    page_path: window.location.pathname,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("config", process.env.NEXT_PUBLIC_GA_ID || "", {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track event
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Track conversion
 */
export function trackConversion(conversionId: string, value?: number): void {
  trackEvent("conversion", "engagement", conversionId, value);
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount?: number): void {
  trackEvent("search", "engagement", query, resultsCount);
}

/**
 * Track product view
 */
export function trackProductView(productId: string, productName: string): void {
  trackEvent("view_item", "ecommerce", productName);
  trackEvent("product_view", "engagement", productId);
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, success: boolean): void {
  trackEvent(
    success ? "form_submit_success" : "form_submit_error",
    "engagement",
    formName
  );
}

