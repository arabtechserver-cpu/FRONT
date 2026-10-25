const { test } = require('node:test');
const assert = require('node:assert/strict');
const { providerPackageKey, selectImportServices, toggleVisiblePackageSelection } = require('./src/lib/provider-import-selection');

test('import uses the displayed refined package rather than a shared raw group', () => {
  const services = [
    { id: 'a', name: 'Free Fire 110', groupName: 'General', apiServiceType: 'topups' },
    { id: 'b', name: 'PUBG 60 UC', groupName: 'General', apiServiceType: 'topups' },
    { id: 'c', name: 'Software service', groupName: 'General', apiServiceType: 'server' }
  ];
  const selected = providerPackageKey(services[0]);
  const result = selectImportServices(services, [selected]);
  assert.ok(result.some(service => service.id === 'a'));
  assert.deepEqual(result.map(service => service.id), ['a']);
  assert.ok(!result.some(service => service.id === 'c'));
  assert.deepEqual(selectImportServices(services, []), []);
});

test('selecting the visible search results preserves choices from another section', () => {
  assert.deepEqual(new Set(toggleVisiblePackageSelection(['hidden-choice', 'a'], ['a', 'b'])), new Set(['hidden-choice', 'a', 'b']));
  assert.deepEqual(toggleVisiblePackageSelection(['hidden-choice', 'a', 'b'], ['a', 'b']), ['hidden-choice']);
  assert.deepEqual(toggleVisiblePackageSelection(['hidden-choice'], []), ['hidden-choice']);
});


test('identically named packages in two explicit categories remain separate', () => {
  const services = [
    { id: 'id-topup', name: 'Package A', groupName: 'Shared', apiServiceType: 'topups' },
    { id: 'id-code', name: 'Package B', groupName: 'Shared', apiServiceType: 'gamecodes' }
  ];
  assert.notEqual(providerPackageKey(services[0]), providerPackageKey(services[1]));
  assert.deepEqual(selectImportServices(services, [providerPackageKey(services[0])]).map(service => service.id), ['id-topup']);
});
