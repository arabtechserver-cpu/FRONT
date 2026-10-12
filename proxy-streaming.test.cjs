const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { NextRequest } = require('next/server');
function loadRoute(relative) {
  const filename = path.resolve(relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename; loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(code, filename); return loaded.exports;
}
async function verifyStream(route, parts, fallback = false) {
  let controller, ended = false, calls = 0;
  const body = new ReadableStream({ start(c) { controller = c; c.enqueue(new TextEncoder().encode('first')); } });
  const upstream = new Response(body, { headers: { 'content-encoding': 'gzip', 'content-length': '9999', 'content-type': 'application/octet-stream', 'set-cookie': 'session=test; HttpOnly' } });
  global.fetch = async (url, opts) => {
    calls++;
    if (parts[0] === 'probe') assert.equal(opts.headers.get('authorization'), 'Bearer test');
    if (fallback && calls === 1) return new Response(null, { status: 404 });
    return upstream;
  };
  const request = new NextRequest('http://localhost/' + parts.join('/'), { headers: { authorization: 'Bearer test' } });
  let timer;
  try {
    const response = await Promise.race([route.GET(request, { params: Promise.resolve({ path: parts }) }), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Proxy waited for complete upstream body')), 1000); })]);
    clearTimeout(timer);
    assert.equal(ended, false);
    assert.equal(response.headers.get('content-encoding'), null);
    assert.equal(response.headers.get('content-length'), null);
    assert.equal(response.headers.get('set-cookie'), 'session=test; HttpOnly');
    const reader = response.body.getReader();
    assert.equal(new TextDecoder().decode((await reader.read()).value), 'first');
    controller.enqueue(new TextEncoder().encode('last')); controller.close(); ended = true;
    assert.equal(new TextDecoder().decode((await reader.read()).value), 'last');
    assert.equal((await reader.read()).done, true);
    assert.equal(calls, fallback ? 2 : 1);
  } finally { clearTimeout(timer); if (!ended) { controller.close(); ended = true; } }
}
async function main() {
  const originalFetch = global.fetch;
  try {
    const api = loadRoute('src/app/api/[...path]/route.ts');
    const uploads = loadRoute('src/app/uploads/[...path]/route.ts');
    await verifyStream(api, ['probe']);
    global.fetch = async () => new Response(null, { status: 204 });
    assert.equal((await api.GET(new NextRequest('http://localhost/api/probe'), { params: Promise.resolve({ path: ['probe'] }) })).status, 204);
    await verifyStream(uploads, ['image.png']);
    await verifyStream(uploads, ['fallback.png'], true);
    global.fetch = async () => { throw new Error('Receipt guard must run before fetch'); };
    assert.equal((await uploads.GET(new NextRequest('http://localhost/uploads/receipt.png'), { params: Promise.resolve({ path: ['receipt.png'] }) })).status, 403);
    console.log('PASS: API and image streaming before upstream completion, fallback streaming, decompression headers, authentication, cookies, empty response, receipt guard');
  } finally { global.fetch = originalFetch; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
