(function () {
  var form = document.getElementById('kaitori-form');
  if (!form) return;
  var input = document.getElementById('photos');
  var thumbs = document.getElementById('photo-thumbs');
  var sizeHint = document.getElementById('photo-size');
  var errBox = document.getElementById('form-error');
  var otherSize = document.getElementById('size-other');
  var sizeSelect = document.getElementById('item-size');
  var submitBtn = document.getElementById('submit-btn');
  var files = [];
  var MAX_FILES = 5;
  var MAX_TOTAL = 8 * 1024 * 1024; // stay under FormSubmit's 10MB

  function fmt(n) {
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  }
  function totalSize() {
    return files.reduce(function (s, f) { return s + f.size; }, 0);
  }
  function showErr(msg) {
    if (!errBox) return;
    errBox.textContent = msg || '';
    errBox.hidden = !msg;
  }

  if (sizeSelect && otherSize) {
    sizeSelect.addEventListener('change', function () {
      var show = sizeSelect.value === 'その他';
      otherSize.hidden = !show;
      otherSize.required = show;
      if (!show) otherSize.value = '';
    });
  }

  function renderThumbs() {
    if (!thumbs) return;
    thumbs.innerHTML = '';
    files.forEach(function (file, i) {
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.alt = '写真' + (i + 1);
      img.src = URL.createObjectURL(file);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', '写真' + (i + 1) + 'を削除');
      btn.textContent = '×';
      btn.addEventListener('click', function () {
        files.splice(i, 1);
        renderThumbs();
      });
      fig.appendChild(img);
      fig.appendChild(btn);
      thumbs.appendChild(fig);
    });
    if (sizeHint) {
      sizeHint.textContent = files.length
        ? '選択中 ' + files.length + '枚 ／ 合計 ' + fmt(totalSize()) + '（上限 約8MB・最大5枚）'
        : '全体・扉まわり・傷や錆が分かる写真があると査定が早く進みます。最大5枚。';
    }
  }

  function compressOne(file) {
    return new Promise(function (resolve, reject) {
      if (!file.type || !file.type.match(/^image\//)) {
        resolve(file);
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var maxEdge = 1280;
        var scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        var w = Math.max(1, Math.round(img.width * scale));
        var h = Math.max(1, Math.round(img.height * scale));
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        var q = 0.72;
        function toBlob(quality) {
          canvas.toBlob(function (blob) {
            if (!blob) { reject(new Error('compress')); return; }
            var name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
            resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', quality);
        }
        toBlob(q);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  }

  async function addFiles(list) {
    showErr('');
    var incoming = Array.prototype.slice.call(list || []);
    for (var i = 0; i < incoming.length; i++) {
      if (files.length >= MAX_FILES) {
        showErr('写真は最大5枚までです。');
        break;
      }
      var compressed = await compressOne(incoming[i]);
      if (totalSize() + compressed.size > MAX_TOTAL) {
        // try harder compression
        if (compressed.type === 'image/jpeg') {
          // accept if still too big after one pass: skip with message
          showErr('写真の合計サイズが上限を超えそうなため、一部を追加できませんでした。枚数を減らすか、別の写真をお試しください。');
          continue;
        }
      }
      files.push(compressed);
    }
    // If still over, drop from the end
    while (totalSize() > MAX_TOTAL && files.length) {
      files.pop();
      showErr('送信上限（合計約8MB）に合わせ、一部の写真を外しました。');
    }
    renderThumbs();
    if (input) input.value = '';
  }

  if (input) {
    input.addEventListener('change', function () {
      addFiles(input.files).catch(function () {
        showErr('写真の読み込みに失敗しました。別の画像でお試しください。');
      });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showErr('');
    if (!form.reportValidity()) return;
    if (files.length < 1) {
      showErr('写真を1枚以上添付してください。査定に必要です。');
      input && input.focus();
      return;
    }
    if (totalSize() > 10 * 1024 * 1024) {
      showErr('写真の合計が10MBを超えています。枚数を減らしてください。');
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = '送信しています…';

    // FormSubmit の ajax エンドポイントは写真を落とすため、multipart の通常POSTだけ使う
    var els = form.querySelectorAll('input, select, textarea');
    var native = document.createElement('form');
    native.method = 'POST';
    native.enctype = 'multipart/form-data';
    native.action = 'https://formsubmit.co/cff27695889a01ffac9117cbcf20dfd9';
    native.style.display = 'none';
    function hidden(name, value) {
      var i = document.createElement('input');
      i.type = 'hidden';
      i.name = name;
      i.value = value;
      native.appendChild(i);
    }
    Array.prototype.forEach.call(els, function (el) {
      if (!el.name || el.type === 'file' || el.disabled) return;
      if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
      hidden(el.name, el.value);
    });
    hidden('写真枚数', String(files.length));
    hidden('_subject', '【買い取り依頼】ATSアプリから');
    hidden('_template', 'table');
    hidden('_captcha', 'false');
    hidden('_next', new URL('../thanks/', location.href).href);
    files.forEach(function (f, i) {
      var dt = new DataTransfer();
      dt.items.add(f);
      var fi = document.createElement('input');
      fi.type = 'file';
      fi.name = 'photo_' + (i + 1);
      fi.files = dt.files;
      native.appendChild(fi);
    });
    document.body.appendChild(native);
    native.submit();
  });

  renderThumbs();
})();
