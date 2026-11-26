(function () {
  var A = window.ATS, PAGE = 12;
  var list = document.getElementById('list'), more = document.getElementById('more'), cats = document.getElementById('cats');
  var items = [], cat = '', shown = PAGE;
  function render() {
    var f = items.filter(function (it) { return !cat || it.category === cat; });
    list.innerHTML = f.slice(0, shown).map(function (it) {
      return '<a class="pc" href="' + A.esc(it.url) + '" target="_blank" rel="noopener">' +
        '<img src="' + A.esc(it.image) + '" alt="' + A.esc(it.title) + '" loading="lazy" width="660" height="440">' +
        '<div class="body"><div class="badges"><span class="badge cat">' + A.esc(it.category) + '</span></div>' +
        '<h3>' + A.esc(it.title) + '</h3></div></a>';
    }).join('');
    more.hidden = f.length <= shown;
  }
  cats.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    cats.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    cat = b.dataset.v; shown = PAGE; render();
  });
  more.addEventListener('click', function () { shown += PAGE; render(); });
  A.getJSON('cases.json').then(function (d) {
    items = d.items || [];
    var order = ['店舗', '事務所', 'ガレージ', '離れ・趣味部屋', '倉庫', '木造', 'その他'];
    var present = order.filter(function (c) { return items.some(function (i) { return i.category === c; }); });
    cats.innerHTML = '<button type="button" data-v="" aria-pressed="true">すべて</button>' +
      present.map(function (c) { return '<button type="button" data-v="' + c + '" aria-pressed="false">' + c + '</button>'; }).join('');
    render();
  }).catch(function () {
    list.innerHTML = '<p class="muted">施工事例を読み込めませんでした。<a href="https://www.ats-japan.com/gallery/">公式サイトの施工事例</a>をご覧ください。</p>';
  });
})();
