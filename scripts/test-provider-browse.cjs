const assert = require('node:assert/strict');
const { test } = require('node:test');
const { loadProviderServicesForBrowse } = require('../src/lib/provider-service-browse');

test('an empty stored catalog stays in the stored view', async () => {
  const calls = [];
  const result = await loadProviderServicesForBrowse('empty', async (url) => {
    calls.push(url);
    return { ok: true, data: { success: true, services: [] } };
  }, 'stored');
  assert.equal(result.source, 'stored');
  assert.deepEqual(result.services, []);
  assert.deepEqual(calls, ['/api/providers/empty/services']);
});

test('cancelling the stored request does not start a remote fallback', async () => {
  const calls = [];
  await assert.rejects(loadProviderServicesForBrowse('cancelled', async (url) => {
    calls.push(url);
    throw Object.assign(new Error('Cancelled'), { name: 'AbortError' });
  }), { name: 'AbortError' });
  assert.deepEqual(calls, ['/api/providers/cancelled/services']);
});

test('a live provider failure retains its diagnostic message', async () => {
  await assert.rejects(loadProviderServicesForBrowse('error', async () => ({
    ok: false, data: { error: 'Provider API unavailable' }
  }), 'remote'), /Provider API unavailable/);
});
