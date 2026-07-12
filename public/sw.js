/**
 * Service worker mínimo, 100% estático (sin build step ni workbox).
 * Usa `self.registration.scope` para resolver rutas relativas al basePath
 * real del deploy (funciona igual en "/" que en "/mi-repo/").
 *
 * Estrategia por tipo de request (importante para GitHub Pages, que
 * reemplaza todos los archivos en cada deploy):
 * - Documentos HTML (navegación): network-first. Si sirviéramos el HTML
 *   cacheado de un deploy viejo, referenciaría chunks de `_next/static`
 *   con hash que ya no existen en el servidor nuevo -> la app se rompe
 *   hasta un hard refresh. La red manda siempre que haya conexión; la
 *   caché es solo el fallback offline.
 * - Assets con hash en `_next/static/` (inmutables por diseño de Next):
 *   cache-first. El nombre del archivo cambia si cambia el contenido, así
 *   que cachearlos "para siempre" es seguro y hace la app instantánea.
 * - Todo lo demás del mismo origen (íconos, manifest): stale-while-
 *   revalidate, un balance razonable para archivos chicos y poco críticos.
 */
const CACHE_NAME = "proximoferiado-v2";
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

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

function isImmutableAsset(url) {
  return url.pathname.includes("/_next/static/");
}

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error("offline y sin caché para esta ruta");
  }
}

async function cacheFirst(request, cache) {
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cache) {
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      if (isNavigationRequest(request)) return networkFirst(request, cache);
      if (isImmutableAsset(url)) return cacheFirst(request, cache);
      return staleWhileRevalidate(request, cache);
    })
  );
});
