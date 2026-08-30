import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const stylesPath = new URL("../src/app/admin/dashboard/AdminDashboardClient.styles.js", import.meta.url);
const styles = fs.readFileSync(stylesPath, "utf8");

test("admin content uses the grid track width without padding overflow", () => {
  const premiumContent = styles.match(/\.premium-content\s*\{([\s\S]*?)\n\s*\}/)?.[1] || "";

  assert.match(premiumContent, /box-sizing:\s*border-box/);
  assert.match(premiumContent, /max-width:\s*100%/);
});

test("admin dashboard keeps its sidebar and content tracks within the viewport", () => {
  assert.match(styles, /grid-template-columns:\s*minmax\(0,\s*280px\)\s+minmax\(0,\s*1fr\)/);
  assert.match(styles, /\.admin-main-content\s*\{[\s\S]*?box-sizing:\s*border-box/);
});
