const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getServicePrice, formatUsdPrice } = require('./src/lib/service-price');
test('public prices fall back from empty or stale zero fields without hiding paid services', () => {
  assert.equal(getServicePrice({ finalPrice: '', price: '12.5' }), 12.5);
  assert.equal(getServicePrice({ finalPrice: 0, price: 7 }), 7);
  assert.equal(getServicePrice({ credit: 10, margin: 2 }), 12);
  assert.equal(getServicePrice({ sellingPrice: '3.25' }), 3.25);
  assert.equal(getServicePrice({ price: 'Infinity' }), 0);
  assert.equal(getServicePrice({ price: -1 }), 0);
  assert.equal(formatUsdPrice(0.0015), '0.0015');
  assert.equal(formatUsdPrice(12.5), '12.50');
});
