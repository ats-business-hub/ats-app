(function () {
  var A = window.ATS, items = [];
  var w = A.store.get('ats_watch', { cond: [], size: [] });
  function sync(id, key) {
    var box = document.getElementById(id);
    box.querySelectorAll('input').forEach(function (i) { i.checked = w[key].indexOf(i.value) !== -1; });
    box.addEventListener('change', function () {
      w[key] = [].slice.call(box.querySelectorAll('input:checked')).map(function (i) { return i.value; });
      A.store.set('ats_watch', w); status(); A.toast('お知らせの条件を保存しました');
    });
  }
  function status() {
    var el = document.getElementById('w-status');
    if (!items.length) { el.textContent = ''; return; }
    var match = items.filter(A.matchesWatch).length;
    el.textContent = 'いま掲載中の在庫のうち、この条件に合うものは ' + match + ' 件です。';
  }
  sync('w-cond', 'cond'); sync('w-size', 'size');
  A.getJSON('stock.json').then(function (d) { items = d.items || []; A.trackStock(items); status(); }).catch(function () {});

  // Android の Chrome などで、ホーム画面に追加したアプリだけが使える定期確認（無料・サーバー不要）
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then(function (reg) {
      if (!('periodicSync' in reg)) return;
      var box = document.getElementById('push-box'), btn = document.getElementById('push-on');
      box.hidden = false;
      function on() { btn.textContent = '通知はオンになっています'; btn.disabled = true; }
      reg.periodicSync.getTags().then(function (tags) { if (tags.indexOf('ats-stock') !== -1 && Notification.permission === 'granted') on(); });
      btn.addEventListener('click', function () {
        Notification.requestPermission().then(function (p) {
          if (p !== 'granted') { A.toast('通知が許可されませんでした'); return; }
          return reg.periodicSync.register('ats-stock', { minInterval: 12 * 60 * 60 * 1000 }).then(function () {
            on(); A.toast('通知をオンにしました');
          }).catch(function () {
            A.toast('この端末では使えませんでした。ホーム画面に追加してから試してください');
          });
        });
      });
    });
  }
})();
