(function () {
  var root = window.APP_ROOT || '../';
  var list = document.getElementById('jirei-list');
  var filters = document.getElementById('jirei-filters');
  var empty = document.getElementById('jirei-empty');
  var data = null;
  var cat = 'すべて';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function card(item) {
    var loc = (item.location && (item.title || '').indexOf(item.location) === -1) ? '（' + escapeHtml(item.location) + '）' : '';
    return (
      '<a class="card" href="' + escapeHtml(item.url) + '" rel="noopener" target="_blank">' +
        '<img src="' + root + item.image + '" alt="' + escapeHtml(item.title) + '" width="768" height="576" loading="lazy">' +
        '<div class="body">' +
          '<h3><span class="badge cat">' + escapeHtml(item.category) + '</span> ' + escapeHtml(item.title) + loc + '</h3>' +
          '<p>公式サイトで詳しく見る</p>' +
        '</div>' +
      '</a>'
    );
  }

  function render() {
    if (!data || !list) return;
    var items = data.items.filter(function (it) {
      return cat === 'すべて' || it.category === cat;
    });
    list.innerHTML = items.map(card).join('');
    if (empty) empty.hidden = items.length > 0;
  }

  function buildFilters(items) {
    if (!filters) return;
    var cats = ['すべて'];
    items.forEach(function (it) {
      if (it.category && cats.indexOf(it.category) === -1) cats.push(it.category);
    });
    filters.innerHTML = cats.map(function (s) {
      return '<button type="button" aria-pressed="' + (s === cat ? 'true' : 'false') + '">' + escapeHtml(s) + '</button>';
    }).join('');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      cat = b.textContent;
      Array.prototype.forEach.call(filters.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      render();
    });
  }

  fetch(root + 'cases.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      data = d;
      buildFilters(d.items || []);
      render();
    })
    .catch(function () {
      if (list) list.innerHTML = '<p class="err">施工事例を読み込めませんでした。</p>';
    });
})();
