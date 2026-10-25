const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadStorefrontData } = require('./src/lib/storefront-data');

test('the configured catalog is authoritative even when it is empty', async () => {
  const previous = process.env.INTERNAL_API_URL;
  process.env.INTERNAL_API_URL = 'http://configured.test';
  const calls = [];
  try {
    const result = await loadStorefrontData('/api/dhru/services?view=pricing', Array.isArray, async (url, options) => {
      calls.push(url);
      assert.equal(options.cache, 'no-store');
      return { ok: true, json: async () => [] };
    });
    assert.deepEqual(result, []);
    assert.deepEqual(calls, ['http://configured.test/api/dhru/services?view=pricing']);
  } finally { if (previous === undefined) delete process.env.INTERNAL_API_URL; else process.env.INTERNAL_API_URL = previous; }
});
