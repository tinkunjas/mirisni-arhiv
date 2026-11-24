'use strict';
const CACHE = 'mirisni-arhiv-pwa-20261124-five-clicks-01';
const SHELL = ['./', './index.html', './manifest.webmanifest', './css/catalog.css', './js/data.js', './js/ui.js', './js/presentation.js', './js/fragrantica-enrichment.js', './js/app.js', './js/config.js', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(SHELL.map(path => cache.add(path)))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mirisni-arhiv-pwa-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  const isShell = request.mode === 'navigate' || /\.(?:js|css)$/.test(url.pathname);
  const isImage = /\.(?:png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname);
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, {ignoreSearch: true});
    if (isImage && cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && (isShell || isImage)) {
        const copy = response.clone();
        const key = new URL(request.url);
        key.search = '';
        event.waitUntil(cache.put(key.href, copy));
      }
      return response;
    } catch {
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});
