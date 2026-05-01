const CACHE_NAME = 'tabuada-mestre-v7';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './audio.js',
  './app-version.json',
  './version.txt',
  './manifest.json',
  './js/app.js',
  './js/modules/game.js',
  './js/modules/state.js',
  './js/modules/ui.js',
  './js/modules/stats.js',
  './js/modules/store.js',
  './js/modules/lousa.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('/app-version.json') || url.pathname.endsWith('/version.txt')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
        return Promise.resolve();
      })
    ))
  );
  return self.clients.claim();
});
