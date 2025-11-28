const CACHE_NAME = "pwa-cache-v1";

const ASSETS_TO_CACHE = [
  "/pwa/",
  "/pwa/index.html",
  "/pwa/manifest.webmanifest"
];

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((resp) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resp.clone());
            return resp;
          });
        })
      );
    })
  );
});

// Notification
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/pwa/"));
});
