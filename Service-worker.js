// service-worker.js

const CACHE_NAME = "pwa-cache-v1";

const ASSETS_TO_CACHE = [
  "/",                // Main page
  "/index.html",
  "/manifest.webmanifest"
];

// =========== INSTALL ===========
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// =========== ACTIVATE ===========
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activated");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// =========== FETCH ===========
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(event.request)
          .then((fetchRes) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
          .catch(() => caches.match("/offline.html"))
      );
    })
  );
});
