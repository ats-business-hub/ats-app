(function () {
  var A = window.ATS, $ = function (id) { return document.getElementById(id); };
  function memo() {
    return '【買い取り査定の依頼（アプリから）】\n' +
      '品目：' + $('k-type').value + '\n' +
      'サイズ：' + $('k-size').value + '\n' +
      '数量：' + ($('k-qty').value || '1') + '\n' +
      '置いてある場所：' + ($('k-pref').value || '（未入力）') + '\n' +
      '状態：' + $('k-cond').value + '\n' +
      '搬出の条件・その他：' + ($('k-note').value || '（なし）');
  }
  $('k-copy').addEventListener('click', function () {
    A.copy(memo()).then(function (ok) { A.toast(ok ? 'メモをコピーしました。フォームの本文に貼り付けてください' : 'コピーできませんでした'); });
  });
  $('k-go').addEventListener('click', function (e) {
    e.preventDefault();
    var href = this.href;
    A.copy(memo()).then(function (ok) {
      if (ok) A.toast('メモをコピーしました。フォームの本文に貼り付けてください');
      setTimeout(function () { location.href = href; }, ok ? 1200 : 0);
    });
  });
})();
