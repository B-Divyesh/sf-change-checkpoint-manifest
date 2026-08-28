import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const claims = JSON.parse(readFileSync(".factory/claims.json", "utf8"));
const browserTests = readFileSync("tests/claims.spec.js", "utf8");

test("every listed visitor claim has one executable claim tag", () => {
  const ids = claims.map((claim) => claim.id);
  assert.equal(new Set(ids).size, ids.length, "claim IDs must be unique");

  for (const claim of claims) {
    assert.match(
      claim.test,
      new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`),
      `${claim.id} command filters its own tag`,
    );
    const tags = browserTests.match(
      new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`, "g"),
    );
    assert.equal(tags?.length, 1, `${claim.id} must have exactly one test tag`);
  }
});
