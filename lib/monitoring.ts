/**
 * Error tracking and monitoring utilities
 * Supports Sentry and other error tracking services
 */

/**
 * Initialize error tracking (Sentry)
 */
export function initErrorTracking(dsn?: string): void {
  if (typeof window === "undefined" || !dsn) return;

  // Sentry initialization would go here
  // For now, we'll use console.error and can integrate Sentry later
  console.log("[Monitoring] Error tracking initialized");
}

/**
 * Capture exception
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): void {
  console.error("[Error]", error, context);

  // In production, send to Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  console[level === "error" ? "error" : level === "warning" ? "warn" : "log"](
    `[${level.toUpperCase()}]`,
    message,
    context
  );

  // In production, send to Sentry
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry.captureMessage(message, { level, extra: context });
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string): void {
  if (typeof window === "undefined") return;

  // Sentry.setUser({ id: userId, email });
  console.log("[Monitoring] User context set", { userId, email });
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (typeof window === "undefined") return;

  // Sentry.setUser(null);
  console.log("[Monitoring] User context cleared");
}

/**
 * Performance monitoring
 */
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  console.log(`[Performance] ${name}: ${duration}ms`, metadata);

  // Send to analytics
  if (window.gtag) {
    window.gtag("event", "timing_complete", {
      name,
      value: Math.round(duration),
      ...metadata,
    });
  }
}

