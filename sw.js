/* Hace que la app abra sin internet. Estrategia: primero la red (para que
   los cambios lleguen solos), y si no hay, lo guardado. */
const CACHE = 'pastillas-v2';
const ARCHIVOS = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  /* Sólo lo nuestro. El confeti viene de un CDN y la página ya tolera que falte. */
  if (!e.request.url.startsWith(self.registration.scope)) return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
  );
});
