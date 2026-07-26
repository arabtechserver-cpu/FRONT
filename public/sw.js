const CACHE_NAME = 'spider-store-cache-v1';
const OFFLINE_URL = '/';

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bypass cache for admin API queries or other admin operations
  if (event.request.url.includes('/api/admin') || event.request.url.includes('/admin')) {
    return;
  }

  // Network First Strategy: Always try network first to get the latest build assets, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful GET responses
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic' &&
          event.request.method === 'GET'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback for document navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // Return a fallback offline response instead of undefined to prevent TypeError
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});
