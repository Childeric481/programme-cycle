/// <reference lib="webworker" />
// Service worker. PRECACHE et CACHE_VERSION sont injectés à la construction
// (build/pwa.ts). Hors ligne total dès la première visite : tout est mis en
// cache à l'installation. Pas d'activation automatique d'une nouvelle version :
// la page affiche un bandeau et c'est la personne qui décide de recharger.

declare const self: ServiceWorkerGlobalScope;
declare const PRECACHE: readonly string[];
declare const CACHE_VERSION: string;

const CACHE = `programme-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cles = await caches.keys();
      await Promise.all(cles.filter((c) => c.startsWith('programme-') && c !== CACHE).map((c) => caches.delete(c)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data: unknown = event.data;
  if (typeof data === 'object' && data !== null && 'type' in data && data.type === 'activer') {
    void self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const requete = event.request;
  if (requete.method !== 'GET') return;
  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  if (requete.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const page = await cache.match('index.html');
        return page ?? fetch(requete);
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const trouve = await cache.match(requete, { ignoreSearch: true });
      return trouve ?? fetch(requete);
    })(),
  );
});
