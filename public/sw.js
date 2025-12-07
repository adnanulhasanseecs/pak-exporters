/**
 * Service Worker for Pak-Exporters PWA
 * Implements caching strategy for offline support
 */

const CACHE_NAME = "pak-exporters-v1";
const RUNTIME_CACHE = "pak-exporters-runtime-v1";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/favicon.png",
  "/logos/logo-white-bg.png",
  "/logos/logo-black-bg.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return (
                cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
              );
            })
            .map((cacheName) => {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests (they should always be fresh)
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // TEMPORARILY DISABLED: Don't serve cached navigation requests
      // This prevents old cached pages from being served
      if (event.request.mode === "navigate") {
        // Always fetch navigation requests from network
        return fetch(event.request).catch(() => {
          // Only fallback to cache if network completely fails
          return cachedResponse || caches.match("/");
        });
      }
      
      // Return cached version if available (for non-navigation requests only)
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network fails and it's a navigation request, return offline page
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        });
    })
  );
});

// Message event - handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

