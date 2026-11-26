const CACHE = 'ats-app-v7';
const PRECACHE = [
  './',
  './index.html',
  './offline.html',
  './css/app.css',
  './js/app.js',
  './js/zaiko.js',
  './js/jirei.js',
  './manifest.webmanifest',
  './favicon.svg',
  './zaiko/',
  './zaiko/index.html',
  './kaitori/',
  './kaitori/index.html',
  './jirei/',
  './jirei/index.html',
  './install/',
  './install/index.html',
  './thanks/',
  './thanks/index.html',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './img/stock/hero-20ft-blue.webp',
  './img/qr-ats-app.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  var isData = /\/(inventory|cases)\.json$/.test(url.pathname);
  if (isData) {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      var fetched = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        if (cached) return cached;
        if (req.mode === 'navigate') return caches.match('./offline.html');
        return caches.match('./offline.html');
      });
      return cached || fetched;
    })
  );
});
