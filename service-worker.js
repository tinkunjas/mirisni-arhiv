const CACHE = 'mirisni-arhiv-pwa-20261115-supabase-connected-v4';
const SHELL = ['./', './index.html', './manifest.webmanifest', './css/base.css', './css/theme.css', './css/atelier.css', './js/data.js', './js/app.js', './js/config.js', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(SHELL.map(path => cache.add(path)))));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mirisni-arhiv-pwa-') && key !== CACHE).map(key => caches.delete(key)))), self.clients.claim()]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {if(response.ok) {const copy=response.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy));} return response;}).catch(()=>caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {if(response.ok && response.type==='basic') {const copy=response.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return response;})));
});
