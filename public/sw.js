// Service worker d'Hestia : app installable, ouverture hors ligne, rappels du week-end.
const CACHE = 'hestia-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Seulement nos propres fichiers : les données (Supabase) ne passent jamais par le cache.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Pages : le réseau d'abord (toujours la dernière version), la copie en cache sans réseau.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/')),
    );
    return;
  }

  // Fichiers de l'app (noms uniques à chaque version) : le cache d'abord.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (url.pathname.startsWith('/assets/') || /\.(png|svg|webmanifest|woff2?)$/.test(url.pathname))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});

// Rappel du week-end
self.addEventListener('push', (event) => {
  let m = { titre: 'Hestia', corps: '', url: '/' };
  try {
    m = { ...m, ...event.data.json() };
  } catch {
    /* message vide */
  }
  event.waitUntil(self.registration.showNotification(m.titre, { body: m.corps, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: m.url } }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => new URL(c.url).origin === self.location.origin);
      return open ? open.focus() : self.clients.openWindow(url);
    }),
  );
});
