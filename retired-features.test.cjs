const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isRetiredPagePath, isRetiredApiPath } = require('./src/lib/retired-features');
test('retired subscriptions and content pages stay inaccessible while hero videos and shopping remain available', () => {
  for (const path of ['/admin/videos', '/admin/articles', '/admin/blog', '/admin/newsletter', '/ar/videos/course', '/en/blog/article', '/ar/news', '/newsletter']) assert.equal(isRetiredPagePath(path), true, path);
  for (const path of ['/videos/hero-showcase.mp4', '/ar/services', '/admin/users', '/ar/register', '/ar/wallet']) assert.equal(isRetiredPagePath(path), false, path);
  for (const path of ['newsletter/subscribe', 'newsletter/broadcast', 'blog/posts', 'videos/series', 'dhru/services/notify']) assert.equal(isRetiredApiPath(path), true, path);
  for (const path of ['auth/register', 'transactions', 'wallet/paypal/capture-order', 'dhru/services']) assert.equal(isRetiredApiPath(path), false, path);
});
