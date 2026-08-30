import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/service/[id]/ServiceClient.js", import.meta.url),
  "utf8"
);

test("link fields are excluded from the IMEI-only sanitization path", () => {
  assert.doesNotMatch(
    source,
    /\(field\.name \|\| ""\)\.toLowerCase\(\)\.includes\("imei"\)/
  );
});

test("service client contains a dedicated IMEI field detector", () => {
  assert.match(source, /const isStrictImeiField =/);
  assert.match(source, /mentionsLink/);
  assert.match(source, /if \(mentionsLink\) return false;/);
});

test("all imei services get a required imei field even for api providers", () => {
  assert.doesNotMatch(source, /!isApiService && !hasImeiField/);
  assert.match(source, /if \(!hasImeiField && activeServiceType !== 'server' && activeServiceType !== 'remote'\) \{/);
});

test("api services can recover a missing provider imei field from service-level fields", () => {
  assert.match(source, /rawFields = hasPackageFields \? \[\.\.\.selectedPackage\.fields\] : \[\.\.\.serviceFields\]/);
  assert.match(source, /const packageHasStrictImeiField = rawFields\.some\(\(field\) => isStrictImeiField\(field\)\)/);
  assert.match(source, /if \(!packageHasStrictImeiField && serviceLevelImeiField\) \{/);
});
