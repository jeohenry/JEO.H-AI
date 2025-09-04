const CACHE_NAME = "jeoh-ai-cache-v2"; // bump version to refresh cache

const STATIC_ASSETS = [
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-icon.png",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // activate immediately
});

// Fetch: different strategies for HTML vs. other assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Always try network first for HTML (prevents stale index.html)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html")) // offline fallback
    );
    return;
  }

  // For static assets: cache-first
  if (STATIC_ASSETS.some((asset) => req.url.includes(asset))) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Default: try network, fallback to cache (stale-while-revalidate style)
  event.respondWith(
    fetch(req)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

// Activate: clean up old caches
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