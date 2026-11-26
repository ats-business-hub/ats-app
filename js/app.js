(function () {
  var root = document.documentElement.getAttribute('data-root') || './';
  var CFG = window.ATS_CONFIG || {};
  var ATS = window.ATS = { root: root, cfg: CFG };

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(root + 'sw.js').catch(function () {});
    });
  }

  /* ---------- helpers ---------- */
  ATS.esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  ATS.yen = function (n) { return '¥' + Math.round(n).toLocaleString('ja-JP'); };
  ATS.tax = function (n) { return Math.round(n * 1.1); };
  ATS.toast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2600);
  };
  ATS.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); return ok;
    }
  };
  ATS.store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  ATS.getJSON = function (name) {
    return fetch(root + 'data/' + name, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(r.status); return r.json();
    });
  };

  /* ---------- stock / new-arrival tracking ---------- */
  ATS.sizeBucket = function (size) {
    var n = parseFloat(size || '');
    if (!n) return '';
    if (n <= 10) return '10';
    if (n < 20) return '12';
    if (n < 40) return '20';
    return '40';
  };
  ATS.matchesWatch = function (it) {
    var w = ATS.store.get('ats_watch', { cond: [], size: [] });
    if (w.cond.length && w.cond.indexOf(it.condition) === -1) return false;
    if (w.size.length && w.size.indexOf(ATS.sizeBucket(it.size)) === -1) return false;
    return true;
  };
  ATS.priceText = function (it) {
    if (!it.price) return { main: '価格はお問い合わせください', ask: true };
    var t = (it.price_from || it.condition === '中古') ? '〜' : '';
    return { main: ATS.yen(it.price) + t + '<small>税別／税込 ' + ATS.yen(ATS.tax(it.price)) + t + '</small>', sub: '' };
  };
  // 前回までに見た在庫IDと比べて、新しく掲載された在庫を記録する
  ATS.trackStock = function (items) {
    var ids = items.map(function (i) { return i.id; });
    var known = ATS.store.get('ats_known', null);
    var fresh = ATS.store.get('ats_new', []);
    if (known === null) {
      fresh = [];
    } else {
      ids.forEach(function (id) { if (known.indexOf(id) === -1 && fresh.indexOf(id) === -1) fresh.push(id); });
      fresh = fresh.filter(function (id) { return ids.indexOf(id) !== -1; });
    }
    ATS.store.set('ats_known', ids);
    ATS.store.set('ats_new', fresh);
    // 通知用（service worker から読むため Cache にも保存）
    if ('caches' in window) {
      caches.open('ats-meta').then(function (c) {
        return c.put(root + '__known.json', new Response(JSON.stringify(ids), { headers: { 'content-type': 'application/json' } }));
      }).catch(function () {});
    }
    return fresh;
  };
  ATS.newCount = function (items) {
    var fresh = ATS.store.get('ats_new', []);
    return items.filter(function (it) { return fresh.indexOf(it.id) !== -1 && ATS.matchesWatch(it); }).length;
  };

  /* ---------- LINE (only when configured) ---------- */
  if (CFG.lineUrl) {
    document.querySelectorAll('#line-box').forEach(function (b) { b.hidden = false; });
    document.querySelectorAll('#line-link').forEach(function (a) { a.href = CFG.lineUrl; });
  }

  /* ---------- install banner ---------- */
  var deferred;
  var installBox = document.getElementById('install-banner');
  var installBtn = document.getElementById('install-btn');
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  function showInstall() { if (installBox && !standalone) installBox.classList.remove('hide'); }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; showInstall(); });
  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferred) { location.href = root + 'install/'; return; }
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; });
    });
  }
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent || '') && !standalone) showInstall();
})();
