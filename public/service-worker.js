const CACHE_NAME = "static-cache-v2";
const DATA_NAME = "data-cache-v1";
const FILES_CACHED = [
  "/",
  "/db.js",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_CACHED);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_NAME) {
            console.log("Removing old cached data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
      })
    );
    return;
  }
});