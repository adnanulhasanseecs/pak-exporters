/**
 * ARIA Live Region Component
 * Announces dynamic content changes to screen readers
 * WCAG 2.1 AA compliant
 */

"use client";

import { useEffect, useState } from "react";

interface ARIALiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
  clearOnUnmount?: boolean;
}

export function ARIALiveRegion({
  message,
  priority = "polite",
  clearOnUnmount = false,
}: ARIALiveRegionProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear message after announcement (screen readers typically read it once)
      const timer = setTimeout(() => {
        if (clearOnUnmount) {
          setAnnouncement("");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message, clearOnUnmount]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * Hook to use ARIA live region for announcements
 */
export function useARIALiveRegion() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = (text: string, urgent = false) => {
    setPriority(urgent ? "assertive" : "polite");
    setMessage(text);
    // Clear after announcement
    setTimeout(() => setMessage(""), 1000);
  };

  return {
    announce,
    LiveRegion: <ARIALiveRegion message={message} priority={priority} />,
  };
}

