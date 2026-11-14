// Service worker minimal : il rend l'app installable.
// Pas de cache hors ligne pour l'instant, pour toujours afficher la dernière version.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
