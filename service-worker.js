const CACHE='mirisni-arhiv-pwa-20261119-final-clean-01';
const SHELL=['./','./index.html','./manifest.webmanifest','./css/base.css','./css/theme.css','./css/atelier.css','./js/data.js','./js/app.js','./js/config.js','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(SHELL.map(p=>c.add(p)))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mirisni-arhiv-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(req.mode==='navigate'||/\.(?:js|css)$/.test(url.pathname)){
  e.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html'))));return;
 }
 if(/\.(?:png|jpg|jpeg|webp|svg|ico)$/.test(url.pathname)){
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}return res;})));return;
 }
 e.respondWith(fetch(req).catch(()=>caches.match(req)));
});
