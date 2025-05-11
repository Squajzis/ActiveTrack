const CACHE_NAME = "active-track-cache-v1";
const urlsToCache = [
  "/", "/index.html",
  "/scripts/app.js",
  "/manifest.json",
  "/images/logo.png"
];

self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => res || fetch(evt.request))
  );
});
