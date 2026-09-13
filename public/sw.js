// Service Worker para Acá Falta la Muni — Osorno
// Resiliencia para sectores rurales con nula/baja cobertura (Cancura, Pichil, Forrahue, Curaco)

const CACHE_NAME = 'aca-falta-muni-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navegación principal (HTML): Network first, fallback to cached '/'
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/') || new Response('Sin conexión', { status: 503 }))
    );
    return;
  }

  // 2. Teselas de OpenStreetMap: Cache first con revalidación de fondo
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open('osm-tiles-cache').then(async (tileCache) => {
        const cached = await tileCache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            tileCache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          return new Response('', { status: 408 });
        }
      })
    );
    return;
  }

  // 3. API GET /api/reports: Network first con respaldo en caché para modo offline rural
  if (url.pathname.startsWith('/api/reports') && request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open('api-cache').then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 4. Recursos estáticos (_next, fonts, uploads): Cache first
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/uploads/') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: Network fetch
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
