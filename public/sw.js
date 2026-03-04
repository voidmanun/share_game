const CACHE_NAME = 'share-game-v1';

self.addEventListener('install', (e) => {
  // Don't skipWaiting - wait for user to refresh
  console.log('SW installed, waiting for activation');
});

self.addEventListener('activate', (e) => {
  // Clean old caches
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  console.log('SW activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Cache-first strategy: serve from cache, update cache in background
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) {
        // Return cached version immediately
        const networkFetch = fetch(e.request).then((response) => {
          // Update cache in background
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, response);
          });
        }).catch(() => {});
        return cached;
      }
      // Not in cache, fetch from network
      return fetch(e.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      });
    }).catch(() => {
      // Offline fallback
      return new Response('Offline', { status: 503 });
    })
  );
});
