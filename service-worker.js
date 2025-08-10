// service-worker.js
const NPD_CACHE = 'npd-v3'; // bump version
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(NPD_CACHE).then(cache => cache.addAll(PRECACHE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== NPD_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network-first with cache fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(NPD_CACHE);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(NPD_CACHE);
        return (await cache.match(req)) || cache.match('/index.html');
      }
    })());
    return;
  }

  // Static assets: cache-first with background refresh
  if (['image','style','script','font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(NPD_CACHE);
      const cached = await cache.match(req);
      if (cached) {
        fetch(req).then(res => res && cache.put(req, res.clone())).catch(()=>{});
        return cached;
      }
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return new Response('', { status: 408, statusText: 'Offline' });
      }
    })());
  }
});
