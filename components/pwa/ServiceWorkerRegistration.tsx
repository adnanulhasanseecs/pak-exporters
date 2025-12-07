/**
 * Service Worker Registration Component
 * Registers the service worker for PWA functionality
 */

"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // TEMPORARILY DISABLED: Service worker is caching old pages
      // Unregister all service workers first
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log("[Service Worker] Unregistered:", registration.scope);
        }
      });

      // Don't register new service worker for now - DISABLED
      // This prevents old cached pages from being served
      return;
    }
  }, []);

  return null;
}

