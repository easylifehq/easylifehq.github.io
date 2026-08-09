const CACHE_PREFIX = "easylife-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v6`;
const CORE_ASSETS = ["/", "/manifest.webmanifest", "/icons/easylife-icon.svg", "/icons/easylife-icon-192.png", "/icons/easylife-icon-512.png", "/icons/easylife-apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseCopy = networkResponse.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put("/", responseCopy)));
          }
          return networkResponse;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseCopy = networkResponse.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy)));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request));
    })
  );
});
