const assert = require('node:assert/strict');
const { getBackendCandidates } = require('./src/lib/api-proxy-candidates');
const original = process.env.NODE_ENV;
try {
 process.env.NODE_ENV='production';
 assert.deepEqual(getBackendCandidates('http://old-cached:5000','http://old-internal:5000'),['https://api.borai.store']);
 assert.deepEqual(getBackendCandidates(null,'http://localhost:5000'),['https://api.borai.store']);
 process.env.NODE_ENV='development';
 const local=getBackendCandidates(null,'http://127.0.0.1:5000');
 assert.equal(local[0],'http://127.0.0.1:5000');
 assert.ok(local.includes('http://localhost:5000'));
 console.log('PASS: production excludes stale services; development supports local API.');
} finally { if(original===undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV=original; }
