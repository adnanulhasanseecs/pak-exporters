/**
 * Skip Navigation Link Component
 * Allows keyboard users to skip to main content
 * WCAG 2.1 AA compliant
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function SkipNavigation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip link when Tab is pressed (first keyboard interaction)
      if (e.key === "Tab" && !isVisible) {
        setIsVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  return (
    <a
      href="#main-content"
      className={cn(
        "absolute left-0 top-0 z-[100] -translate-y-full rounded-b-md bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isVisible && "translate-y-0"
      )}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}

