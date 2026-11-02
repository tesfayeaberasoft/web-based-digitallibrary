const CACHE_NAME = 'digital-library-shell-v5';
const APP_SHELL_PATHS = [
  './',
  './index.html',
  './manifest.json',
  './asset-manifest.json',
  './digital-library-icon-192x192.png',
  './digital-library-icon-512x512.png',
  './favicon.ico',
  './browserconfig.xml',
];

const appShellUrl = (path) => new URL(path, self.registration.scope).toString();

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        console.log('[SW] Caching app shell...');
        // Cache core shell files
        await cache.addAll(APP_SHELL_PATHS.map((path) => appShellUrl(path)));

        // Try to cache entrypoint files from asset manifest
        try {
          const manifestResponse = await cache.match(
            appShellUrl('./asset-manifest.json')
          );
          if (manifestResponse) {
            const assetManifest = await manifestResponse.json();
            const entrypointUrls = assetManifest.entrypoints.map((path) =>
              new URL(path, self.location.origin).toString()
            );
            await cache.addAll(entrypointUrls);
            console.log('[SW] Cached entrypoint files');
          }
        } catch (e) {
          console.warn('[SW] Could not cache entrypoint files:', e);
        }
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log('[SW] Cleaning old caches...');
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith('digital-library-') &&
                cacheName !== CACHE_NAME
            )
            .map((cacheName) => {
              console.log('[SW] Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (
    request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    !requestUrl.href.startsWith(self.registration.scope)
  ) {
    return;
  }

  // Skip API requests - always fetch fresh
  if (requestUrl.pathname.includes('/api/') || requestUrl.pathname.includes('/backend/')) {
    return;
  }

  // Handle navigation requests (page loads)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        console.log('[SW] Navigation offline, serving cached shell');
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

  // Handle static assets (scripts, styles, images, fonts)
  if (['script', 'style', 'image', 'font'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await fetch(request);
          if (response.ok && response.type === 'basic') {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          console.warn('[SW] Fetch failed:', error);
          // Return a fallback for failed image requests
          if (request.destination === 'image') {
            return new Response('', { status: 404, statusText: 'Image not found' });
          }
          throw error;
        }
      })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');
