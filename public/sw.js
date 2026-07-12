/**
 * Service worker mínimo, 100% estático (sin build step ni workbox).
 * Usa `self.registration.scope` para resolver rutas relativas al basePath
 * real del deploy (funciona igual en "/" que en "/mi-repo/"), y aplica
 * stale-while-revalidate a peticiones GET del mismo origen para que la app
 * abra instantáneamente y funcione offline tras la primera visita.
 */
const CACHE_NAME = "proximoferiado-v1";
const CORE_PATHS = ["", "timeline/", "calendar/", "manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(CORE_PATHS.map((p) => new URL(p, self.registration.scope).toString()))
      )
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
