/* Only public app assets are cached. Live store and account data stays online. */
const APP_CACHE = 'borai-app-v1';
const APP_ASSETS = ['/offline.html', '/borai-favicon-192.png', '/borai-favicon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('borai-app-') && name !== APP_CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname === '/admin' || url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/')) return;

  if (APP_ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  } else if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      return await caches.match('/offline.html') || new Response('الاتصال بالإنترنت مطلوب لفتح المتجر.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }));
  }
});
