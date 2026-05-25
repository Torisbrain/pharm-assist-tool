const CACHE_NAME = "pharmverify-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/index.tsx", // In TanStack Start, the routes might be different, but caching the root is key
  // appCss will be hashed so we can't easily hardcode it here without more logic
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        // Clone the response to store in cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API calls or external resources unless specified
          const url = new URL(event.request.url);
          if (url.origin === self.location.origin && !url.pathname.startsWith("/api")) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      });
    }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
            return caches.match('/');
        }
    })
  );
});
