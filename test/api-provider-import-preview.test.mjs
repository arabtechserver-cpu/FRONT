import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/components/admin/tabs/ApiProvidersTab.js", import.meta.url),
  "utf8"
);

test("selective provider import starts with per-service import instead of grouped packages", () => {
  assert.match(
    source,
    /const \[importConfig, setImportConfig\] = useState\(\{ exchange_rate: 1, markup_percent: 10, group_as_packages: false \}\)/
  );
});

test("service cards render each service custom fields preview", () => {
  assert.match(source, /service\.customFields/);
  assert.match(source, /الحقول المطلوبة/);
  assert.match(source, /بدون حقول إضافية/);
});
