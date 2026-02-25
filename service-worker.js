const CACHE_NAME = "trade-engine-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ===== INSTALL =====
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ===== ACTIVATE (CLEAN OLD CACHE) =====
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ===== FETCH =====
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {

      // 1. Serve from cache if exists
      if (response) return response;

      // 2. Else fetch from network
      return fetch(e.request)
        .then(res => {

          // 3. Cache new request (dynamic caching)
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, res.clone());
            return res;
          });

        })
        .catch(() => {

          // 4. Fallback for navigation requests (fix 404)
          if (e.request.mode === "navigate") {
            return caches.match("./index.html");
          }

        });
    })
  );
});
