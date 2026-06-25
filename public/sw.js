// Service worker mínimo y SEGURO para Next.js.
// Regla de oro: NUNCA servir código de la app "cache-first", porque tras un
// deploy los chunks/RSC cambian y servir versiones viejas rompe la navegación
// (los tabs daban error por esto). Solo cacheamos:
//   1) assets inmutables hasheados (/_next/static/...) → cache-first es seguro.
//   2) navegaciones → red primero, con respaldo offline.
// Todo lo demás (RSC ?_rsc=, /_next/data, API…) pasa directo a la red.
const CACHE = "vu-v2";
const SHELL = ["/offline", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // no tocar terceros (mapas, etc.)

  // Assets inmutables y hasheados: cache-first es seguro (el hash cambia con cada build).
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Navegaciones (HTML): red primero, respaldo en caché y luego página offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("/offline"))
        )
    );
    return;
  }

  // Resto (RSC, _next/data, API, datos dinámicos): SIEMPRE a la red, nunca caché.
  // (No interceptamos: el navegador maneja la petición normalmente.)
});
