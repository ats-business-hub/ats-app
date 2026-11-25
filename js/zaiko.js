(function () {
  var root = window.APP_ROOT || '../';
  var list = document.getElementById('zaiko-list');
  var notice = document.getElementById('zaiko-notice');
  var filters = document.getElementById('zaiko-filters');
  var empty = document.getElementById('zaiko-empty');
  var data = null;
  var size = 'すべて';

  function card(item) {
    var img = root + item.image;
    var badge = item.sample
      ? '<span class="badge sample">サンプル</span> '
      : '<span class="badge cat">入荷</span> ';
    var price = item.price
      ? '<p class="price-line">' + escapeHtml(item.price) + ' <span class="muted">（税別）</span></p>'
      : '<p class="muted">' + escapeHtml(item.price_note || '価格はお問い合わせください') + '</p>';
    var loc = item.location ? '<p>' + escapeHtml(item.location) + '</p>' : '';
    return (
      '<article class="card">' +
        '<img src="' + img + '" alt="' + escapeHtml(item.title) + '" width="600" height="450" loading="lazy">' +
        '<div class="body">' +
          '<h3>' + badge + escapeHtml(item.title) + '</h3>' +
          '<p>' + escapeHtml(item.size) + ' ／ ' + escapeHtml(item.type) + '</p>' +
          '<p>' + escapeHtml(item.condition || '') + '</p>' +
          loc + price +
        '</div>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    if (!data || !list) return;
    var items = data.items.filter(function (it) {
      return size === 'すべて' || it.size === size;
    });
    list.innerHTML = items.map(card).join('');
    if (empty) empty.hidden = items.length > 0;
  }

  function buildFilters(items) {
    if (!filters) return;
    var sizes = ['すべて'];
    items.forEach(function (it) {
      if (it.size && sizes.indexOf(it.size) === -1) sizes.push(it.size);
    });
    filters.innerHTML = sizes.map(function (s) {
      return '<button type="button" aria-pressed="' + (s === size ? 'true' : 'false') + '">' + escapeHtml(s) + '</button>';
    }).join('');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      size = b.textContent;
      Array.prototype.forEach.call(filters.querySelectorAll('button'), function (x) {
        x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
      });
      render();
    });
  }

  fetch(root + 'inventory.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      data = d;
      if (notice && d.notice) notice.textContent = d.notice;
      buildFilters(d.items || []);
      render();
    })
    .catch(function () {
      if (notice) notice.textContent = '在庫データを読み込めませんでした。通信環境をご確認のうえ、再読み込みしてください。';
    });
})();
