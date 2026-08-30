import test from "node:test";
import assert from "node:assert/strict";
import { shouldObserveDomTranslations } from "../src/lib/i18nRuntime.mjs";

test("Arabic pages do not install an expensive DOM translation observer", () => {
  assert.equal(shouldObserveDomTranslations("ar"), false);
  assert.equal(shouldObserveDomTranslations("en"), true);
});
