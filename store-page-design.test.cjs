const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function loadComponent(path, extra = {}) {
  const result = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports: result.exports, require: name => {
    if (extra[name]) return extra[name];
    if (name.endsWith('.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (name === 'next/link') return { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) };
    if (name === 'lucide-react') return new Proxy({}, { get: (_, icon) => props => React.createElement('svg', { className: props.className, 'data-icon': String(icon) }) });
    if (name === '@/utils/cleanHtml') return { cleanHtmlToText: value => String(value || '') };
    if (name === '@/lib/service-price') return require('./src/lib/service-price');
    if (name === '@/lib/provider-service-types') return require('./src/lib/provider-service-types');
    if (name === '@/components/StoreNavigationProvider') return { useStoreNavigation: () => [{ id: 'p1', slug: 'game-codes', title: 'شحن العاب كود', enabled: true, order: 1, serviceCount: 2 }] };
    if (name === '@/lib/store-pages') return loadComponent('src/lib/store-pages.ts');
    return require(name);
  } });
  return result.exports;
}
const client = loadComponent('src/app/(main)/[lang]/services/ServicesClient.tsx');
const wrapper = loadComponent('src/components/StorePageCatalog.tsx', { '@/app/(main)/[lang]/services/ServicesClient': client }).default;
function render(categories) {
  return renderToStaticMarkup(React.createElement(wrapper, { lang: 'ar', page: { id: 'p1', slug: 'game-codes', title: 'صفحة الباقات المختارة', description: 'الخدمات المحددة لهذه الصفحة' }, categories }));
}
const service = { id: 'chosen', name: 'Selected remote service', groupName: 'Selected Tools', apiServiceType: 'remote', finalPrice: 8, isActive: true };

test('managed pages use the storefront hero, destination cards and catalog without dropping selected non-game services', () => {
  const html = render([{ id: 'cat-a', name: 'Remote Service', services: [service] }]);
  assert.ok(html.includes('class="hero '));
  assert.ok(html.includes('class="heroArt"'));
  assert.ok(html.includes('class="productGrid"'));
  assert.ok(html.includes('صفحة الباقات المختارة'));
  assert.ok(html.includes('Selected Tools'));
  assert.ok(html.includes('خدمات عن بُعد'));
  assert.ok(html.includes('1 باقة ضمن 1 مجموعة'));
  assert.ok(html.includes('href="/ar/pages/game-codes#gaming-catalog" aria-current="page"'));
  assert.ok(html.includes('أنواع الخدمات في هذه الصفحة'));
  assert.ok(!html.includes('/product/selected-tools'), 'managed cards cannot link to invented product pages');
});

test('full storefront lists managed pages with counts and includes device services using real ordering controls', () => {
  const html = renderToStaticMarkup(React.createElement(client.default, { lang: 'ar', dict: {}, initialServices: [{ id: 'cat-a', name: 'Remote Service', services: [service] }] }));
  assert.ok(html.includes('شحن العاب كود</span><small>2</small>'));
  assert.ok(html.includes('1 باقة ضمن 1 مجموعة'));
  assert.ok(html.includes('Selected Tools'));
  assert.ok(!html.includes('/product/selected-tools'));
  assert.ok(!html.includes('تصفية خدمات الصفحة'));
});
test('empty managed pages render an empty catalog immediately rather than a loader for the full store', () => {
  const html = render([]);
  assert.ok(html.includes('0 باقة ضمن 0 مجموعة'));
  assert.ok(!html.includes('جاري تجهيز الكتالوج'));
  assert.ok(!html.includes('جاري تحميل الألعاب والبطاقات'));
});
test('identically named packages in different categories stay separate and inactive services are excluded', () => {
  const html = render([
    { id: 'cat-a', name: 'Remote Service', services: [service, { ...service, id: 'hidden', isActive: false }] },
    { id: 'cat-b', name: 'IMEI Service', services: [{ ...service, id: 'device', apiServiceType: 'imei' }] }
  ]);
  assert.ok(html.includes('2 باقة ضمن 2 مجموعة'));
  assert.ok(html.includes('خدمات الأجهزة'));
});
