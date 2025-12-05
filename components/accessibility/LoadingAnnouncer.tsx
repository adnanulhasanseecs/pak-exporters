/**
 * Loading Announcer Component
 * Announces loading states to screen readers
 * WCAG 2.1 AA compliant
 */

"use client";

import { useEffect, useState } from "react";
import { ARIALiveRegion } from "./ARIALiveRegion";

interface LoadingAnnouncerProps {
  isLoading: boolean;
  loadingMessage?: string;
  completeMessage?: string;
}

export function LoadingAnnouncer({
  isLoading,
  loadingMessage = "Loading, please wait",
  completeMessage = "Loading complete",
}: LoadingAnnouncerProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoading) {
      setMessage(loadingMessage);
    } else if (message && !isLoading) {
      // Only announce completion if we previously announced loading
      setMessage(completeMessage);
      // Clear after announcement
      setTimeout(() => setMessage(""), 1000);
    }
  }, [isLoading, loadingMessage, completeMessage, message]);

  return <ARIALiveRegion message={message} priority="polite" />;
}

/**
 * Hook to announce loading states
 */
export function useLoadingAnnouncement(
  isLoading: boolean,
  loadingMessage?: string,
  completeMessage?: string
) {
  return (
    <LoadingAnnouncer
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      completeMessage={completeMessage}
    />
  );
}

