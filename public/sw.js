// Table Rush service worker — cache-first app shell so the game loads
// instantly and works offline after the first visit.
//
// Vite fingerprints every asset (index-XXXX.js), so cache-first is safe:
// new deploys produce new URLs, and CACHE_VERSION bumps clear stale shells.
const CACHE_VERSION = 'tablerush-v4';

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // network-first for the HTML shell (so deploys show up), cache-first for
    // fingerprinted assets
    const isShell = req.mode === 'navigate';
    if (isShell) {
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        const hit = await cache.match(req);
        if (hit) return hit;
        throw new Error('offline and no cached shell');
      }
    }
    const hit = await cache.match(req);
    if (hit) return hit;
    const fresh = await fetch(req);
    if (fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  })());
});
