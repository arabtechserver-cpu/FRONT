const assert = require('node:assert/strict');
const { buildApiIntegrationExamples } = require('./src/lib/api-integration-examples');
const examples = buildApiIntegrationExamples('https://store.example/api/v1/provider');
assert.deepEqual(examples.map(x => x.action), ['accountinfo', 'imeiservicelist', 'placeserverorder', 'getimeiorder']);
for (const example of examples) {
  assert.ok(example.command.includes('https://store.example/api/v1/provider'));
  assert.ok(example.command.includes('Authorization: Bearer YOUR_API_KEY'));
  assert.ok(example.command.includes('\n'));
  assert.ok(!example.command.includes('\\n'), 'Use actual newlines in copyable examples');
  const body = JSON.parse(example.command.match(/--data '(.*)'/)[1]);
  assert.deepEqual(body, example.body);
}
const order = examples.find(x => x.action === 'placeserverorder').body.parameters;
assert.deepEqual(order.customfield, {}, 'Fieldless services must not have invented required fields');
assert.equal(order.clientorderid, 'YOUR_UNIQUE_ORDER_ID');
assert.equal(examples.find(x => x.action === 'getimeiorder').body.parameters.ID, 'REFERENCEID_FROM_ORDER');
console.log('API integration example tests passed');
