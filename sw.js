/* FS SYS shell SW — generated; do not edit */
const CACHE_NAME = "fs-sys-shell-18.11.2026, 08:33 UTC";
const PRECACHE = [
  "/FS_SYS_CUSTOM/index.html",
  "/FS_SYS_CUSTOM/manifest.webmanifest",
  "/FS_SYS_CUSTOM/icons/icon-192.png",
  "/FS_SYS_CUSTOM/icons/icon-512.png",
  "/FS_SYS_CUSTOM/chunk-qwyqvff6.js",
  "/FS_SYS_CUSTOM/chunk-zkrm65b6.css"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Per-URL add so one bad asset does not abort the whole shell install.
      await Promise.all(
        PRECACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('SW precache skip', url, err);
          })
        )
      );
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(req)) ||
            (await cache.match(new URL('index.html', self.registration.scope))) ||
            (await cache.match(self.registration.scope)) ||
            Response.error()
          );
        })
    );
    return;
  }

  // Same-origin static: cache-first
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) void cache.put(req, res.clone());
        return res;
      } catch {
        return Response.error();
      }
    })
  );
});
