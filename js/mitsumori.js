(function () {
  var A = window.ATS;
  // /price/ の公開価格（data/prices.json で自動更新。読めないときはこの値を使う）
  var P = {
    used_10ft: 298000, used_12ft: 288000, used_jr12ft: 235000, used_20ft: 320000, used_20ftHC: 498000, used_40ft: 360000, used_40ftHC: 580000,
    new_10ft: 598000, new_12ft: 648000, new_20ft: 398000, new_20ftHC: 548000, new_40ft: 768000, new_40ftHC: 788000
  };
  var SIZES = {
    new: [['10ft', '10ft'], ['12ft', '12ft'], ['20ft', '20ft'], ['20ftHC', '20ft<br>ハイキューブ'], ['40ft', '40ft'], ['40ftHC', '40ft<br>ハイキューブ']],
    used: [['10ft', '10ft'], ['12ft', '12ft'], ['jr12ft', '12ft<br>JRコンテナ'], ['20ft', '20ft'], ['20ftHC', '20ft<br>ハイキューブ'], ['40ft', '40ft'], ['40ftHC', '40ft<br>ハイキューブ']]
  };
  var PAINT = { '10': 50000, '12': 55000, '20': 65000, '40': 120000 };
  var OPTS = [
    { id: 'paint', name: '塗装（お好きな色に）', note: 'サイズで金額が変わります', type: 'sw' },
    { id: 'shutter', name: 'シャッター', note: '2,000×3,000mm', price: 175000, type: 'qty' },
    { id: 'door', name: '勝手口ドア', price: 135000, type: 'qty' },
    { id: 'window', name: '掃き出し窓', price: 135000, type: 'qty' },
    { id: 'kosimado', name: '腰窓', price: 88000, type: 'qty' },
    { id: 'elec', name: '電気工事（基本）', note: 'コンセント・照明など', price: 95000, type: 'sw' },
    { id: 'kakunin', name: '建築確認申請', note: '人が使う建物として設置する場合など', price: 350000, type: 'sw' }
  ];
  var AREAS = [
    ['yard', 'ヤードで引き取り（愛知県弥富市・積み込み無料）', 0],
    ['nagoya', '名古屋市内', 40000],
    ['aichi', '愛知県（名古屋市外）', 50000],
    ['tokai', '三重県・岐阜県・静岡県', 60000],
    ['kansai', '大阪府・神戸', 80000],
    ['other', 'その他の地域（別途お見積もり）', null]
  ];
  var CRANE = 50000; // 40ftの設置に必要なクレーン費用（公式サイト記載 5万〜5.8万円＋税）

  var st = { cond: 'new', size: '20ft', q: {}, area: 'nagoya', item: null };
  var $ = function (id) { return document.getElementById(id); };

  function sizeKey() { return st.cond + '_' + st.size; }
  function baseSize() { return st.size === 'jr12ft' ? '12' : st.size.replace(/ft.*/, ''); }
  function sizeLabel(k) { return { jr12ft: '12ft JRコンテナ', '20ftHC': '20ftハイキューブ', '40ftHC': '40ftハイキューブ' }[k] || k; }

  function renderSizes() {
    var list = SIZES[st.cond];
    if (!list.some(function (s) { return s[0] === st.size; })) st.size = '20ft';
    $('sizes').innerHTML = list.map(function (s) {
      return '<label><input type="radio" name="size" value="' + s[0] + '"' + (s[0] === st.size ? ' checked' : '') + '><span>' + s[1] + '</span></label>';
    }).join('');
  }
  function renderOpts() {
    $('opts').innerHTML = OPTS.map(function (o) {
      var price = o.id === 'paint' ? PAINT[baseSize()] : o.price;
      var ctl = o.type === 'qty'
        ? '<div class="qty"><button type="button" data-d="-1" data-o="' + o.id + '" aria-label="' + o.name + 'を減らす">−</button><output id="q-' + o.id + '">' + (st.q[o.id] || 0) + '</output><button type="button" data-d="1" data-o="' + o.id + '" aria-label="' + o.name + 'を増やす">＋</button></div>'
        : '<input class="sw" type="checkbox" data-o="' + o.id + '" aria-label="' + o.name + '"' + (st.q[o.id] ? ' checked' : '') + '>';
      return '<div class="opt"><div class="nm">' + o.name + '<small>' + A.yen(price) + '〜' + (o.type === 'qty' ? '／1か所' : '') + (o.note ? '　' + o.note : '') + '</small></div>' + ctl + '</div>';
    }).join('');
  }
  function lines() {
    var L = [], fromItem = st.item;
    if (fromItem) {
      L.push([fromItem.title, fromItem.price, !!(fromItem.price_from || fromItem.condition === '中古')]);
    } else {
      var p = P[sizeKey()];
      var tilde = !(st.cond === 'new' && st.size === '20ft');
      L.push([(st.cond === 'new' ? '新品' : '中古') + ' ' + sizeLabel(st.size) + ' 本体', p, tilde]);
    }
    OPTS.forEach(function (o) {
      var n = st.q[o.id] || 0; if (!n) return;
      var price = o.id === 'paint' ? PAINT[baseSize()] : o.price;
      L.push([o.name + (o.type === 'qty' ? ' ×' + n : ''), price * n, true]);
    });
    var a = AREAS.filter(function (x) { return x[0] === st.area; })[0];
    if (a[0] === 'yard') L.push(['ヤードで引き取り（積み込み無料）', 0, false]);
    else if (a[2] == null) L.push(['運送費（' + a[1].replace(/（.*）/, '') + '）', null, false]);
    else L.push(['運送費（' + a[1] + '）', a[2], true]);
    if (a[0] !== 'yard' && baseSize() === '40') L.push(['設置用クレーン（40ft）', CRANE, true]);
    return L;
  }
  function calc() {
    var L = lines(), sum = 0, unknown = false, tilde = false;
    L.forEach(function (l) { if (l[1] == null) unknown = true; else sum += l[1]; if (l[2]) tilde = true; });
    var t = tilde ? '〜' : '';
    $('t-ex').textContent = A.yen(sum) + t + (unknown ? '＋送料' : '');
    $('t-in').textContent = A.yen(A.tax(sum)) + t + (unknown ? '＋送料' : '');
    $('lines').innerHTML = L.map(function (l) {
      return '<tr><td>' + A.esc(l[0]) + '</td><td>' + (l[1] == null ? '別途お見積もり' : (l[1] === 0 ? '無料' : A.yen(l[1]) + (l[2] ? '〜' : ''))) + '</td></tr>';
    }).join('') + '<tr><td>合計（税別）</td><td>' + $('t-ex').textContent + '</td></tr><tr><td>合計（税込）</td><td>' + $('t-in').textContent + '</td></tr>';
    var note = '';
    if (!st.item && baseSize() === '40') note = '40ftは10t車かトレーラーで運び、設置にはクレーンが必要です。';
    $('size-note').textContent = note;
    var text = summary(L);
    $('send-mail').href = 'mailto:' + A.cfg.mail + '?subject=' + encodeURIComponent('コンテナの見積もり相談（アプリから）') + '&body=' + encodeURIComponent(text + '\n\nお名前：\nお電話番号：\n設置場所（住所）：\n');
    return text;
  }
  function summary(L) {
    return '【アプリのかんたん見積もり】\n' + L.map(function (l) {
      return '・' + l[0] + '：' + (l[1] == null ? '別途お見積もり' : (l[1] === 0 ? '無料' : A.yen(l[1]) + (l[2] ? '〜' : '')));
    }).join('\n') + '\n合計の目安：' + $('t-ex').textContent + '（税別）／' + $('t-in').textContent + '（税込）\n※「〜」は目安の金額です。正式なお見積もりをお願いします。';
  }

  function init() {
    $('area').innerHTML = AREAS.map(function (a) {
      return '<option value="' + a[0] + '"' + (a[0] === st.area ? ' selected' : '') + '>' + a[1] + (a[2] ? '　' + A.yen(a[2]) + '〜' : '') + '</option>';
    }).join('');
    renderSizes(); renderOpts(); calc();
  }

  document.getElementById('est').addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'cond') { st.cond = t.value; renderSizes(); renderOpts(); }
    else if (t.name === 'size') { st.size = t.value; renderOpts(); }
    else if (t.classList.contains('sw')) st.q[t.dataset.o] = t.checked ? 1 : 0;
    else if (t.id === 'area') st.area = t.value;
    calc();
  });
  $('opts').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-o]'); if (!b) return;
    var id = b.dataset.o, n = Math.max(0, Math.min(9, (st.q[id] || 0) + Number(b.dataset.d)));
    st.q[id] = n; $('q-' + id).textContent = n; calc();
  });
  $('send-contact').addEventListener('click', function () {
    var text = calc();
    A.copy(text).then(function (ok) {
      A.toast(ok ? '見積もり内容をコピーしました。フォームの本文に貼り付けてください' : 'コピーできませんでした。メールで送るをお使いください');
      setTimeout(function () { location.href = A.cfg.contactUrl; }, ok ? 1400 : 2600);
    });
  });

  A.getJSON('prices.json').then(function (d) {
    (d.items ? Object.keys(d.items) : []).forEach(function (k) { if (d.items[k] > 0) P[k] = d.items[k]; });
  }).catch(function () {}).then(function () {
    var m = location.search.match(/[?&]item=(\d+)/);
    if (!m) return init();
    return A.getJSON('stock.json').then(function (d) {
      var it = (d.items || []).filter(function (x) { return String(x.id) === m[1]; })[0];
      if (it && it.price) {
        st.item = it; st.cond = it.condition === '中古' ? 'used' : 'new';
        var sz = (it.size || '').replace('HC', 'HC');
        var all = SIZES[st.cond].map(function (s) { return s[0]; });
        st.size = all.indexOf(sz) !== -1 ? sz : (all.indexOf(sz.replace('HC', '')) !== -1 ? sz.replace('HC', '') : (parseFloat(sz) <= 10 ? '10ft' : (parseFloat(sz) < 20 ? '12ft' : '20ft')));
        var box = $('from-item');
        box.innerHTML = '<strong>' + A.esc(it.title) + '</strong> の本体価格で計算しています。<br><a href="./">サイズから選び直す</a>';
        box.hidden = false;
        document.querySelectorAll('#est fieldset')[0].hidden = true;
        document.querySelectorAll('#est fieldset')[1].hidden = true;
      } else if (it) {
        A.toast('この商品は価格をお問い合わせいただく商品です');
      }
      init();
    }).catch(init);
  });
})();
