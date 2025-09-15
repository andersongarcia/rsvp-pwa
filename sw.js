// Nota: atualize o CACHE_VERSION quando alterar arquivos.
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './offline.html'
];
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    await cache.addAll(APP_SHELL);
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n)));
    self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const { request } = event;
  // network-first para HTML; cache-first para estáticos
  if (request.mode === 'navigate' || (request.destination === 'document')) {
    event.respondWith((async () => {
      try {
        const net = await fetch(request);
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, net.clone());
        return net;
      } catch {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match('./index.html')) || (await cache.match('./offline.html')) || Response.error();
      }
    })());
  } else if (['style','script','image','font'].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
      const cached = await cache.match(request);
      if (cached) return cached;
      const net = await fetch(request);
      cache.put(request, net.clone());
      return net;
    })());
  }
});