const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { isStandalone, shouldOfferInstall, REMIND_AFTER_MS } = require('./src/lib/pwa-install');
const { requestNativeInstall } = require('./src/lib/app-install-controller');

test('browser install event survives loading before the application and is consumed once from the button gesture', async () => {
  const listeners = new Map();
  const browserWindow = {
    addEventListener(name, callback) { const list = listeners.get(name) || []; list.push(callback); listeners.set(name, list); },
    dispatchEvent(event) { for (const callback of listeners.get(event.type) || []) callback(event); }
  };
  vm.runInNewContext(fs.readFileSync('public/pwa-install.js', 'utf8'), { window: browserWindow, Event });
  let calls = 0, prevented = 0;
  let complete;
  const choice = new Promise(resolve => { complete = resolve; });
  const nativeEvent = { type: 'beforeinstallprompt', preventDefault() { prevented++; }, prompt() { calls++; return choice; } };
  browserWindow.dispatchEvent(nativeEvent);
  assert.equal(prevented, 1);
  assert.equal(browserWindow.__boraiAppInstall.prompt, nativeEvent);
  const pending = requestNativeInstall(browserWindow.__boraiAppInstall);
  assert.equal(calls, 1, 'native prompt must be invoked synchronously in the click handler');
  assert.equal(browserWindow.__boraiAppInstall.prompt, null);
  assert.equal((await requestNativeInstall(browserWindow.__boraiAppInstall)).outcome, 'unavailable');
  assert.equal(calls, 1, 'double clicks cannot open the same native prompt twice');
  complete({ outcome: 'accepted' });
  assert.equal((await pending).outcome, 'accepted');
  browserWindow.dispatchEvent({ type: 'appinstalled' });
  assert.equal(browserWindow.__boraiAppInstall.installed, true);
});

test('legacy browser choices, cancellation and failed native prompts never create fake installs', async () => {
  const legacy = { prompt: { prompt() {}, userChoice: Promise.resolve({ outcome: 'dismissed' }) } };
  assert.equal((await requestNativeInstall(legacy)).outcome, 'dismissed');
  const broken = { prompt: { prompt() { throw new Error('browser refused'); } } };
  await assert.rejects(requestNativeInstall(broken), /browser refused/);
  assert.equal(broken.prompt, null);
  assert.equal((await requestNativeInstall({ prompt: null })).outcome, 'unavailable');
});

test('early install capture also attaches when application state exists and avoids duplicate listeners', () => {
  const counts = {};
  const browserWindow = { __boraiAppInstall: { prompt: null, installed: false }, addEventListener(name) { counts[name] = (counts[name] || 0) + 1; } };
  const source = fs.readFileSync('public/pwa-install.js', 'utf8');
  vm.runInNewContext(source, { window: browserWindow, Event });
  vm.runInNewContext(source, { window: browserWindow, Event });
  assert.equal(counts.beforeinstallprompt, 1);
  assert.equal(counts.appinstalled, 1);
});

test('installed apps, checkout and dismissed invitations do not receive another install invitation', () => {
  assert.equal(isStandalone(true, false), true);
  assert.equal(isStandalone(false, true), true);
  assert.equal(isStandalone(false, undefined), false);
  const defaults = { installed: false, enabled: true, pathname: '/ar', remindAfter: null, now: 1000 };
  assert.equal(shouldOfferInstall(defaults), true);
  assert.equal(shouldOfferInstall({ ...defaults, installed: true }), false);
  assert.equal(shouldOfferInstall({ ...defaults, enabled: false }), false);
  assert.equal(shouldOfferInstall({ ...defaults, remindAfter: String(1000 + REMIND_AFTER_MS) }), false);
  assert.equal(shouldOfferInstall({ ...defaults, remindAfter: '999' }), true);
  for (const pathname of ['/ar/cart', '/en/wallet', '/ar/login', '/admin/providers', '/en/checkout']) {
    assert.equal(shouldOfferInstall({ ...defaults, pathname }), false, pathname);
  }
});

test('manifest has real branded install icons and stable app identity', () => {
  const source = ts.transpileModule(fs.readFileSync('src/app/manifest.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports });
  const manifest = exports.default();
  assert.equal(manifest.id, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.name.includes('BORAI'));
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(icon => icon.sizes === `${size}x${size}`);
    const png = fs.readFileSync('public' + icon.src);
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});

test('worker caches only public app assets and uses a neutral offline page without caching store/account responses', async () => {
  const handlers = {};
  const seeded = [], deleted = [], matched = [], network = [];
  let offline = false;
  const fresh = { status: 200, marker: 'fresh-live-response' };
  const fallback = { status: 200, marker: 'offline-page' };
  vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), {
    URL, Response,
    self: { location: { origin: 'https://borai.test' }, addEventListener: (name, handler) => { handlers[name] = handler; }, skipWaiting: async () => {}, clients: { claim: async () => {} } },
    caches: {
      open: async () => ({ addAll: async assets => seeded.push(...assets) }),
      keys: async () => ['unrelated-cache', 'borai-app-old', 'borai-app-v1'],
      delete: async name => { deleted.push(name); },
      match: async path => { matched.push(path); return fallback; }
    },
    fetch: async request => { network.push(request); if (offline) throw new Error('offline'); return fresh; }
  });
  let pending;
  handlers.install({ waitUntil: promise => { pending = promise; } }); await pending;
  assert.ok(seeded.includes('/offline.html'));
  assert.ok(seeded.every(path => path === '/offline.html' || path.startsWith('/borai-favicon-')));
  handlers.activate({ waitUntil: promise => { pending = promise; } }); await pending;
  assert.deepEqual(deleted, ['borai-app-old']);
  function request(path, method = 'GET') {
    let response;
    handlers.fetch({ request: { url: 'https://borai.test' + path, method, mode: 'navigate' }, respondWith: promise => { response = promise; } });
    return response;
  }
  for (const path of ['/api/orders', '/api/auth/login', '/admin', '/admin/settings']) assert.equal(request(path), undefined, path);
  assert.equal(request('/ar/cart', 'POST'), undefined);
  assert.equal(await request('/ar/wallet'), fresh);
  assert.equal(matched.length, 0);
  offline = true;
  assert.equal(await request('/ar/services'), fallback);
  assert.deepEqual(matched, ['/offline.html']);
});
