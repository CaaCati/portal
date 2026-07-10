const CACHE = 'muni-portal-v2';
const ASSETS = [
  './',
  './index.html',
  './Gestion.png',
  './IMG-20260325-WA0013.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const isHTML = req.mode === 'navigate' || req.destination === 'document';

  if (isHTML) {
    // NETWORK-FIRST: siempre intenta traer la versión nueva del HTML.
    // Si no hay internet, recién ahí usa la copia guardada.
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // CACHE-FIRST: para imágenes/estáticos, más rápido y no cambian seguido.
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
  }
});
