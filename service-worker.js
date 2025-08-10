// Minimal SW just to verify registration
self.addEventListener('install', () => {
  // no-op
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
