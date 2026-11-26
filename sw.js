const CACHE = 'ats-app-v8';
const PRECACHE = [
  './', './index.html', './offline.html', './css/app.css?v=8',
  './js/config.js', './js/app.js', './js/home.js', './js/zaiko.js', './js/mitsumori.js', './js/kaitori.js', './js/jirei.js', './js/tsuuchi.js',
  './manifest.webmanifest', './favicon.svg',
  './zaiko/', './mitsumori/', './kaitori/', './jirei/', './tsuuchi/', './soudan/', './install/',
  './data/stock.json', './data/cases.json', './data/prices.json',
  './img/icons/icon-192.png', './img/icons/icon-512.png', './img/stock/hero-20ft-blue.webp', './img/qr-ats-app.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE && k !== 'ats-meta'; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 在庫・事例データとページ本体は「通信優先」（最新を表示し、オフライン時だけキャッシュ）
  var networkFirst = /\/data\/.+\.json$/.test(url.pathname) || req.mode === 'navigate';
  if (networkFirst) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (m) { return m || (req.mode === 'navigate' ? caches.match('./offline.html') : undefined); });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      var fetched = fetch(req).then(function (res) {
        if (res && res.status === 200) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return cached; });
      return cached || fetched;
    })
  );
});

// 定期確認（対応ブラウザでホーム画面に追加した場合のみ）：新しい在庫があれば通知する
self.addEventListener('periodicsync', function (event) {
  if (event.tag !== 'ats-stock') return;
  event.waitUntil(checkStock());
});

function checkStock() {
  var base = self.registration.scope;
  return Promise.all([
    fetch(base + 'data/stock.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
    caches.open('ats-meta').then(function (c) { return c.match(base + '__known.json'); }).then(function (r) { return r ? r.json() : null; })
  ]).then(function (res) {
    var items = res[0].items || [], known = res[1];
    var ids = items.map(function (i) { return i.id; });
    var store = caches.open('ats-meta').then(function (c) {
      return c.put(base + '__known.json', new Response(JSON.stringify(ids), { headers: { 'content-type': 'application/json' } }));
    });
    if (!known) return store;
    var fresh = items.filter(function (i) { return known.indexOf(i.id) === -1; });
    if (!fresh.length) return store;
    var title = fresh.length === 1 ? '新しい在庫が掲載されました' : '新しい在庫が ' + fresh.length + ' 件掲載されました';
    return store.then(function () {
      return self.registration.showNotification(title, {
        body: fresh.slice(0, 3).map(function (i) { return i.title; }).join('\n'),
        icon: base + 'img/icons/icon-192.png', badge: base + 'img/icons/icon-192.png',
        tag: 'ats-stock', data: { url: base + 'zaiko/' }
      });
    });
  }).catch(function () {});
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(self.clients.openWindow(url));
});
