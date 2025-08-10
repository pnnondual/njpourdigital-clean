self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("njpourdigital-cache").then(cache => {
      return cache.addAll([
        "/njpourdigital-clean/",
        "/njpourdigital-clean/index.html",
        "/njpourdigital-clean/styles.css"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
