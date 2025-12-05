/**
 * Analytics Provider Component
 * Wraps the app with analytics initialization
 */

"use client";

import { useEffect } from "react";
import { initErrorTracking } from "@/lib/monitoring";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize error tracking
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      initErrorTracking(sentryDsn);
    }
  }, []);

  return <>{children}</>;
}

