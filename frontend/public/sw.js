const CACHE_NAME = 'digital-library-shell-v4';
const APP_SHELL_PATHS = [
  './',
  './index.html',
  './manifest.json',
  './asset-manifest.json',
  './digital-library-icon-192x192.png',
  './digital-library-icon-512x512.png',
  './favicon.ico',
];

const appShellUrl = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        await cache.addAll(APP_SHELL_PATHS.map((path) => appShellUrl(path)));

        const manifestResponse = await cache.match(
          appShellUrl('./asset-manifest.json')
        );
        const assetManifest = await manifestResponse.json();
        const entrypointUrls = assetManifest.entrypoints.map((path) =>
          new URL(path, self.location.origin).toString()
        );

        await cache.addAll(entrypointUrls);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith('digital-library-') &&
                cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (
    request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    !requestUrl.href.startsWith(self.registration.scope)
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match(appShellUrl('./index.html'));
        return (
          cachedPage ||
          new Response('You are offline and this page is not cached.', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        );
      })
    );
    return;
  }

  if (!['script', 'style', 'image', 'font'].includes(request.destination)) {
    return;
  }

  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })
  );
});
