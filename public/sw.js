const CACHE_NAME = "jeoh-ai-cache-v1";

const ASSETS_TO_CACHE = [
  "/",                  // root
  "/index.html",        // main entry
  "/manifest.json",     // PWA manifest
  "/favicon.ico",       // favicon
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-icon.png"
];

// Install and cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // activate immediately
});

// Fetch from cache first, fallback to network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() =>
        caches.match("/index.html") // fallback offline to homepage
      );
    })
  );
});

// Activate and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});