const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const events = [], stored = [];
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/store-pages.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: exportsObject, Event,
  localStorage: { setItem: (key, value) => stored.push({ key, value }) },
  window: { dispatchEvent: event => events.push(event.type) }
});
const { navigationPages, notifyStorePagesChanged } = exportsObject;
const page = { id: 'actual-page', title: 'شحن ألعاب كود', slug: 'game-codes', enabled: true, archived: false, navbar: true, menu: true, order: 10 };

test('published managed pages appear while drafts and archived pages stay out of every navigation surface', () => {
  const pages = [page, { ...page, id: 'draft', enabled: false }, { ...page, id: 'archived', archived: true }];
  for (const surface of ['navbar', 'menu', 'footer', 'catalog']) {
    const result = navigationPages(pages, surface);
    assert.equal(result.length, 1); assert.equal(result[0].slug, 'game-codes');
  }
});

test('catalog lists published pages independently from header visibility and preserves service counts', () => {
  const result = navigationPages([{ ...page, navbar: false, menu: false, serviceCount: 7 }], 'catalog');
  assert.equal(result.length, 1); assert.equal(result[0].serviceCount, 7);
});
test('desktop and hamburger choices are independent and use the saved order without changing the input', () => {
  const pages = [page, { ...page, id: 'menu-only', navbar: false, order: 0 }, { ...page, id: 'desktop-only', menu: false, order: 1 }];
  assert.equal(navigationPages(pages, 'navbar').map(item => item.id).join(','), 'desktop-only,actual-page');
  assert.equal(navigationPages(pages, 'menu').map(item => item.id).join(','), 'menu-only,actual-page');
  assert.equal(pages[0].id, 'actual-page');
});
test('saving page changes signals the current window and other tabs to refresh their menu', () => {
  notifyStorePagesChanged();
  assert.equal(stored[0].key, 'store-pages-updated');
  assert.ok(Number(stored[0].value) > 0);
  assert.deepEqual(events, ['store-pages-updated']);
});
