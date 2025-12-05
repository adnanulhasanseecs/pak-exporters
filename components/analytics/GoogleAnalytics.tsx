/**
 * Google Analytics Component
 * Initializes and manages Google Analytics tracking
 */

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGoogleAnalytics, trackPageView } from "@/lib/analytics";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (!gaId) {
      console.log("[Analytics] Google Analytics ID not configured");
      return;
    }

    // Initialize Google Analytics
    initGoogleAnalytics(gaId);
  }, []);

  useEffect(() => {
    // Track page views on route change
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

