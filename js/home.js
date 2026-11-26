(function () {
  var A = window.ATS, R = A.root;
  A.getJSON('stock.json').then(function (d) {
    var items = d.items || [];
    A.trackStock(items);
    var n = A.newCount(items);
    var bar = document.getElementById('newbar'), dot = document.getElementById('tile-new');
    if (n > 0) {
      bar.textContent = '前回見たあとに、新しい在庫が ' + n + ' 件掲載されました。見てみる →';
      bar.hidden = false;
      dot.textContent = 'NEW ' + n; dot.hidden = false;
    }
    var box = document.getElementById('home-stock');
    box.innerHTML = items.slice(0, 8).map(function (it) {
      var p = A.priceText(it);
      return '<a class="pc" href="' + R + 'zaiko/#i' + it.id + '">' +
        (it.image ? '<img src="' + A.esc(it.image) + '" alt="" loading="lazy" width="660" height="440">' : '') +
        '<div class="body"><h3>' + A.esc(it.title) + '</h3><div class="price' + (p.ask ? ' ask' : '') + '">' + p.main + '</div></div></a>';
    }).join('');
  }).catch(function () {
    document.getElementById('home-stock').innerHTML = '<p class="muted">在庫を読み込めませんでした。通信環境を確認して、もう一度開いてください。</p>';
  });
  A.getJSON('cases.json').then(function (d) {
    document.getElementById('home-cases').innerHTML = (d.items || []).slice(0, 8).map(function (it) {
      return '<a class="pc" href="' + A.esc(it.url) + '" target="_blank" rel="noopener">' +
        '<img src="' + A.esc(it.image) + '" alt="" loading="lazy" width="660" height="440">' +
        '<div class="body"><h3>' + A.esc(it.title) + '</h3></div></a>';
    }).join('');
  }).catch(function () {});
})();
