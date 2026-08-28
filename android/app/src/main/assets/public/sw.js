const VERSION = 'reader-v2';
const SHELL = `${VERSION}-shell`;
const OCR = `${VERSION}-ocr`;
const APP_SHELL = ['/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(APP_SHELL);
    const response = await fetch('/');
    const markup = await response.clone().text();
    await cache.put('/', response);
    const builtAssets = [...markup.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
    await cache.addAll([...new Set(builtAssets)]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => ![SHELL, OCR].includes(name)).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/ocr/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(caches.open(url.pathname.startsWith('/ocr/') ? OCR : SHELL).then(async cache => {
      const saved = await cache.match(url.pathname, { ignoreSearch: true });
      if (saved) return saved;
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(SHELL);
        cache.put('/', fresh.clone());
        return fresh;
      } catch {
        return (await caches.match('/')) || (await caches.match('/offline.html'));
      }
    })());
    return;
  }
  event.respondWith(caches.match(event.request).then(saved => saved || fetch(event.request)));
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
