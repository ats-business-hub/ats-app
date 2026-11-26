(function () {
  var A = window.ATS, R = A.root, PAGE = 12;
  var list = document.getElementById('list'), more = document.getElementById('more');
  var state = { cond: '', size: '', sort: 'new', shown: PAGE }, items = [], fresh = [];

  function card(it) {
    var p = A.priceText(it), isNew = fresh.indexOf(it.id) !== -1;
    var badges = '<span class="badge ' + (it.condition === '中古' ? 'used' : 'cat') + '">' + A.esc(it.condition || 'コンテナ') + '</span>' +
      (it.size ? '<span class="badge cat">' + A.esc(it.size) + '</span>' : '') +
      (isNew ? '<span class="badge new">NEW</span>' : '');
    return '<article class="pc" id="i' + it.id + '">' +
      (it.image ? '<img src="' + A.esc(it.image) + '" alt="' + A.esc(it.title) + '" loading="lazy" width="660" height="440">' : '') +
      '<div class="body"><div class="badges">' + badges + '</div>' +
      '<h3>' + A.esc(it.title) + '</h3><div class="price' + (p.ask ? ' ask' : '') + '">' + p.main + '</div>' +
      '<div class="acts"><a class="go" href="' + A.esc(it.url) + '" target="_blank" rel="noopener">詳しく見る</a>' +
      (it.price ? '<a class="est" href="' + R + 'mitsumori/?item=' + it.id + '">これで見積もり</a>' : '<a class="est" href="tel:0120355272">電話で聞く</a>') + '</div></div></article>';
  }
  function render() {
    var f = items.filter(function (it) {
      return (!state.cond || it.condition === state.cond) && (!state.size || A.sizeBucket(it.size) === state.size);
    });
    if (state.sort !== 'new') {
      f = f.slice().sort(function (a, b) {
        var x = a.price || (state.sort === 'low' ? 1e12 : -1), y = b.price || (state.sort === 'low' ? 1e12 : -1);
        return state.sort === 'low' ? x - y : y - x;
      });
    }
    document.getElementById('count').textContent = f.length + ' 件';
    list.innerHTML = f.length ? f.slice(0, state.shown).map(card).join('') : '<p class="muted">条件に合う在庫がありません。お電話でもお探しします。</p>';
    more.hidden = f.length <= state.shown;
  }
  function bind(id, key) {
    var g = document.getElementById(id);
    g.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      state[key] = b.dataset.v; state.shown = PAGE; render();
    });
  }
  bind('f-cond', 'cond'); bind('f-size', 'size');
  document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; state.shown = PAGE; render(); });
  more.addEventListener('click', function () { state.shown += PAGE; render(); });

  A.getJSON('stock.json').then(function (d) {
    items = d.items || [];
    A.trackStock(items);
    fresh = A.store.get('ats_new', []);
    // 直接リンク（#i123）で来たときは全件表示してその商品へ
    var m = location.hash.match(/^#i(\d+)$/);
    if (m) state.shown = items.length;
    render();
    if (m) { var el = document.getElementById('i' + m[1]); if (el) el.scrollIntoView({ block: 'start' }); }
    document.getElementById('updated').textContent = '公式サイトの掲載内容から自動で更新しています（最終更新 ' + (d.updated || '') + '）。';
    // 一覧を見たら NEW の印は次回から外す
    window.addEventListener('pagehide', function () { A.store.set('ats_new', []); });
  }).catch(function () {
    list.innerHTML = '<p class="muted">在庫を読み込めませんでした。<a href="https://www.ats-japan.com/items/">公式サイトの在庫一覧</a>をご覧ください。</p>';
  });
})();
