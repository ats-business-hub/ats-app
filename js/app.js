(function () {
  var root = document.documentElement.getAttribute('data-root') || './';
  window.APP_ROOT = root;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(root + 'sw.js').catch(function () {});
    });
  }

  var deferred;
  var installBox = document.getElementById('install-banner');
  var installBtn = document.getElementById('install-btn');
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  function showInstall(mode) {
    if (!installBox || standalone) return;
    installBox.classList.add('show');
    installBox.dataset.mode = mode || '';
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showInstall('prompt');
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', function () {
      if (!deferred) {
        location.href = root + 'install/';
        return;
      }
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; });
    });
  }

  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/i.test(ua);
  if (isIOS && !standalone) showInstall('ios');

  var dismiss = document.getElementById('install-dismiss');
  if (dismiss) {
    dismiss.addEventListener('click', function () {
      if (installBox) installBox.classList.remove('show');
      try { sessionStorage.setItem('ats-install-dismissed', '1'); } catch (e) {}
    });
  }
  try {
    if (sessionStorage.getItem('ats-install-dismissed') && installBox) {
      installBox.classList.remove('show');
    }
  } catch (e) {}
})();
