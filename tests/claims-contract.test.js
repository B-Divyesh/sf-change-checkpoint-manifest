import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const claims = JSON.parse(readFileSync(".factory/claims.json", "utf8"));
const browserTests = readFileSync("tests/claims.spec.js", "utf8");
const publicClaims = JSON.parse(
  readFileSync(".factory/public-claims.json", "utf8"),
);
const brief = JSON.parse(readFileSync(".factory/brief.json", "utf8"));

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

test("every public reliance-copy source is mapped to the claims inventory", () => {
  const ids = new Set(claims.map((claim) => claim.id));
  for (const [source, sourceClaims] of Object.entries(publicClaims)) {
    const copy = readFileSync(source, "utf8");
    assert.ok(copy.length > 0, `${source} must be present for claim review`);
    for (const id of sourceClaims) {
      assert.ok(ids.has(id), `${source} references unknown claim ${id}`);
    }
  }
  for (const id of [
    "web-demo-verify",
    "install-from-source",
    "markdown-summary",
    "cli-demo-isolated",
    "runtime-requirements",
  ])
    assert.ok(ids.has(id), `review-2 reliance claim ${id} is inventoried`);
});

test("the researched opportunity brief has the required review fields", () => {
  for (const field of [
    "product",
    "artifact_class",
    "summary",
    "audience",
    "job_to_be_done",
    "problem",
    "scope",
    "success_signals",
    "non_goals",
  ])
    assert.ok(brief[field], `brief is missing ${field}`);
  assert.equal(brief.artifact_class, "cli");
  assert.ok(Array.isArray(brief.scope.must) && brief.scope.must.length > 0);
  assert.ok(Array.isArray(brief.scope.must_not) && brief.scope.must_not.length > 0);
});
