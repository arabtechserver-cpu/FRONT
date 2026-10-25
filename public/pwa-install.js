/* Retain the browser's real install event even before React finishes loading. */
(function () {
  const state = window.__boraiAppInstall ||= { prompt: null, installed: false };
  if (state.listening) return;
  state.listening = true;
  window.addEventListener('beforeinstallprompt', function (event) {
    if (typeof event.prompt !== 'function') return;
    event.preventDefault();
    state.prompt = event;
    window.dispatchEvent(new Event('borai-install-ready'));
  });
  window.addEventListener('appinstalled', function () {
    state.prompt = null;
    state.installed = true;
    window.dispatchEvent(new Event('borai-install-ready'));
  });
})();
